import { useState, useEffect, useCallback } from 'react'
import * as transactionService from '../services/transactionService'

export function useTransactions() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({})
  const [sort, setSort] = useState('newest')
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const limit = 10

  useEffect(() => {
    let cancelled = false
    transactionService.getTransactions(page, limit, search, filters, sort).then((result) => {
      if (!cancelled) {
        setTransactions(result.data)
        setTotalPages(result.totalPages)
        setLoading(false)
        setError(null)
      }
    }).catch((err) => {
      if (!cancelled) {
        setError(err.message || 'Failed to load transactions')
        setLoading(false)
      }
    })
    return () => { cancelled = true }
  }, [page, search, filters, sort])

  const goToPage = useCallback((p) => setPage(p), [])

  const openDetail = useCallback(async (id) => {
    setDetailLoading(true)
    try {
      const txn = await transactionService.getTransactionById(id)
      setDetail(txn)
    } catch {
      setDetail({ id, error: 'Failed to load details' })
    } finally {
      setDetailLoading(false)
    }
  }, [])

  const closeDetail = useCallback(() => setDetail(null), [])

  const setSearchQuery = useCallback((q) => {
    setSearch(q)
    setPage(1)
  }, [])

  const setActiveFilters = useCallback((f) => {
    setFilters(f)
    setPage(1)
  }, [])

  const setSortBy = useCallback((s) => {
    setSort(s)
    setPage(1)
  }, [])

  const refetch = useCallback(() => {
    setPage(1)
    setSearch('')
    setFilters({})
    setSort('newest')
  }, [])

  return {
    transactions, loading, error, page, totalPages,
    search, filters, sort,
    detail, detailLoading,
    goToPage, openDetail, closeDetail,
    setSearch: setSearchQuery,
    setFilters: setActiveFilters,
    setSort: setSortBy,
    refetch,
  }
}
