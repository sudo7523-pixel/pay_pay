/**
 * useContractQueries — React hook for direct on-chain contract queries
 *
 * Wraps contractClient.js so components can call read-only contract functions
 * directly via Soroban RPC with automatic loading / error state management.
 */

import { useState, useCallback, useRef } from 'react'
import * as contractClient from '../services/contractClient'
import { useToast } from '../context/ToastContext'

export function useContractQueries() {
  const { error: showError } = useToast()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [config, setConfig] = useState(null)
  const [merchantTotal, setMerchantTotal] = useState(null)
  const [customerTotal, setCustomerTotal] = useState(null)
  const [payment, setPayment] = useState(null)
  const [paymentExists, setPaymentExists] = useState(null)

  const activeRef = useRef(true)

  // ── Fetch contract config directly from on-chain ──

  const fetchConfig = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await contractClient.directGetConfig()
      if (activeRef.current) setConfig(result)
      return result
    } catch (err) {
      if (activeRef.current) {
        setError(err.message)
        showError('Failed to fetch contract config from chain')
      }
      return null
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [showError])

  // ── Fetch merchant total directly from contract ──

  const fetchMerchantTotal = useCallback(async (address) => {
    if (!address) return null
    setLoading(true)
    setError(null)
    try {
      const result = await contractClient.directMerchantTotal(address)
      if (activeRef.current) setMerchantTotal(result)
      return result
    } catch (err) {
      if (activeRef.current) {
        setError(err.message)
        showError('Failed to fetch merchant total from chain')
      }
      return null
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [showError])

  // ── Fetch customer total directly from contract ──

  const fetchCustomerTotal = useCallback(async (address) => {
    if (!address) return null
    setLoading(true)
    setError(null)
    try {
      const result = await contractClient.directCustomerTotal(address)
      if (activeRef.current) setCustomerTotal(result)
      return result
    } catch (err) {
      if (activeRef.current) {
        setError(err.message)
        showError('Failed to fetch customer total from chain')
      }
      return null
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [showError])

  // ── Query a specific payment directly from contract ──

  const queryPayment = useCallback(async (paymentIdHex) => {
    if (!paymentIdHex) return null
    setLoading(true)
    setError(null)
    try {
      const result = await contractClient.directGetPayment(paymentIdHex)
      if (activeRef.current) setPayment(result)
      return result
    } catch (err) {
      if (activeRef.current) {
        setError(err.message)
        showError('Failed to fetch payment from chain')
      }
      return null
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [showError])

  // ── Check if a payment exists directly on-chain ──

  const checkPaymentExists = useCallback(async (paymentIdHex) => {
    if (!paymentIdHex) return null
    setLoading(true)
    setError(null)
    try {
      const result = await contractClient.directPaymentExists(paymentIdHex)
      if (activeRef.current) setPaymentExists(result)
      return result
    } catch (err) {
      if (activeRef.current) {
        setError(err.message)
        showError('Failed to verify payment on chain')
      }
      return null
    } finally {
      if (activeRef.current) setLoading(false)
    }
  }, [showError])

  // ── Get contract info (non-async) ──

  const getInfo = useCallback(() => {
    return contractClient.getContractInfo()
  }, [])

  return {
    // State
    loading,
    error,
    config,
    merchantTotal,
    customerTotal,
    payment,
    paymentExists,

    // Actions
    fetchConfig,
    fetchMerchantTotal,
    fetchCustomerTotal,
    queryPayment,
    checkPaymentExists,
    getInfo,
  }
}
