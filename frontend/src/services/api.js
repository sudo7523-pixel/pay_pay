import axios from 'axios'
import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../config/env'
import { getItem } from '../utils/storage'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use(
  (config) => {
    const token = getItem(TOKEN_STORAGE_KEY)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const event = new CustomEvent('auth:unauthorized')
      window.dispatchEvent(event)
    }

    const normalized = {
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      status: error.response?.status || 0,
      errors: error.response?.data?.errors || [],
      data: error.response?.data || null,
    }
    return Promise.reject(normalized)
  }
)

export default api
