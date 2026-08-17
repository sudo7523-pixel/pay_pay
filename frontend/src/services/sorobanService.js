import api from './api'

export async function createIntent({ sessionId, payerAddress, amount, token, memo, reference }) {
  const { data } = await api.post('/soroban/intent', { sessionId, payerAddress, amount, token, memo, reference })
  return data.data
}

export async function submitTransaction({ transactionId, signedXDR }) {
  const { data } = await api.post('/soroban/submit', { transactionId, signedXDR })
  return data.data
}

export async function verifyTransaction(transactionId) {
  const { data } = await api.get(`/soroban/verify/${transactionId}`)
  return data.data
}

export async function getPayment(paymentId) {
  const { data } = await api.get(`/soroban/payment/${paymentId}`)
  return data.data
}

export async function paymentExists(paymentId) {
  const { data } = await api.get(`/soroban/payment/exists/${paymentId}`)
  return data.data
}

export async function getConfig() {
  const { data } = await api.get('/soroban/config')
  return data.data
}

export async function getMerchantTotal(address) {
  const { data } = await api.get(`/soroban/merchant-total/${address}`)
  return data.data
}

export async function getCustomerTotal(address) {
  const { data } = await api.get(`/soroban/customer-total/${address}`)
  return data.data
}

export async function getBalance(address) {
  const { data } = await api.get(`/soroban/balance/${address}`)
  return data.data
}

export async function getHealth() {
  const { data } = await api.get('/soroban/health')
  return data.data
}

export async function getSyncStatus() {
  const { data } = await api.get('/soroban/sync/status')
  return data.data
}

export async function triggerManualSync() {
  const { data } = await api.post('/soroban/sync/trigger')
  return data.data
}
