import { useState, useEffect, useCallback } from 'react'
import * as merchantService from '../services/merchantService'
import { useToast } from '../context/ToastContext'

export function useMerchant() {
  const { success, error: showError } = useToast()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updating, setUpdating] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    merchantService.getMerchantProfile().then((data) => {
      if (!cancelled) {
        setProfile(data)
        setLoading(false)
        setError(null)
      }
    }).catch((err) => {
      if (!cancelled) {
        if (err.status === 404) {
          setProfile(null)
        } else {
          setError(err.message || 'Failed to load merchant profile')
        }
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const register = useCallback(async (merchantData) => {
    setUpdating(true)
    try {
      const data = await merchantService.registerMerchant(merchantData)
      setProfile(data)
      success('Merchant registered successfully')
      return data
    } catch (err) {
      showError(err.message || 'Failed to register merchant')
      throw err
    } finally {
      setUpdating(false)
    }
  }, [success, showError])

  const updateProfile = useCallback(async (updateData) => {
    setUpdating(true)
    try {
      const data = await merchantService.updateMerchantProfile(updateData)
      setProfile(data)
      success('Merchant profile updated')
      return data
    } catch (err) {
      showError(err.message || 'Failed to update merchant profile')
      throw err
    } finally {
      setUpdating(false)
    }
  }, [success, showError])

  const deleteProfile = useCallback(async () => {
    setUpdating(true)
    try {
      await merchantService.deleteMerchantProfile()
      setProfile(null)
      success('Merchant profile deleted')
    } catch (err) {
      showError(err.message || 'Failed to delete merchant profile')
      throw err
    } finally {
      setUpdating(false)
    }
  }, [success, showError])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    setRefreshKey((k) => k + 1)
  }, [])

  return { profile, loading, error, updating, register, updateProfile, deleteProfile, refetch }
}
