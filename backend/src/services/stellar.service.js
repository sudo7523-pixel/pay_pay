import {
  Horizon,
  StrKey,
  Transaction,
  TransactionBuilder,
  Operation,
  Asset,
  BASE_FEE,
  Networks,
  xdr,
} from "@stellar/stellar-sdk";
import { stellarConfig } from "../config/stellar.js";
import { config } from "../config/index.js";

let horizonServer = null;

export const getHorizonServer = () => {
  if (!horizonServer) {
    horizonServer = new Horizon.Server(stellarConfig.horizonUrl, {
      allowHttp: config.nodeEnv === "development",
    });
  }
  return horizonServer;
};

export const isValidPublicKey = (address) => {
  if (!address || typeof address !== "string") return false;
  return StrKey.isValidEd25519PublicKey(address.trim());
};

export const checkAccountExists = async (address) => {
  try {
    const server = getHorizonServer();
    const account = await server.loadAccount(address.trim());
    return { exists: true, account };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { exists: false, account: null };
    }
    throw error;
  }
};

export const getAccountInfo = async (address) => {
  const { exists, account } = await checkAccountExists(address);

  if (!exists) {
    return {
      exists: false,
      address: address.trim(),
      balances: [],
      sequence: null,
    };
  }

  const balances = account.balances.map((balance) => ({
    assetType: balance.asset_type,
    assetCode: balance.asset_code || null,
    assetIssuer: balance.asset_issuer || null,
    balance: balance.balance,
  }));

  return {
    exists: true,
    address: account.accountId(),
    sequence: account.sequenceNumber(),
    balances,
  };
};

export const getNetworkConfig = () => ({ ...stellarConfig });

export const buildPaymentTransaction = async (
  sourceAddress,
  destinationAddress,
  amount,
  assetCode
) => {
  const server = getHorizonServer();
  const account = await server.loadAccount(sourceAddress.trim());

  let assetObject;
  if (assetCode === "XLM") {
    assetObject = Asset.native();
  } else {
    const parts = assetCode.split(":");
    if (parts.length !== 2) {
      throw new Error(
        `Invalid asset format "${assetCode}". Use "CODE:ISSUER" for non-native assets.`
      );
    }
    assetObject = new Asset(parts[0], parts[1]);
  }

  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination: destinationAddress.trim(),
        asset: assetObject,
        amount: amount.toString(),
      })
    )
    .setTimeout(300)
    .build();

  return transaction.toXDR();
};

export const submitSignedTransaction = async (signedXDR) => {
  const server = getHorizonServer();

  let envelope;
  try {
    envelope = xdr.TransactionEnvelope.fromXDR(signedXDR, "base64");
  } catch {
    throw new Error("Invalid signed XDR format");
  }

  const result = await server.submitTransaction(signedXDR);

  return {
    hash: result.hash,
    ledger: result.ledger,
    successful: result.successful,
    resultXdr: result.result_xdr,
    envelopeXdr: result.envelope_xdr,
  };
};

export const getTransaction = async (transactionHash) => {
  const server = getHorizonServer();

  const txData = await server
    .transactions()
    .transaction(transactionHash)
    .call();

  const operations = await txData.operations();

  return {
    hash: txData.hash,
    ledger: txData.ledger_attr,
    createdAt: txData.created_at,
    sourceAccount: txData.source_account,
    successful: txData.successful,
    operationCount: txData.operation_count,
    operationDetails: operations.records,
  };
};

export const verifyTransaction = async (transactionHash) => {
  try {
    const txData = await getTransaction(transactionHash);

    return {
      verified: txData.successful === true,
      hash: txData.hash,
      ledger: txData.ledger,
      sourceAccount: txData.sourceAccount,
      createdAt: txData.createdAt,
    };
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return { verified: false, hash: transactionHash, ledger: null };
    }
    throw error;
  }
};

export const parseSignedTransaction = (signedXDR) => {
  const tx = TransactionBuilder.fromXDR(signedXDR, stellarConfig.networkPassphrase);
  return {
    sourceAccount: tx.source,
    fee: tx.fee,
    memo: tx.memo,
    sequence: tx.sequence,
    operations: tx.operations.map((op) => ({
      type: op.type,
      destination: op.destination,
      asset: op.asset,
      amount: op.amount,
    })),
  };
};
