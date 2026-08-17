import { useState, useEffect, useCallback } from 'react'
import * as walletService from '../services/walletService'

export function useWallet() {
  const [wallet, setWallet] = useState(null)
  const [assets, setAssets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    walletService.getWallet().then((walletData) => {
      if (!cancelled) {
        setWallet(walletData)
        setAssets(walletData.assets || [])
        setLoading(false)
        setError(null)
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message || 'Failed to load wallet')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const refreshBalance = useCallback(() => {
    setLoading(true)
    setError(null)
    setRefreshKey((k) => k + 1)
  }, [])

  return { wallet, assets, loading, error, refetch: refreshBalance, refreshBalance }
}
