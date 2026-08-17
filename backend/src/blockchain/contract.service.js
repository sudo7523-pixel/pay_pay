import {
  Contract,
  nativeToScVal,
  scValToNative,
  Address,
  xdr,
} from "@stellar/stellar-sdk";
import { sorobanConfig } from "./stellar.config.js";
import { getRpcServer, withRetry } from "./rpc.service.js";
import { blockchainLogger } from "./logger.service.js";

let contractInstance = null;

export const getContract = () => {
  if (!contractInstance) {
    contractInstance = new Contract(sorobanConfig.contractId);
    blockchainLogger.info("Contract instance created", sorobanConfig.contractId);
  }
  return contractInstance;
};

export const scvalToPayment = (scval) => {
  const map = scval.value().map();
  const result = {};
  for (const entry of map) {
    const key = scValToNative(entry.key);
    const val = scValToNative(entry.val);
    result[key] = val;
  }
  return {
    from: result.from || null,
    to: result.to || null,
    token: result.token || null,
    amount: result.amount ? result.amount.toString() : null,
    fee: result.fee ? result.fee.toString() : null,
    nonce: result.nonce || null,
    memo: result.memo || null,
    reference: result.reference || null,
    status: result.status || null,
    createdAt: result.created_at || null,
    completedAt: result.completed_at || null,
    id: result.id || null,
  };
};

export const scvalToConfig = (scval) => {
  const map = scval.value().map();
  const result = {};
  for (const entry of map) {
    const key = scValToNative(entry.key);
    const val = scValToNative(entry.val);
    result[key] = val;
  }
  return {
    admin: result.admin || null,
    feeBps: result.fee_bps ?? null,
    feeRecipient: result.fee_recipient || null,
    paused: result.paused ?? false,
    version: result.version ?? 0,
  };
};

export const invokeContract = async (method, args = [], source) => {
  const contract = getContract();
  const server = getRpcServer();

  blockchainLogger.debug(`invokeContract: ${method}`, args);

  const simulation = await withRetry(async () => {
    const tx = contract.call(method, ...args);
    return server.simulateTransaction(tx, source ? { sourceAccount: source } : undefined);
  }, `simulate_${method}`);

  if (simulation.error) {
    blockchainLogger.error(`Simulation error for ${method}:`, simulation.error);
    const err = new Error(`Contract simulation failed: ${simulation.error}`);
    err.contractError = simulation.error;
    throw err;
  }

  return simulation;
};

export const parseContractResult = (simulation) => {
  if (!simulation.result) return null;
  return simulation.result.retval ? scValToNative(simulation.result.retval) : null;
};

export const buildContractCallArgs = (method, args) => {
  const contract = getContract();
  return contract.call(method, ...args);
};

export const getPayment = async (paymentId) => {
  const simulation = await invokeContract(
    "get_payment",
    [nativeToScVal(paymentId, { type: "bytes" })],
    sorobanConfig.adminPublic
  );
  return simulation.result ? scvalToPayment(simulation.result.retval) : null;
};

export const paymentExists = async (paymentId) => {
  const simulation = await invokeContract(
    "payment_exists",
    [nativeToScVal(paymentId, { type: "bytes" })],
    sorobanConfig.adminPublic
  );
  return simulation.result ? scValToNative(simulation.result.retval) : false;
};

export const getConfig = async () => {
  const simulation = await invokeContract("get_config", [], sorobanConfig.adminPublic);
  return simulation.result ? scvalToConfig(simulation.result.retval) : null;
};

export const merchantTotal = async (address) => {
  const simulation = await invokeContract(
    "merchant_total",
    [new Address(address).toScVal()],
    sorobanConfig.adminPublic
  );
  return simulation.result ? scValToNative(simulation.result.retval) : 0;
};

export const customerTotal = async (address) => {
  const simulation = await invokeContract(
    "customer_total",
    [new Address(address).toScVal()],
    sorobanConfig.adminPublic
  );
  return simulation.result ? scValToNative(simulation.result.retval) : 0;
};
