import { useState, useEffect, useCallback } from 'react'
import * as dashboardService from '../services/dashboardService'

export function useDashboard() {
  const [wallet, setWallet] = useState(null)
  const [merchant, setMerchant] = useState(null)
  const [recentTxns, setRecentTxns] = useState([])
  const [customerAnalytics, setCustomerAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      dashboardService.getWalletForDashboard(),
      dashboardService.getMerchantForDashboard(),
      dashboardService.getRecentTransactions(4),
      dashboardService.getCustomerAnalytics(),
    ]).then(([walletData, merchantData, txns, analytics]) => {
      if (!cancelled) {
        setWallet(walletData)
        setMerchant(merchantData)
        setRecentTxns(txns)
        setCustomerAnalytics(analytics)
        setLoading(false)
        setError(null)
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message || 'Failed to load dashboard')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [refreshKey])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    setRefreshKey((k) => k + 1)
  }, [])

  return { wallet, merchant, recentTxns, customerAnalytics, loading, error, refetch }
}
