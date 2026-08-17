import api from './api'

export async function getWallet() {
  const { data } = await api.get('/wallet')
  return data.data
}

export async function getWalletAddress() {
  const wallet = await getWallet()
  return wallet.walletAddress || ''
}

export async function getBalance() {
  try {
    const wallet = await getWallet()
    return { address: wallet.walletAddress, status: wallet.walletStatus }
  } catch {
    return { address: '', status: 'Unavailable' }
  }
}

export async function linkWallet(walletAddress, walletProvider = "Freighter", network = "testnet") {
  const { data } = await api.post("/wallet/link", { walletAddress, walletProvider, network });
  return data.data;
}

export async function getAssets() {
  try {
    const wallet = await getWallet()
    return [{ code: 'XLM', issuer: 'Stellar', balance: 0, address: wallet.walletAddress, status: wallet.walletStatus }]
  } catch {
    return []
  }
}
