import api from './api'

export async function register(name, email, password, walletAddress) {
  const { data } = await api.post('/customer/register', { name, email, password, walletAddress })
  return data.data
}

export async function getProfile() {
  const { data } = await api.get('/customer/profile')
  return data.data.customer
}

export async function updateProfile(updateData) {
  const { data } = await api.put('/customer/profile', updateData)
  return data.data.customer
}

export async function getTransactions(page = 1, limit = 10, status = '', search = '', sort = 'newest') {
  try {
    const params = { page, limit }
    if (status) params.status = status
    if (search) params.search = search
    if (sort) params.sort = sort

    const { data } = await api.get('/customer/transactions', { params })
    return {
      data: data.data.data || [],
      total: data.data.total || 0,
      page: data.data.page || page,
      limit: data.data.limit || limit,
      totalPages: data.data.totalPages || 0,
    }
  } catch {
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }
}

export async function getReceipt(transactionId) {
  try {
    const { data } = await api.get(`/customer/receipt/${transactionId}`)
    return data.data
  } catch {
    return null
  }
}
