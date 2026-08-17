import { config } from "../config/index.js";

export const sorobanConfig = Object.freeze({
  network: process.env.STELLAR_NETWORK || "testnet",
  horizonUrl:
    process.env.STELLAR_HORIZON_URL || "https://horizon-testnet.stellar.org",
  rpcUrl:
    process.env.STELLAR_RPC_URL || "https://soroban-testnet.stellar.org",
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  contractId:
    process.env.SOROBAN_CONTRACT_ID ||
    "CCE2HEK4KS3TFJZRZS65FSPYPP7DYCR2O2QJB2AGVHQVGFQ52MDNJ7DP",
  nativeTokenId:
    process.env.SOROBAN_NATIVE_TOKEN ||
    "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
  adminSecret: process.env.STELLAR_SECRET || null,
  adminPublic: process.env.STELLAR_PUBLIC || null,
  maxRetries: parseInt(process.env.SOROBAN_MAX_RETRIES || "3", 10),
  retryBaseDelayMs: parseInt(process.env.SOROBAN_RETRY_DELAY || "1000", 10),
  rpcTimeoutMs: parseInt(process.env.SOROBAN_RPC_TIMEOUT || "30000", 10),
  confirmationPollIntervalMs: parseInt(
    process.env.SOROBAN_POLL_INTERVAL || "2000",
    10
  ),
  confirmationMaxRetries: parseInt(
    process.env.SOROBAN_CONFIRM_RETRIES || "30",
    10
  ),
  eventSyncIntervalMs: parseInt(
    process.env.SOROBAN_EVENT_SYNC_INTERVAL || "10000",
    10
  ),
  eventSyncStartLedger:
    parseInt(process.env.SOROBAN_EVENT_SYNC_START_LEDGER || "0", 10) || 0,

  get explorerUrl() {
    return this.network === "testnet"
      ? "https://stellar.expert/explorer/testnet"
      : "https://stellar.expert/explorer/public";
  },

  get isMainnet() {
    return this.network === "public" || this.network === "mainnet";
  },
});

export const validateSorobanConfig = () => {
  const required = ["rpcUrl", "contractId", "nativeTokenId"];
  const missing = required.filter((key) => !sorobanConfig[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required Soroban configuration: ${missing.join(", ")}`
    );
  }
};
