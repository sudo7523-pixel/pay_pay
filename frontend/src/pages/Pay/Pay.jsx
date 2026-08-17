import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import * as payService from '../../services/payService'
import * as sorobanService from '../../services/sorobanService'
import * as freighterService from '../../services/freighterService'
import { useFreighter } from '../../hooks'
import { useAuth } from '../../context/AuthContext'
import { useBlockchain } from '../../context/BlockchainContext'
import { useToast } from '../../context/ToastContext'
import { useCopy } from '../../hooks'
import { sleep } from '../../utils/helpers'
import { shortenAddress } from '../../utils/format'
import { formatFullDate } from '../../utils/date'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Badge from '../../components/Badge/Badge'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import { ExplorerTxLink } from '../../components/ExplorerLink/ExplorerLink'
import { PageLoader } from '../../components/Loader/Loader'
import './Pay.css'

const STATE = {
  IDLE: 'IDLE',
  LOADING_MERCHANT: 'LOADING_MERCHANT',
  CREATING_INTENT: 'CREATING_INTENT',
  WAITING_FOR_SIGNATURE: 'WAITING_FOR_SIGNATURE',
  SUBMITTING_TRANSACTION: 'SUBMITTING_TRANSACTION',
  WAITING_FOR_CONFIRMATION: 'WAITING_FOR_CONFIRMATION',
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED',
}

const BASE_DELAY = 1000
const MAX_DELAY = 8000
const TOTAL_TIMEOUT_MS = 60000

function backoffDelay(attempt) {
  const delay = Math.min(BASE_DELAY * Math.pow(2, attempt - 1), MAX_DELAY)
  return delay + Math.random() * 500
}

export default function Pay() {
  const { merchantCode } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated, loading: authLoading } = useAuth()
  const { installed, connected, publicKey, connect, isCorrectNetwork, networkLabel } = useFreighter()
  const { networkPassphrase } = useBlockchain()
  const { success: toastSuccess, error: toastError } = useToast()
  const { copy, copied } = useCopy()

  const [state, setState] = useState(STATE.LOADING_MERCHANT)
  const [merchant, setMerchant] = useState(null)
  const [session, setSession] = useState(null)
  const [amount, setAmount] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)
  const [result, setResult] = useState(null)
  const pollingRef = useRef(false)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      const redirect = encodeURIComponent(`/pay/${merchantCode}`)
      navigate(`/login?redirect=${redirect}`, { replace: true })
      return
    }

    if (user?.role === 'merchant') {
      Promise.resolve().then(() => {
        setErrorMessage('Merchant accounts cannot send payments. Please use a customer account to make payments.')
        setState(STATE.FAILED)
      })
      return
    }

    let cancelled = false
    payService.getMerchantSession(merchantCode)
      .then((data) => {
        if (cancelled) return
        setMerchant(data.merchant)
        setSession(data.session)
        setState(STATE.IDLE)
      })
      .catch((err) => {
        if (cancelled) return
        setErrorMessage(err.message || 'Failed to load merchant')
        setState(STATE.FAILED)
      })
    return () => { cancelled = true }
  }, [merchantCode, isAuthenticated, authLoading, user, navigate])

  const pollForConfirmation = useCallback(async (transactionId) => {
    let attempt = 1
    const startTime = Date.now()

    while (pollingRef.current && (Date.now() - startTime) < TOTAL_TIMEOUT_MS) {
      try {
        const status = await sorobanService.verifyTransaction(transactionId)
        if (status.confirmed) return { ...status, timeout: false }
        if (status.status === 'FAILED' || status.status === 'Failed') return { ...status, timeout: false }
        if (status.status === 'Confirmed') return { ...status, confirmed: true, timeout: false }
      } catch {
        // retry
      }

      const delay = backoffDelay(attempt)
      attempt++
      await sleep(delay)
    }

    pollingRef.current = false
    return { confirmed: false, status: 'TIMEOUT', transactionId, timeout: true }
  }, [])

  const handlePay = useCallback(async () => {
    const parsedAmount = parseFloat(amount)
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      toastError('Please enter a valid amount')
      return
    }

    if (!installed) {
      toastError('Freighter is not installed')
      return
    }

    let payerKey = publicKey
    if (!connected || !payerKey) {
      try {
        payerKey = await connect()
      } catch {
        setState(STATE.CANCELLED)
        setErrorMessage('Wallet connection was cancelled')
        return
      }
    }

    if (!isCorrectNetwork) {
      toastError(`Wrong network. Please switch to ${networkLabel} in Freighter`)
      setState(STATE.FAILED)
      setErrorMessage(`Wrong network detected. Switch to ${networkLabel} in Freighter and try again.`)
      return
    }

    setState(STATE.CREATING_INTENT)
    setErrorMessage(null)
    setResult(null)
    pollingRef.current = true

    try {
      const intent = await sorobanService.createIntent({
        sessionId: session.sessionId,
        payerAddress: payerKey,
        amount: parsedAmount.toString(),
        token: null,
        memo: `Payment to ${merchant.businessName}`,
      })

      setResult((prev) => ({ ...prev, intent }))

      setState(STATE.WAITING_FOR_SIGNATURE)
      let signedXDR
      try {
        signedXDR = await freighterService.signTransaction(
          intent.unsignedTransactionXDR,
          { networkPassphrase }
        )
      } catch (err) {
        pollingRef.current = false
        setState(STATE.CANCELLED)
        setErrorMessage(err.message?.includes('rejected') ? 'Signature rejected' : (err.message || 'Signing cancelled'))
        return
      }

      setResult((prev) => ({ ...prev, signedXDR }))

      setState(STATE.SUBMITTING_TRANSACTION)
      const submission = await sorobanService.submitTransaction({
        transactionId: intent.transactionId,
        signedXDR,
      })
      setResult((prev) => ({ ...prev, submission }))

      setState(STATE.WAITING_FOR_CONFIRMATION)
      const confirmation = await pollForConfirmation(
        submission.transactionId
      )
      setResult((prev) => ({ ...prev, confirmation }))

      if (confirmation.confirmed) {
        setState(STATE.SUCCESS)
        toastSuccess('Payment confirmed on-chain')
      } else if (confirmation.status === 'FAILED' || confirmation.status === 'Failed') {
        setState(STATE.FAILED)
        setErrorMessage('Transaction failed on-chain')
        toastError('Transaction failed on-chain')
      } else if (confirmation.timeout) {
        setState(STATE.FAILED)
        setErrorMessage('Transaction submission confirmed but confirmation timed out. Check the explorer for status.')
        toastError('Confirmation timed out')
      } else {
        setState(STATE.SUCCESS)
        toastSuccess('Payment processed')
      }
    } catch (err) {
      pollingRef.current = false
      setState(STATE.FAILED)
      const msg = err.message || 'Payment failed'
      setErrorMessage(msg)
      toastError(msg)
    }
  }, [amount, installed, connected, publicKey, connect, isCorrectNetwork, networkLabel, session, merchant, merchantCode, networkPassphrase, pollForConfirmation, toastSuccess, toastError])

  const handleCancel = useCallback(() => {
    pollingRef.current = false
    setState(STATE.CANCELLED)
    setErrorMessage('Payment cancelled')
  }, [])

  const handleReset = useCallback(() => {
    setState(STATE.IDLE)
    setErrorMessage(null)
    setResult(null)
    pollingRef.current = false
  }, [])

  const isProcessing = [
    STATE.CREATING_INTENT,
    STATE.WAITING_FOR_SIGNATURE,
    STATE.SUBMITTING_TRANSACTION,
    STATE.WAITING_FOR_CONFIRMATION,
  ].includes(state)

  function renderMerchantCard() {
    return (
      <Card variant="elevated" className="pay-merchant-card">
        <div className="pay-merchant-logo">
          {merchant.logo ? (
            <img src={merchant.logo} alt={merchant.businessName} className="pay-merchant-logo-img" />
          ) : (
            <div className="pay-merchant-logo-fallback">
              {merchant.businessName?.charAt(0) || '?'}
            </div>
          )}
        </div>
        <div className="pay-merchant-info">
          <h2 className="pay-merchant-name">{merchant.businessName}</h2>
          {merchant.category && (
            <p className="pay-merchant-category">{merchant.category}</p>
          )}
          <p className="pay-merchant-code">{merchantCode}</p>
          {session && (
            <p className="pay-merchant-expiry">
              Session expires {formatFullDate(session.expiresAt)}
            </p>
          )}
        </div>
      </Card>
    )
  }

  function renderAmountInput() {
    return (
      <Card className="pay-amount-card">
        <Input
          label="Payment Amount"
          type="number"
          step="0.01"
          min="0.01"
          placeholder="0.00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isProcessing}
        />
        <div className="pay-currency-info">
          <Badge variant="info">XLM</Badge>
          <span className="pay-currency-hint">Stellar Lumens on Soroban</span>
        </div>
      </Card>
    )
  }

  function renderWalletSection() {
    return (
      <Card className="pay-wallet-card">
        <h3 className="pay-section-title">Wallet</h3>
        <WalletConnect />
      </Card>
    )
  }

  function renderPayButton() {
    const canPay = !isProcessing && !connected
      ? true
      : isProcessing
        ? false
        : connected && publicKey && isCorrectNetwork

    return (
      <div className="pay-actions">
        <Button
          fullWidth
          size="lg"
          onClick={handlePay}
          disabled={!canPay && !isProcessing}
          loading={isProcessing}
        >
          {state === STATE.CREATING_INTENT ? 'Creating Payment...' :
           state === STATE.WAITING_FOR_SIGNATURE ? 'Check Freighter...' :
           state === STATE.SUBMITTING_TRANSACTION ? 'Submitting...' :
           state === STATE.WAITING_FOR_CONFIRMATION ? 'Confirming...' :
           connected && publicKey && isCorrectNetwork ? `Pay ${amount || '0.00'} XLM` :
           connected ? 'Connect Wallet First' :
           'Pay with Freighter'}
        </Button>
        {isProcessing && (
          <Button
            fullWidth
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="pay-cancel-btn"
          >
            Cancel Payment
          </Button>
        )}
      </div>
    )
  }

  function renderLoadingSkeleton() {
    return (
      <div className="pay-loading">
        <div className="pay-skeleton-card" />
        <div className="pay-skeleton-card" />
        <div className="pay-skeleton-card" />
        <div className="pay-skeleton-btn" />
      </div>
    )
  }

  function renderSuccess() {
    const txHash = result?.submission?.transactionHash || result?.confirmation?.transactionHash
    const ledger = result?.confirmation?.ledger

    return (
      <div className="pay-result pay-result--success">
        <div className="pay-result-icon">✓</div>
        <h2 className="pay-result-title">Payment Successful</h2>
        <Card className="pay-receipt">
          <div className="pay-receipt-row">
            <span className="pay-receipt-label">Merchant</span>
            <span className="pay-receipt-value">{merchant?.businessName}</span>
          </div>
          <div className="pay-receipt-row">
            <span className="pay-receipt-label">Amount</span>
            <span className="pay-receipt-value">{amount} XLM</span>
          </div>
          <div className="pay-receipt-row">
            <span className="pay-receipt-label">Token</span>
            <span className="pay-receipt-value">XLM (Native)</span>
          </div>
          {txHash && (
            <>
              <div className="pay-receipt-row">
                <span className="pay-receipt-label">Transaction Hash</span>
                <span className="pay-receipt-value pay-receipt-value--mono">
                  {shortenAddress(txHash, 8)}
                  <button
                    className="pay-copy-btn"
                    onClick={() => copy(txHash)}
                    title="Copy transaction hash"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </span>
              </div>
              <div className="pay-receipt-row">
                <span className="pay-receipt-label">Explorer</span>
                <ExplorerTxLink hash={txHash} />
              </div>
            </>
          )}
          {ledger && (
            <div className="pay-receipt-row">
              <span className="pay-receipt-label">Ledger</span>
              <span className="pay-receipt-value">{ledger}</span>
            </div>
          )}
          <div className="pay-receipt-row">
            <span className="pay-receipt-label">Status</span>
            <Badge variant="success">Confirmed On-Chain</Badge>
          </div>
          <div className="pay-receipt-row">
            <span className="pay-receipt-label">Time</span>
            <span className="pay-receipt-value">{formatFullDate(new Date().toISOString())}</span>
          </div>
        </Card>
        <Button fullWidth variant="secondary" onClick={() => window.location.reload()}>
          New Payment
        </Button>
      </div>
    )
  }

  function renderFailed() {
    const isMerchantBlocked = user?.role === 'merchant'

    return (
      <div className="pay-result pay-result--failed">
        <div className="pay-result-icon pay-result-icon--error">✕</div>
        <h2 className="pay-result-title">{isMerchantBlocked ? 'Merchant Access Denied' : 'Payment Failed'}</h2>
        <p className="pay-result-message">{errorMessage || 'An unexpected error occurred'}</p>
        {isMerchantBlocked ? (
          <div className="pay-result-actions">
            <Link to="/customer/register" className="btn btn--primary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Create a Customer Account
            </Link>
            <Link to="/dashboard" className="btn btn--secondary" style={{ textAlign: 'center', textDecoration: 'none' }}>
              Go to Merchant Dashboard
            </Link>
          </div>
        ) : (
          <>
            {result?.submission?.transactionHash && (
              <div className="pay-failed-hash">
                <span className="pay-failed-hash-label">Transaction:</span>
                <ExplorerTxLink hash={result.submission.transactionHash} />
              </div>
            )}
            <div className="pay-result-actions">
              <Button fullWidth onClick={handleReset}>Try Again</Button>
              <Button fullWidth variant="secondary" onClick={() => window.location.reload()}>
                Start Over
              </Button>
            </div>
          </>
        )}
      </div>
    )
  }

  function renderCancelled() {
    return (
      <div className="pay-result pay-result--cancelled">
        <div className="pay-result-icon pay-result-icon--cancelled">—</div>
        <h2 className="pay-result-title">Payment Cancelled</h2>
        <p className="pay-result-message">{errorMessage || 'Payment was cancelled'}</p>
        <div className="pay-result-actions">
          <Button fullWidth onClick={handleReset}>Try Again</Button>
        </div>
      </div>
    )
  }

  function renderContent() {
    switch (state) {
      case STATE.LOADING_MERCHANT:
        return renderLoadingSkeleton()

      case STATE.FAILED:
        if (!merchant) {
          return (
            <div className="pay-result pay-result--failed">
              <div className="pay-result-icon pay-result-icon--error">✕</div>
              <h2 className="pay-result-title">Unable to Load Merchant</h2>
              <p className="pay-result-message">{errorMessage || 'Merchant not found'}</p>
              <Button fullWidth variant="secondary" onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          )
        }
        return renderFailed()

      case STATE.SUCCESS:
        return renderSuccess()

      case STATE.CANCELLED:
        return renderCancelled()

      default:
        return (
          <>
            {renderMerchantCard()}
            {renderAmountInput()}
            {renderWalletSection()}
            {renderPayButton()}
          </>
        )
    }
  }

  if (authLoading) {
    return (
      <div className="pay-page">
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="pay-page">
      <div className="pay-container">
        <div className="pay-brand">
          <div className="pay-brand-icon">CP</div>
          <span className="pay-brand-name">PayStream</span>
        </div>
        <h1 className="pay-heading">Complete Payment</h1>
        {renderContent()}
        {state === STATE.SUCCESS && (
          <div className="pay-dashboard-link">
            <Link to="/customer/dashboard">View all your payments →</Link>
          </div>
        )}
      </div>
    </div>
  )
}
