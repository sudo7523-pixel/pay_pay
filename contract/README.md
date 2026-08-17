# PayStream Soroban Contract

Soroban smart contract for trustless payment settlement on Stellar.

## Build

```bash
cargo build --release --target wasm32-unknown-unknown
```

## Test

```bash
cargo test
```

## Generate WASM

```bash
cargo build --release --target wasm32-unknown-unknown
# WASM artifact: target/wasm32-unknown-unknown/release/PayStream_contract.wasm
```

## Deploy

```bash
stellar contract install \
  --wasm target/wasm32-unknown-unknown/release/PayStream_contract.wasm \
  --network testnet

stellar contract deploy \
  --wasm-hash <INSTALLED_HASH> \
  --network testnet
```

## Architecture

See `../soroban-contract-architecture.md` for the full architecture document.
