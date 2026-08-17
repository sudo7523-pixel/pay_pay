import api from './api'

export async function generateQR() {
  const { data } = await api.post('/qr/generate')
  return data.data
}

export async function getQR(merchantCode) {
  const { data } = await api.get(`/qr/${merchantCode}`)
  return data.data
}

export async function regenerateQR() {
  const { data } = await api.put('/qr/regenerate')
  return data.data
}

export async function disableQR() {
  const { data } = await api.delete('/qr')
  return data
}

export async function getQRStatus() {
  try {
    const { data } = await api.get('/qr/status')
    return data.data
  } catch {
    return null
  }
}
