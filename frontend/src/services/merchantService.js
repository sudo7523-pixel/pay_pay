import api from './api'

export async function getMerchantProfile() {
  const { data } = await api.get('/merchant/profile')
  return data.data
}

export async function registerMerchant(merchantData) {
  const { data } = await api.post('/merchant/register', merchantData)
  return data.data
}

export async function updateMerchantProfile(updateData) {
  const { data } = await api.put('/merchant/profile', updateData)
  return data.data
}

export async function deleteMerchantProfile() {
  const { data } = await api.delete('/merchant/profile')
  return data
}

export async function getMerchantStatsFromAdmin(page = 1, limit = 10) {
  try {
    const { data } = await api.get('/admin/merchants', { params: { page, limit } })
    return data.data
  } catch {
    return []
  }
}
