/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useRef } from 'react'
import LoadingOverlay from '../components/LoadingOverlay/LoadingOverlay'

const LoadingContext = createContext()

export function LoadingProvider({ children }) {
  const [loading, setLoading] = useState(false)
  const countRef = useRef(0)

  const showLoader = useCallback(() => {
    countRef.current += 1
    setLoading(true)
  }, [])

  const hideLoader = useCallback(() => {
    countRef.current = Math.max(0, countRef.current - 1)
    if (countRef.current === 0) {
      setLoading(false)
    }
  }, [])

  return (
    <LoadingContext.Provider value={{ loading, showLoader, hideLoader }}>
      {children}
      {loading && <LoadingOverlay />}
    </LoadingContext.Provider>
  )
}

export function useLoading() {
  const ctx = useContext(LoadingContext)
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider')
  return ctx
}
