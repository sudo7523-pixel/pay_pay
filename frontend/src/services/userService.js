import api from './api'

export async function getProfile() {
  const { data } = await api.get('/auth/profile')
  return data.data.user
}

export async function updateProfile(updateData) {
  const { data } = await api.put('/auth/profile', updateData)
  return data.data.user
}

export async function deleteAccount() {
  const { data } = await api.delete('/auth/profile')
  return data
}
