import { scValToNative } from "@stellar/stellar-sdk";
import Merchant from "../models/Merchant.js";
import Wallet from "../models/Wallet.js";
import PaymentSession from "../models/PaymentSession.js";
import Transaction from "../models/Transaction.js";
import Customer from "../models/Customer.js";
import { sorobanConfig } from "./stellar.config.js";
import {
  buildSorobanPaymentTransaction,
  submitSorobanSignedTransaction,
  waitForSorobanConfirmation,
} from "./transaction.service.js";
import { generateSorobanNonce } from "./wallet.service.js";
import { blockchainLogger } from "./logger.service.js";

const getFullSession = async (sessionId) => {
  const session = await PaymentSession.findOne({ sessionId });
  if (!session) {
    const err = new Error("Payment session not found");
    err.statusCode = 404;
    throw err;
  }

  if (session.status === "Consumed") {
    const err = new Error("Payment session has already been consumed");
    err.statusCode = 400;
    throw err;
  }

  if (session.status === "Expired") {
    const err = new Error("Payment session has expired");
    err.statusCode = 400;
    throw err;
  }

  const now = new Date();
  if (session.status === "Pending" && now > session.expiresAt) {
    session.status = "Expired";
    await session.save();
    const err = new Error("Payment session has expired");
    err.statusCode = 400;
    throw err;
  }

  const merchant = await Merchant.findById(session.merchant);
  if (!merchant) {
    const err = new Error("Merchant not found");
    err.statusCode = 404;
    throw err;
  }

  if (!merchant.isActive) {
    const err = new Error("Merchant account is inactive");
    err.statusCode = 400;
    throw err;
  }

  if (merchant.verificationStatus !== "Verified") {
    const err = new Error("Merchant is not verified");
    err.statusCode = 400;
    throw err;
  }

  const wallet = await Wallet.findById(session.wallet);
  if (!wallet) {
    const err = new Error("Wallet not found");
    err.statusCode = 404;
    throw err;
  }

  if (wallet.walletStatus !== "Verified") {
    const err = new Error("Merchant wallet is not verified");
    err.statusCode = 400;
    throw err;
  }

  if (!wallet.walletAddress) {
    const err = new Error("Merchant wallet has no address set");
    err.statusCode = 400;
    throw err;
  }

  return { session, merchant, wallet };
};

const getOrCreateCustomer = async (userId) => {
  if (!userId) return null;
  let customer = await Customer.findOne({ user: userId });
  if (!customer) {
    customer = await Customer.create({ user: userId });
  }
  return customer;
};

export const createSorobanPaymentIntent = async ({
  sessionId,
  payerAddress,
  amount,
  token,
  memo,
  reference,
  userId,
}) => {
  const { session, merchant, wallet } = await getFullSession(sessionId);

  const pending = await Transaction.findOne({
    paymentSession: session._id,
    blockchainType: "soroban",
    status: "Pending",
  });
  if (pending) {
    const err = new Error("A pending Soroban payment already exists for this session");
    err.statusCode = 409;
    throw err;
  }

  const tokenAddress = token || sorobanConfig.nativeTokenId;
  const nonce = generateSorobanNonce();

  const built = await buildSorobanPaymentTransaction({
    sourceAddress: payerAddress,
    payerAddress,
    merchantAddress: wallet.walletAddress,
    tokenAddress,
    amount: BigInt(Math.round(parseFloat(amount) * 10_000_000)),
    nonce,
    memo: memo || "",
    reference: reference || session.sessionId,
  });

  const customer = await getOrCreateCustomer(userId);
  const customerId = customer ? customer._id : null;

  const transaction = await Transaction.create({
    paymentSession: session._id,
    merchant: merchant._id,
    wallet: wallet._id,
    customer: customerId,
    payerAddress,
    receiverAddress: wallet.walletAddress,
    asset: "XLM",
    amount: amount.toString(),
    network: wallet.network,
    unsignedXDR: built.unsignedXDR,
    status: "Pending",
    blockchainType: "soroban",
    contractId: sorobanConfig.contractId,
    blockchainMeta: {
      nonce: Buffer.from(nonce).toString("hex"),
      tokenAddress,
      memo: memo || "",
      reference: reference || session.sessionId,
    },
  });

  const sessionObj = {
    sessionId: session.sessionId,
    status: session.status,
    expiresAt: session.expiresAt,
  };

  return {
    transactionId: transaction._id.toString(),
    unsignedTransactionXDR: built.unsignedXDR,
    network: wallet.network,
    expiresAt: session.expiresAt,
    receiverAddress: wallet.walletAddress,
    amount: amount.toString(),
    asset: "XLM",
    session: sessionObj,
    merchant: {
      businessName: merchant.businessName,
      category: merchant.category,
      logo: merchant.logo,
    },
  };
};

const updateCustomerStats = async (transaction) => {
  if (!transaction.customer) return;

  const amountNum = parseFloat(transaction.amount) || 0;
  const session = await PaymentSession.findById(transaction.paymentSession);

  if (session && session.merchant) {
    try {
      await Customer.findByIdAndUpdate(transaction.customer, {
        $inc: { paymentCount: 1, totalSpent: amountNum },
        $set: { lastPaymentAt: new Date() },
      });
    } catch (err) {
      console.error("Failed to update customer stats:", err.message);
    }
  }
};

export const submitSorobanPayment = async (transactionId, signedXDR, userId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  if (transaction.blockchainType !== "soroban") {
    const err = new Error("This transaction is not a Soroban payment");
    err.statusCode = 400;
    throw err;
  }

  if (transaction.status !== "Pending") {
    const err = new Error(
      `Transaction cannot be submitted. Current status: ${transaction.status}`
    );
    err.statusCode = 400;
    throw err;
  }

  let submissionResult;
  try {
    submissionResult = await submitSorobanSignedTransaction(signedXDR);
  } catch (error) {
    transaction.status = "Failed";
    transaction.signedXDR = signedXDR;
    transaction.blockchainMeta = {
      ...(transaction.blockchainMeta || {}),
      submissionError: error.message,
      submissionDetails: error.errorDetails || {},
    };
    await transaction.save();
    throw error;
  }

  transaction.transactionHash = submissionResult.hash;
  transaction.signedXDR = signedXDR;
  transaction.status = "Submitted";
  await transaction.save();

  const session = await PaymentSession.findById(transaction.paymentSession);
  if (session) {
    session.status = "Consumed";
    await session.save();
  }

  blockchainLogger.info("Soroban payment submitted", {
    transactionId: transaction._id.toString(),
    hash: submissionResult.hash,
  });

  return {
    transactionId: transaction._id.toString(),
    transactionHash: submissionResult.hash,
    status: transaction.status,
    network: transaction.network,
    confirmed: transaction.confirmed,
    ledger: transaction.ledger,
  };
};

export const verifySorobanPayment = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  if (transaction.blockchainType !== "soroban") {
    const err = new Error("This transaction is not a Soroban payment");
    err.statusCode = 400;
    throw err;
  }

  if (!transaction.transactionHash) {
    return {
      transactionId: transaction._id.toString(),
      status: transaction.status,
      confirmed: transaction.confirmed,
      message: "Transaction has not been submitted yet",
    };
  }

  if (transaction.confirmed) {
    return {
      transactionId: transaction._id.toString(),
      transactionHash: transaction.transactionHash,
      status: transaction.status,
      confirmed: true,
      ledger: transaction.ledger,
      confirmationTimestamp: transaction.confirmationTimestamp,
    };
  }

  if (transaction.status === "Failed" || transaction.status === "Expired") {
    return {
      transactionId: transaction._id.toString(),
      transactionHash: transaction.transactionHash,
      status: transaction.status,
      confirmed: false,
      ledger: transaction.ledger,
    };
  }

  try {
    const confirmation = await waitForSorobanConfirmation(transaction.transactionHash);

    if (confirmation.confirmed) {
      transaction.status = "Confirmed";
      transaction.ledger = confirmation.ledger;
      transaction.confirmed = true;
      transaction.confirmationTimestamp = confirmation.ledgerCloseTime
        ? new Date(confirmation.ledgerCloseTime)
        : new Date();
      await transaction.save();
    } else if (confirmation.status === "FAILED") {
      transaction.status = "Failed";
      await transaction.save();
    }

    return {
      transactionId: transaction._id.toString(),
      transactionHash: transaction.transactionHash,
      status: transaction.status,
      confirmed: transaction.confirmed,
      ledger: transaction.ledger,
      confirmationTimestamp: transaction.confirmationTimestamp,
      syncStatus: confirmation.status,
    };
  } catch (error) {
    return {
      transactionId: transaction._id.toString(),
      transactionHash: transaction.transactionHash,
      status: transaction.status,
      confirmed: false,
      message: error.message,
    };
  }
};
