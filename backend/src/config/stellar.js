export const stellarConfig = {
  network: process.env.STELLAR_NETWORK || "testnet",
  horizonUrl:
    process.env.STELLAR_HORIZON_URL ||
    "https://horizon-testnet.stellar.org",
  networkPassphrase:
    process.env.STELLAR_NETWORK_PASSPHRASE ||
    "Test SDF Network ; September 2015",
  explorerUrl:
    process.env.STELLAR_EXPLORER_URL ||
    "https://stellar.expert/explorer/testnet",
};
