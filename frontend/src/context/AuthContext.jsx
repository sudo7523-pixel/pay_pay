/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { setItem, getItem, removeItem } from '../utils/storage'
import { TOKEN_STORAGE_KEY } from '../config/env'
import * as authService from '../services/authService'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const token = getItem(TOKEN_STORAGE_KEY)
    const promise = token
      ? authService.getCurrentUser()
          .then((userData) => setUser(userData))
          .catch(() => {
            removeItem(TOKEN_STORAGE_KEY)
            setUser(null)
          })
      : Promise.resolve()

    promise.finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const result = await authService.login(email, password)
    setItem(TOKEN_STORAGE_KEY, result.token)
    setUser(result.user)
    return result.user
  }, [])

  const register = useCallback(async (name, email, password) => {
    const result = await authService.register(name, email, password)
    setItem(TOKEN_STORAGE_KEY, result.token)
    setUser(result.user)
    return result.user
  }, [])

  const logout = useCallback(async () => {
    removeItem(TOKEN_STORAGE_KEY)
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const userData = await authService.getCurrentUser()
    setUser(userData)
    return userData
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, register, logout, refreshUser, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
