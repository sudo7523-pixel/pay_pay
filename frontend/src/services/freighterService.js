import {
  isConnected as freighterIsConnected,
  requestAccess,
  signTransaction as freighterSignTransaction,
  getNetwork as freighterGetNetwork,
  getNetworkDetails as freighterGetNetworkDetails,
  setNetwork as freighterSetNetwork,
} from '@stellar/freighter-api'

const FREIGHTER_DOWNLOAD_URL = 'https://freighter.app'
const API_TIMEOUT = 3000

export async function detectFreighter(timeoutMs = API_TIMEOUT) {
  try {
    const result = await Promise.race([
      freighterIsConnected(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), timeoutMs)
      ),
    ])
    return result.isConnected === true || result.isConnected === false
  } catch {
    return false
  }
}

export async function isConnected() {
  try {
    const result = await freighterIsConnected()
    return result.isConnected === true
  } catch {
    return false
  }
}

export async function getPublicKey() {
  const result = await requestAccess()
  if (result.error) throw new Error(result.error.message || 'Failed to connect Freighter')
  return result.address
}

export async function signTransaction(xdr, opts = {}) {
  const signOpts = {}
  if (opts.networkPassphrase) signOpts.networkPassphrase = opts.networkPassphrase
  if (opts.network) signOpts.network = opts.network
  if (opts.address) signOpts.address = opts.address
  const result = await freighterSignTransaction(xdr, signOpts)
  if (result.error) throw new Error(result.error.message || 'Transaction signing rejected')
  return result.signedTxXdr
}

export async function getNetwork() {
  return freighterGetNetwork()
}

export async function getNetworkDetails() {
  return freighterGetNetworkDetails()
}

export async function setNetwork(passphrase) {
  return freighterSetNetwork(passphrase)
}

export function getFreighterDownloadUrl() {
  return FREIGHTER_DOWNLOAD_URL
}
