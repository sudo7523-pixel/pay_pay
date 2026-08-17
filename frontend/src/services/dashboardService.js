import api from './api'

export async function getDashboardData() {
  const { data } = await api.get('/dashboard')
  return data.data
}

export async function getWalletForDashboard() {
  try {
    const { data } = await api.get('/wallet')
    return data.data
  } catch {
    return null
  }
}

export async function getMerchantForDashboard() {
  try {
    const { data } = await api.get('/merchant/profile')
    return data.data
  } catch {
    return null
  }
}

export async function getRecentTransactions(limit = 4) {
  try {
    const { data } = await api.get('/payment/recent', { params: { limit } })
    return data.data || []
  } catch {
    return []
  }
}

export async function getCustomerAnalytics() {
  try {
    const { data } = await api.get('/merchant/analytics')
    return data.data
  } catch {
    return null
  }
}
