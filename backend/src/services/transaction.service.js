import Transaction from "../models/Transaction.js";
import PaymentSession from "../models/PaymentSession.js";
import Merchant from "../models/Merchant.js";
import Wallet from "../models/Wallet.js";
import Customer from "../models/Customer.js";
import {
  buildPaymentTransaction,
  submitSignedTransaction as submitStellarTransaction,
  verifyTransaction as verifyStellarTransaction,
  parseSignedTransaction,
} from "./stellar.service.js";
import { stellarConfig } from "../config/stellar.js";

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

export const createPaymentIntent = async (sessionId, amount, asset, userId) => {
  const { session, merchant, wallet } = await getFullSession(sessionId);

  const existingIntent = await Transaction.findOne({
    paymentSession: session._id,
    status: "Pending",
  });

  if (existingIntent) {
    const err = new Error(
      "A pending payment intent already exists for this session"
    );
    err.statusCode = 409;
    throw err;
  }

  const unsignedXDR = await buildPaymentTransaction(
    wallet.walletAddress,
    wallet.walletAddress,
    amount,
    asset
  );

  const customer = await getOrCreateCustomer(userId);
  const customerId = customer ? customer._id : null;

  const transaction = await Transaction.create({
    paymentSession: session._id,
    merchant: merchant._id,
    wallet: wallet._id,
    customer: customerId,
    receiverAddress: wallet.walletAddress,
    asset,
    amount: amount.toString(),
    network: wallet.network,
    unsignedXDR,
    status: "Pending",
  });

  return {
    transactionId: transaction._id.toString(),
    unsignedTransactionXDR: unsignedXDR,
    network: wallet.network,
    expiresAt: session.expiresAt,
    receiverAddress: wallet.walletAddress,
    amount: amount.toString(),
    asset,
  };
};

const updateCustomerStats = async (transaction) => {
  if (!transaction.customer) return;

  try {
    const amountNum = parseFloat(transaction.amount) || 0;
    await Customer.findByIdAndUpdate(transaction.customer, {
      $inc: { paymentCount: 1, totalSpent: amountNum },
      $set: { lastPaymentAt: new Date() },
    });
  } catch (err) {
    console.error("Failed to update customer stats:", err.message);
  }
};

export const submitSignedTransaction = async (transactionId, signedXDR, userId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  if (transaction.status !== "Pending") {
    const err = new Error(
      `Transaction cannot be submitted. Current status: ${transaction.status}`
    );
    err.statusCode = 400;
    throw err;
  }

  let parsed;
  try {
    parsed = parseSignedTransaction(signedXDR);
  } catch {
    const err = new Error("Invalid signed XDR format");
    err.statusCode = 400;
    throw err;
  }

  const paymentOp = parsed.operations?.find((op) => op.type === 'payment');
  if (!paymentOp) {
    const err = new Error("Signed transaction must contain a payment operation");
    err.statusCode = 400;
    throw err;
  }

  const destination = paymentOp.destination?.toString() || paymentOp.destination;
  if (destination !== transaction.receiverAddress) {
    const err = new Error("Signed transaction destination does not match intent");
    err.statusCode = 400;
    throw err;
  }

  const parsedAmount = paymentOp.amount != null ? String(paymentOp.amount) : null;
  if (parsedAmount !== transaction.amount) {
    const err = new Error("Signed transaction amount does not match intent");
    err.statusCode = 400;
    throw err;
  }

  const parsedAsset = paymentOp.asset?.getCode ? paymentOp.asset.getCode() : (paymentOp.asset?.toString() || null);
  if (parsedAsset && parsedAsset !== transaction.asset) {
    const err = new Error("Signed transaction asset does not match intent");
    err.statusCode = 400;
    throw err;
  }

  let result;
  try {
    result = await submitStellarTransaction(signedXDR);
  } catch (error) {
    transaction.status = "Failed";
    transaction.signedXDR = signedXDR;
    if (error.response && error.response.data) {
      transaction.memo = error.response.data.extras?.result_xdr || null;
    }
    await transaction.save();

    const err = new Error(
      error.response?.data?.extras?.result_codes?.transaction ||
        error.message ||
        "Transaction submission failed"
    );
    err.statusCode = 400;
    throw err;
  }

  transaction.payerAddress = parsed.sourceAccount;
  transaction.transactionHash = result.hash;
  transaction.ledger = result.ledger;
  transaction.signedXDR = signedXDR;
  transaction.status = "Submitted";
  await transaction.save();

  const session = await PaymentSession.findById(transaction.paymentSession);
  if (session) {
    session.status = "Consumed";
    await session.save();
  }

  return getReceiptData(transaction, session);
};

export const verifyTransaction = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  if (!transaction.transactionHash) {
    return {
      transactionId: transaction._id.toString(),
      status: transaction.status,
      message: "Transaction has not been submitted yet",
    };
  }

  const verification = await verifyStellarTransaction(
    transaction.transactionHash
  );

  if (verification.verified) {
    transaction.status = "Confirmed";
    if (verification.ledger) {
      transaction.ledger = verification.ledger;
    }
    await transaction.save();
    await updateCustomerStats(transaction);
  }

  return {
    transactionId: transaction._id.toString(),
    transactionHash: transaction.transactionHash,
    status: transaction.status,
    verified: verification.verified,
    ledger: verification.ledger,
  };
};

export const getTransactionStatus = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId);
  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  return {
    transactionId: transaction._id.toString(),
    transactionHash: transaction.transactionHash,
    status: transaction.status,
    asset: transaction.asset,
    amount: transaction.amount,
    createdAt: transaction.createdAt,
  };
};

const getReceiptData = (transaction, session) => {
  return {
    receipt: {
      transactionId: transaction._id.toString(),
      transactionHash: transaction.transactionHash,
      ledger: transaction.ledger,
      status: transaction.status,
      network: transaction.network,
    },
    merchant: {
      businessName: session?.merchant?.businessName || null,
      category: session?.merchant?.category || null,
      logo: session?.merchant?.logo || null,
    },
    payment: {
      amount: transaction.amount,
      asset: transaction.asset,
      payerAddress: transaction.payerAddress,
      receiverAddress: transaction.receiverAddress,
    },
    session: {
      sessionId: session?.sessionId || null,
      consumedAt: session?.updatedAt || null,
    },
    timestamp: transaction.updatedAt || transaction.createdAt,
  };
};

export const getRecentTransactions = async (merchantId, limit = 4) => {
  const transactions = await Transaction.find({ merchant: merchantId })
    .populate({
      path: "customer",
      select: "walletAddress",
      populate: { path: "user", select: "name email" },
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return transactions.map((txn) => ({
    _id: txn._id,
    amount: txn.amount,
    asset: txn.asset,
    status: txn.status,
    createdAt: txn.createdAt,
    customer: txn.customer
      ? {
          name: txn.customer.user?.name || null,
          email: txn.customer.user?.email || null,
          walletAddress: txn.customer.walletAddress || txn.payerAddress,
        }
      : null,
  }));
};

export const getReceipt = async (transactionId) => {
  const transaction = await Transaction.findById(transactionId).populate(
    "paymentSession"
  );
  if (!transaction) {
    const err = new Error("Transaction not found");
    err.statusCode = 404;
    throw err;
  }

  const session = await PaymentSession.findById(
    transaction.paymentSession
  ).populate("merchant", "businessName category logo");

  return getReceiptData(transaction, session);
};
