import api from './api'

export async function getTransactions(page = 1, limit = 10, search = '', filters = {}, sort = 'newest') {
  try {
    const params = { page, limit }
    if (search) params.search = search
    if (filters.status) params.status = filters.status
    if (sort) params.sort = sort

    const { data } = await api.get('/payment/transactions', { params })
    const payload = data.data || {}
    return {
      data: payload.data || [],
      total: payload.total || 0,
      page: payload.page || page,
      limit: payload.limit || limit,
      totalPages: payload.totalPages || 0,
    }
  } catch {
    return { data: [], total: 0, page, limit, totalPages: 0 }
  }
}

export async function getTransactionById(id) {
  try {
    const { data } = await api.get(`/payment/receipt/${id}`)
    return data.data
  } catch {
    return null
  }
}

export async function getTransactionStatus(id) {
  try {
    const { data } = await api.get(`/payment/status/${id}`)
    return data.data
  } catch {
    return null
  }
}

export async function verifyTransaction(id) {
  try {
    const { data } = await api.get(`/payment/verify/${id}`)
    return data.data
  } catch {
    return null
  }
}
