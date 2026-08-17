import { useState, useEffect, useCallback } from 'react'
import * as qrService from '../services/qrService'
import * as merchantService from '../services/merchantService'
import { useToast } from '../context/ToastContext'

export function useQR() {
  const { success, error: showError } = useToast()
  const [qr, setQr] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    merchantService.getMerchantProfile().then((merchantData) => {
      if (cancelled) return
      setMerchant(merchantData)
      if (merchantData?.merchantCode) {
        qrService.getQR(merchantData.merchantCode).then((qrData) => {
          if (!cancelled) {
            setQr(qrData)
            setLoading(false)
            setError(null)
          }
        }).catch(() => {
          if (!cancelled) {
            setQr(null)
            setLoading(false)
            setError(null)
          }
        })
      } else {
        setLoading(false)
        setError(null)
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message || 'Failed to load QR data')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const generate = useCallback(async () => {
    setGenerating(true)
    try {
      const qrData = await qrService.generateQR()
      setQr(qrData)
      success('QR code generated')
      return qrData
    } catch (err) {
      if (err.status === 409) {
        try {
          const qrData = await qrService.regenerateQR()
          setQr(qrData)
          success('QR code regenerated')
          return qrData
        } catch (regErr) {
          showError(regErr.message || 'Failed to regenerate QR')
          throw regErr
        }
      }
      showError(err.message || 'Failed to generate QR')
      throw err
    } finally {
      setGenerating(false)
    }
  }, [success, showError])

  const regenerate = useCallback(async () => {
    setGenerating(true)
    try {
      const qrData = await qrService.regenerateQR()
      setQr(qrData)
      success('QR code regenerated')
      return qrData
    } catch (err) {
      showError(err.message || 'Failed to regenerate QR')
      throw err
    } finally {
      setGenerating(false)
    }
  }, [success, showError])

  const disable = useCallback(async () => {
    setGenerating(true)
    try {
      await qrService.disableQR()
      setQr(null)
      success('QR code disabled')
    } catch (err) {
      showError(err.message || 'Failed to disable QR')
      throw err
    } finally {
      setGenerating(false)
    }
  }, [success, showError])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    setRefreshKey((k) => k + 1)
  }, [])

  const paymentLink = qr?.qrData || (merchant?.merchantCode
    ? `${window.location.origin}/pay/${merchant.merchantCode}`
    : '')

  return { qr, merchant, loading, error, generating, paymentLink, generate, regenerate, disable, refetch }
}
