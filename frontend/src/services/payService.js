import api from './api'

export async function getMerchantSession(merchantCode) {
  const { data } = await api.get(`/pay/${merchantCode}`)
  return data.data
}
