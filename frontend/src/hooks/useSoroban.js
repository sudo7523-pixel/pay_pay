import { useState, useCallback, useRef } from 'react'
import * as sorobanService from '../services/sorobanService'
import * as freighterService from '../services/freighterService'
import { useBlockchain } from '../context/BlockchainContext'
import { useToast } from '../context/ToastContext'
import { sleep } from '../utils/helpers'

const POLL_INTERVAL = 2000
const MAX_POLL_RETRIES = 30

async function pollForConfirmation(transactionId, pollingRef) {
  for (let attempt = 1; attempt <= MAX_POLL_RETRIES; attempt++) {
    if (!pollingRef.current) break

    try {
      const status = await sorobanService.verifyTransaction(transactionId)
      if (status.confirmed) return status
      if (status.status === 'FAILED' || status.status === 'Failed') return status
      if (status.status === 'Confirmed') return { ...status, confirmed: true }
    } catch {
      // poll attempt failed, will retry
    }

    if (attempt < MAX_POLL_RETRIES) {
      await sleep(POLL_INTERVAL)
    }
  }

  return { confirmed: false, status: 'TIMEOUT', transactionId }
}

export function useSoroban() {
  const { networkPassphrase } = useBlockchain()
  const { success, error: showError } = useToast()

  const [step, setStep] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const pollingRef = useRef(false)

  const reset = useCallback(() => {
    setStep('idle')
    setResult(null)
    setError(null)
    setLoading(false)
    pollingRef.current = false
  }, [])

  const pay = useCallback(async ({ sessionId, payerAddress, amount, token, memo, reference }) => {
    reset()
    setLoading(true)

    try {
      setStep('intent')
      const intent = await sorobanService.createIntent({
        sessionId,
        payerAddress,
        amount,
        token,
        memo,
        reference,
      })
      setResult((prev) => ({ ...prev, intent }))

      setStep('signing')
      const signedXDR = await freighterService.signTransaction(
        intent.unsignedTransactionXDR,
        { networkPassphrase }
      )
      setResult((prev) => ({ ...prev, signedXDR }))

      setStep('submitting')
      const submission = await sorobanService.submitTransaction({
        transactionId: intent.transactionId,
        signedXDR,
      })
      setResult((prev) => ({ ...prev, submission }))

      setStep('confirming')
      pollingRef.current = true
      const confirmation = await pollForConfirmation(
        submission.transactionHash || submission.transactionId,
        pollingRef
      )

      if (confirmation.confirmed) {
        setStep('confirmed')
        setResult((prev) => ({ ...prev, confirmation }))
        success('Payment confirmed on-chain')
      } else if (confirmation.status === 'FAILED') {
        setStep('failed')
        setResult((prev) => ({ ...prev, confirmation }))
        showError('Transaction failed on-chain')
      } else {
        setStep('submitted')
        setResult((prev) => ({ ...prev, confirmation }))
        success('Transaction submitted, confirmation pending')
      }

      return { intent, submission, confirmation }
    } catch (err) {
      setStep('error')
      setError(err.message || 'Soroban payment failed')
      showError(err.message || 'Soroban payment failed')
      throw err
    } finally {
      setLoading(false)
      pollingRef.current = false
    }
  }, [networkPassphrase, reset, success, showError])

  const verifyStatus = useCallback(async (transactionId) => {
    try {
      const status = await sorobanService.verifyTransaction(transactionId)
      setResult((prev) => ({ ...prev, confirmation: status }))
      return status
    } catch (err) {
      showError(err.message || 'Failed to verify transaction')
      throw err
    }
  }, [showError])

  return {
    step,
    result,
    error,
    loading,
    pay,
    verifyStatus,
    reset,
    isProcessing: ['intent', 'signing', 'submitting', 'confirming'].includes(step),
  }
}
