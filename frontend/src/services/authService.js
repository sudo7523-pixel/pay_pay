import api from './api'

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  return data.data
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password })
  return data.data
}

export async function logout() {
  return { success: true }
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/profile')
  return data.data.user
}
