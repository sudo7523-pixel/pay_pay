import { useState, useEffect, useCallback } from 'react'
import * as customerService from '../services/customerService'
import { useToast } from '../context/ToastContext'
import { useAuth } from '../context/AuthContext'

export function useCustomer() {
  const { success, error: showError } = useToast()
  const { user } = useAuth()

  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [txnLoading, setTxnLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [total, setTotal] = useState(0)
  const [statusFilter, setStatusFilter] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sort, setSort] = useState('newest')
  const [receipt, setReceipt] = useState(null)
  const [receiptLoading, setReceiptLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    customerService.getProfile()
      .then((data) => {
        if (!cancelled) {
          setProfile(data)
          setLoading(false)
          setError(null)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message || 'Failed to load profile')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    let cancelled = false
    setTxnLoading(true)
    customerService.getTransactions(page, 10, statusFilter, searchQuery, sort)
      .then((result) => {
        if (!cancelled) {
          setTransactions(result.data)
          setTotalPages(result.totalPages)
          setTotal(result.total)
          setTxnLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setTxnLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [page, statusFilter, searchQuery, sort])

  const register = useCallback(async (name, email, password) => {
    try {
      const result = await customerService.register(name, email, password)
      setProfile(result.customer)
      return result
    } catch (err) {
      showError(err.message || 'Registration failed')
      throw err
    }
  }, [showError])

  const updateProfile = useCallback(async (data) => {
    try {
      const updated = await customerService.updateProfile(data)
      setProfile(updated)
      success('Profile updated')
      return updated
    } catch (err) {
      showError(err.message || 'Failed to update profile')
      throw err
    }
  }, [success, showError])

  const fetchReceipt = useCallback(async (transactionId) => {
    setReceiptLoading(true)
    try {
      const data = await customerService.getReceipt(transactionId)
      setReceipt(data)
      return data
    } catch (err) {
      showError(err.message || 'Failed to load receipt')
      return null
    } finally {
      setReceiptLoading(false)
    }
  }, [showError])

  const goToPage = useCallback((p) => setPage(p), [])
  const setFilter = useCallback((f) => { setStatusFilter(f); setPage(1) }, [])
  const setSearch = useCallback((q) => { setSearchQuery(q); setPage(1) }, [])
  const setSortBy = useCallback((s) => { setSort(s); setPage(1) }, [])

  const refetch = useCallback(() => {
    setLoading(true)
    setError(null)
    customerService.getProfile().then(setProfile).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const refetchTransactions = useCallback(() => {
    setPage(1)
    setStatusFilter('')
    setSearchQuery('')
    setSort('newest')
  }, [])

  return {
    profile, loading, error,
    transactions, txnLoading, page, totalPages, total,
    statusFilter, searchQuery, sort,
    receipt, receiptLoading,
    register, updateProfile, fetchReceipt,
    goToPage, setFilter, setSearch, setSortBy,
    refetch, refetchTransactions,
  }
}
