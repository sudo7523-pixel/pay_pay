/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { detectFreighter } from '../services/freighterService'
import {
  SOROBAN_CONTRACT_ID,
  SOROBAN_RPC_URL,
  STELLAR_NETWORK,
  STELLAR_NETWORK_PASSPHRASE,
  EXPLORER_URL,
} from '../config/env'

const BlockchainContext = createContext()

export function BlockchainProvider({ children }) {
  const [installed, setInstalled] = useState(false)
  const [rpcStatus, setRpcStatus] = useState(null)

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    const check = async () => {
      if (cancelled) return
      attempts++
      const detected = await detectFreighter()
      if (cancelled) return
      if (detected) {
        setInstalled(true)
        return
      }
      if (attempts < 10) {
        setTimeout(check, 1000)
      }
    }

    check()

    return () => { cancelled = true }
  }, [])

  const explorerUrl = useMemo(() => EXPLORER_URL, [])

  const getExplorerLink = useCallback((type, value) => {
    if (!value) return null
    switch (type) {
      case 'tx':
      case 'transaction':
        return `${explorerUrl}/tx/${value}`
      case 'account':
      case 'address':
        return `${explorerUrl}/account/${value}`
      case 'contract':
        return `${explorerUrl}/contract/${value}`
      case 'ledger':
        return `${explorerUrl}/ledger/${value}`
      default:
        return `${explorerUrl}/tx/${value}`
    }
  }, [explorerUrl])

  const value = useMemo(() => ({
    isFreighterInstalled: installed,
    contractId: SOROBAN_CONTRACT_ID,
    rpcUrl: SOROBAN_RPC_URL,
    network: STELLAR_NETWORK,
    networkPassphrase: STELLAR_NETWORK_PASSPHRASE,
    explorerUrl,
    getExplorerLink,
    rpcStatus,
    setRpcStatus,
  }), [installed, explorerUrl, rpcStatus, getExplorerLink])

  return (
    <BlockchainContext.Provider value={value}>
      {children}
    </BlockchainContext.Provider>
  )
}

export function useBlockchain() {
  const ctx = useContext(BlockchainContext)
  if (!ctx) throw new Error('useBlockchain must be used within BlockchainProvider')
  return ctx
}
