import { rpc, xdr } from "@stellar/stellar-sdk";
import { sorobanConfig } from "./stellar.config.js";
import { blockchainLogger } from "./logger.service.js";

let rpcServer = null;

export const getRpcServer = () => {
  if (!rpcServer) {
    rpcServer = new rpc.Server(sorobanConfig.rpcUrl);
    blockchainLogger.info("Soroban RPC server initialized", sorobanConfig.rpcUrl);
  }
  return rpcServer;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const withRetry = async (fn, context) => {
  let lastError;
  for (let attempt = 1; attempt <= sorobanConfig.maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), sorobanConfig.rpcTimeoutMs);

      const result = await fn(controller.signal);
      clearTimeout(timeoutId);

      if (attempt > 1) {
        blockchainLogger.info(`${context} succeeded after ${attempt} retries`);
      }
      return result;
    } catch (error) {
      lastError = error;
      if (error.name === "AbortError") {
        blockchainLogger.warn(`${context} timed out (attempt ${attempt}/${sorobanConfig.maxRetries})`);
      } else {
        blockchainLogger.warn(`${context} failed (attempt ${attempt}/${sorobanConfig.maxRetries}): ${error.message}`);
      }

      if (attempt < sorobanConfig.maxRetries) {
        const delay = sorobanConfig.retryBaseDelayMs * Math.pow(2, attempt - 1);
        await sleep(delay);
      }
    }
  }
  throw lastError;
};

export const getHealth = async () => {
  return withRetry(async () => {
    const server = getRpcServer();
    const health = await server.getHealth();
    return health;
  }, "getHealth");
};

export const getLatestLedger = async () => {
  return withRetry(async () => {
    const server = getRpcServer();
    const ledger = await server.getLatestLedger();
    return ledger;
  }, "getLatestLedger");
};

export const getAccountSequence = async (address) => {
  return withRetry(async () => {
    const server = getRpcServer();
    const account = await server.getAccount(address);
    return account.sequenceNumber();
  }, `getAccountSequence(${address})`);
};

export const simulateTransaction = async (transaction) => {
  return withRetry(async () => {
    const server = getRpcServer();
    const simulation = await server.simulateTransaction(transaction);
    return simulation;
  }, "simulateTransaction");
};

export const sendTransaction = async (transaction) => {
  return withRetry(async () => {
    const server = getRpcServer();
    const result = await server.sendTransaction(transaction);
    return { hash: result.hash, status: result.status, errorResult: result.errorResult };
  }, "sendTransaction");
};

export const getTransaction = async (hash) => {
  return withRetry(async () => {
    const server = getRpcServer();
    const result = await server.getTransaction(hash);
    return result;
  }, `getTransaction(${hash})`);
};

export const getEvents = async ({ startLedger, filters, pagination } = {}) => {
  return withRetry(async () => {
    const server = getRpcServer();
    const result = await server.getEvents({
      startLedger: startLedger || sorobanConfig.eventSyncStartLedger,
      filters: filters || [],
      pagination: pagination || { limit: 100 },
    });
    return result;
  }, "getEvents");
};
