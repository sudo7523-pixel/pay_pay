import { useState, useCallback, useEffect } from 'react'
import * as freighterService from '../services/freighterService'
import { useBlockchain } from '../context/BlockchainContext'
import { useWalletConnection } from '../context/WalletContext'

const DETECT_TIMEOUT = 10000

export function useFreighter() {
  const { isFreighterInstalled: installed } = useBlockchain()
  const wallet = useWalletConnection()

  const [detecting, setDetecting] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDetecting(false)
    }, installed ? 0 : DETECT_TIMEOUT)
    return () => clearTimeout(timer)
  }, [installed])

  const signAndSubmit = useCallback(async (xdr, opts = {}) => {
    if (!installed) throw new Error('Freighter not installed')
    return freighterService.signTransaction(xdr, opts)
  }, [installed])

  return {
    installed,
    detecting,
    connected: wallet.connected,
    connecting: wallet.connecting,
    publicKey: wallet.publicKey,
    balance: wallet.balance,
    balanceLoading: wallet.balanceLoading,
    balanceError: wallet.balanceError,
    isCorrectNetwork: wallet.isCorrectNetwork,
    networkLabel: wallet.networkLabel,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    fetchBalance: wallet.fetchBalance,
    signTransaction: signAndSubmit,
    getPublicKey: freighterService.getPublicKey,
    getNetwork: freighterService.getNetwork,
    getNetworkDetails: freighterService.getNetworkDetails,
    downloadUrl: freighterService.getFreighterDownloadUrl,
  }
}
