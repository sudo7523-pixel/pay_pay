import { StrKey, Horizon } from "@stellar/stellar-sdk";
import { getRpcServer, withRetry } from "./rpc.service.js";
import { sorobanConfig } from "./stellar.config.js";
import { blockchainLogger } from "./logger.service.js";
import crypto from "crypto";

const getHorizonServer = () => new Horizon.Server(sorobanConfig.horizonUrl);

export const isValidSorobanAddress = (address) => {
  if (!address || typeof address !== "string") return false;
  const trimmed = address.trim();
  return StrKey.isValidEd25519PublicKey(trimmed) || StrKey.isValidContract(trimmed);
};

export const checkSorobanAccountExists = async (address) => {
  try {
    const server = getRpcServer();
    const account = await withRetry(
      () => server.getAccount(address.trim()),
      `checkSorobanAccountExists(${address})`
    );
    return { exists: true, account };
  } catch (error) {
    if (error?.response?.status === 404) {
      return { exists: false, account: null };
    }
    if (error.message?.includes("not found")) {
      return { exists: false, account: null };
    }
    throw error;
  }
};

export const getSorobanAccountBalances = async (address) => {
  try {
    const horizon = getHorizonServer();
    const account = await withRetry(
      () => horizon.accounts().accountId(address.trim()).call(),
      `getSorobanAccountBalances(${address})`
    );
    return {
      address: account.id,
      sequence: account.sequence,
      balances: account.balances || [],
    };
  } catch (error) {
    if (error?.response?.status === 404 || error.message?.includes("not found")) {
      return { address, sequence: null, balances: [] };
    }
    throw error;
  }
};

export const generateSorobanNonce = () => {
  return crypto.randomBytes(32);
};

export const generatePaymentId = (from, to, token, amount, nonce, reference) => {
  const hash = crypto.createHash("sha256");
  hash.update(from.toString());
  hash.update(to.toString());
  hash.update(token.toString());
  hash.update(amount.toString());
  hash.update(Buffer.from(nonce));
  hash.update(reference);
  return hash.digest();
};
