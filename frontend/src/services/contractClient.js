/**
 * contractClient.js — Direct Soroban RPC Contract Client
 *
 * This module calls the deployed PayStream smart contract directly from the
 * frontend via Soroban RPC, bypassing the backend API.  It covers every
 * read-only contract function listed in contract-frontend-mapping.json:
 *
 *   get_payment, payment_exists, get_config, merchant_total, customer_total
 *
 * Write operations (pay, initialize, admin functions) still go through the
 * backend's transaction-building pipeline because they require server-side
 * account management and fee logic.
 */

import {
  Contract,
  rpc,
  nativeToScVal,
  scValToNative,
  Address,
  TransactionBuilder,
  BASE_FEE,
  Networks,
} from '@stellar/stellar-sdk'

import {
  SOROBAN_CONTRACT_ID,
  SOROBAN_RPC_URL,
  STELLAR_NETWORK_PASSPHRASE,
} from '../config/env'

// ── Singleton instances ─────────────────────────────────────────────────────

let _server = null
let _contract = null

function getServer() {
  if (!_server) {
    _server = new rpc.Server(SOROBAN_RPC_URL, { allowHttp: true })
  }
  return _server
}

function getContract() {
  if (!_contract) {
    if (!SOROBAN_CONTRACT_ID) {
      throw new Error('SOROBAN_CONTRACT_ID is not configured')
    }
    _contract = new Contract(SOROBAN_CONTRACT_ID)
  }
  return _contract
}

// ── Helper: simulate a read-only contract call ──────────────────────────────

/**
 * Simulates a read-only contract invocation on the Soroban RPC and returns the
 * native JS representation of the return value.
 *
 * @param {string} method   – contract function name (e.g. "get_config")
 * @param {Array}  args     – ScVal arguments to pass
 * @returns {Promise<any>}  – the decoded return value
 */
async function simulateReadOnly(method, args = []) {
  const server = getServer()
  const contract = getContract()

  // We need a valid source account for simulation.  For read-only calls
  // any funded account works — the simulation is never submitted on-chain.
  // Using a well-known Stellar Testnet friendbot root account.
  const SIMULATION_SOURCE = 'GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN7'

  let sourceAccount
  try {
    sourceAccount = await server.getAccount(SIMULATION_SOURCE)
  } catch {
    // Fallback: create a minimal source account object for simulation
    sourceAccount = new (await import('@stellar/stellar-sdk')).Account(
      SIMULATION_SOURCE,
      '0'
    )
  }

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build()

  const simulation = await server.simulateTransaction(tx)

  if (simulation.error) {
    throw new Error(`Contract simulation failed for ${method}: ${simulation.error}`)
  }

  if (!simulation.result) {
    return null
  }

  return scValToNative(simulation.result.retval)
}

// ── Public API: Direct contract read functions ──────────────────────────────

/**
 * Retrieve a payment record directly from the on-chain contract.
 * Maps to contract function: `get_payment(id: BytesN<32>) -> Payment`
 */
export async function directGetPayment(paymentIdHex) {
  const idBytes = Buffer.from(paymentIdHex, 'hex')
  return simulateReadOnly('get_payment', [
    nativeToScVal(idBytes, { type: 'bytes' }),
  ])
}

/**
 * Check if a payment exists directly on-chain.
 * Maps to contract function: `payment_exists(id: BytesN<32>) -> bool`
 */
export async function directPaymentExists(paymentIdHex) {
  const idBytes = Buffer.from(paymentIdHex, 'hex')
  return simulateReadOnly('payment_exists', [
    nativeToScVal(idBytes, { type: 'bytes' }),
  ])
}

/**
 * Retrieve the contract configuration directly from on-chain storage.
 * Maps to contract function: `get_config() -> Config`
 */
export async function directGetConfig() {
  return simulateReadOnly('get_config')
}

/**
 * Get the total payment count for a merchant directly from the contract.
 * Maps to contract function: `merchant_total(merchant: Address) -> u64`
 */
export async function directMerchantTotal(stellarAddress) {
  return simulateReadOnly('merchant_total', [
    new Address(stellarAddress).toScVal(),
  ])
}

/**
 * Get the total payment count for a customer directly from the contract.
 * Maps to contract function: `customer_total(customer: Address) -> u64`
 */
export async function directCustomerTotal(stellarAddress) {
  return simulateReadOnly('customer_total', [
    new Address(stellarAddress).toScVal(),
  ])
}

// ── Utility ─────────────────────────────────────────────────────────────────

/**
 * Returns the contract ID and RPC URL currently in use (useful for debugging).
 */
export function getContractInfo() {
  return {
    contractId: SOROBAN_CONTRACT_ID,
    rpcUrl: SOROBAN_RPC_URL,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
  }
}
