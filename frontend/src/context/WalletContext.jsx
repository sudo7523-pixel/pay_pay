/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useMemo, useReducer } from 'react'
import * as freighterService from '../services/freighterService'
import * as sorobanService from '../services/sorobanService'
import { useToast } from './ToastContext'
import { useBlockchain } from './BlockchainContext'

function balanceReducer(state, action) {
  switch (action.type) {
    case 'LOADING':
      return { ...state, loading: true }
    case 'SUCCESS':
      return { data: action.payload, loading: false, error: null }
    case 'ERROR':
      return { data: null, loading: false, error: action.payload }
    case 'CLEAR':
      return { data: null, loading: false, error: null }
    default:
      return state
  }
}

const WalletContext = createContext()

export function WalletProvider({ children }) {
  const { network, networkPassphrase } = useBlockchain()
  const { success, error: showError } = useToast()

  const [publicKey, setPublicKey] = useState(null)
  const [connected, setConnected] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [balanceState, dispatchBalance] = useReducer(balanceReducer, { data: null, loading: false, error: null })
  const [walletNetwork, setWalletNetwork] = useState(null)

  const checkConnection = useCallback(async () => {
    try {
      const pk = await freighterService.getPublicKey()
      setPublicKey(pk)
      setConnected(true)

      const details = await freighterService.getNetworkDetails()
      setWalletNetwork(details)
    } catch {
      setPublicKey(null)
      setConnected(false)
      setWalletNetwork(null)
    }
  }, [])

  const connect = useCallback(async () => {
    setConnecting(true)
    try {
      const pk = await freighterService.getPublicKey()
      setPublicKey(pk)
      setConnected(true)

      const details = await freighterService.getNetworkDetails()
      setWalletNetwork(details)

      success('Wallet connected successfully')
      return pk
    } catch (err) {
      showError(err.message || 'Failed to connect wallet')
      throw err
    } finally {
      setConnecting(false)
    }
  }, [success, showError])

  const disconnect = useCallback(() => {
    setPublicKey(null)
    setConnected(false)
    dispatchBalance({ type: 'CLEAR' })
    setWalletNetwork(null)
    success('Wallet disconnected')
  }, [success])

  useEffect(() => {
    if (!connected || !publicKey) return
    let cancelled = false
    dispatchBalance({ type: 'LOADING' })
    sorobanService.getBalance(publicKey)
      .then((result) => { if (!cancelled) dispatchBalance({ type: 'SUCCESS', payload: result }) })
      .catch(() => { if (!cancelled) dispatchBalance({ type: 'ERROR', payload: null }) })
    return () => { cancelled = true }
  }, [connected, publicKey])

  const fetchBalance = useCallback(async () => {
    if (!publicKey) return
    dispatchBalance({ type: 'LOADING' })
    try {
      const result = await sorobanService.getBalance(publicKey)
      dispatchBalance({ type: 'SUCCESS', payload: result })
    } catch {
      dispatchBalance({ type: 'ERROR', payload: null })
    }
  }, [publicKey])

  const isCorrectNetwork = useMemo(() => {
    if (!walletNetwork) return true
    return walletNetwork.networkPassphrase === networkPassphrase
  }, [walletNetwork, networkPassphrase])

  const networkLabel = useMemo(() => {
    if (!walletNetwork) return network
    return walletNetwork.networkPassphrase?.includes('Test') ? 'testnet' : 'mainnet'
  }, [walletNetwork, network])

  const value = useMemo(() => ({
    publicKey,
    connected,
    connecting,
    balance: balanceState.data,
    balanceLoading: balanceState.loading,
    balanceError: balanceState.error,
    walletNetwork,
    isCorrectNetwork,
    networkLabel,
    connect,
    disconnect,
    fetchBalance,
    checkConnection,
  }), [publicKey, connected, connecting, balanceState, walletNetwork, isCorrectNetwork, networkLabel, connect, disconnect, fetchBalance, checkConnection])

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}

export function useWalletConnection() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWalletConnection must be used within WalletProvider')
  return ctx
}
