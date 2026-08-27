import { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCustomer } from '../../hooks/useCustomer'
import { useFreighter, useContractQueries } from '../../hooks'
import * as payService from '../../services/payService'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Badge from '../../components/Badge/Badge'
import Modal from '../../components/Modal/Modal'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import { ExplorerTxLink } from '../../components/ExplorerLink/ExplorerLink'
import QRScanner from '../../components/QRScanner/QRScanner'
import { DashboardSkeleton } from '../../components/Skeleton'
import ErrorCard from '../../components/Error/ErrorCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import Pagination from '../../components/Pagination/Pagination'
import { shortenAddress } from '../../utils/format'
import { formatDate, formatFullDate } from '../../utils/date'
import './CustomerDashboard.css'

export default function CustomerDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const {
    profile, loading, error, transactions, txnLoading, page, totalPages, total,
    statusFilter, searchQuery, sort,
    receipt, receiptLoading,
    updateProfile, fetchReceipt,
    goToPage, setFilter, setSearch, setSortBy, refetch,
  } = useCustomer()
  const { publicKey, connected, connect } = useFreighter()
  const {
    config: contractConfig,
    customerTotal: onChainCustomerTotal,
    loading: contractLoading,
    fetchConfig,
    fetchCustomerTotal,
    getInfo,
  } = useContractQueries()

  // Fetch on-chain data when wallet is connected
  useEffect(() => {
    fetchConfig()
  }, [])

  useEffect(() => {
    if (connected && publicKey) {
      fetchCustomerTotal(publicKey)
    }
  }, [connected, publicKey, fetchCustomerTotal])

  const [walletModalOpen, setWalletModalOpen] = useState(false)
  const [receiptModalOpen, setReceiptModalOpen] = useState(false)
  const [walletAddress, setWalletAddress] = useState('')
  const [walletLoading, setWalletLoading] = useState(false)
  const [selectedTxn, setSelectedTxn] = useState(null)
  const [scannerOpen, setScannerOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [scannedMerchant, setScannedMerchant] = useState(null)
  const [scannedCode, setScannedCode] = useState(null)
  const [scanLoading, setScanLoading] = useState(false)
  const [scanError, setScanError] = useState(null)

  const firstName = user?.name?.split(' ')[0] || profile?.user?.name?.split(' ')[0] || 'Customer'

  const handleQRScan = useCallback(async (merchantCode) => {
    setScannerOpen(false)
    setScanLoading(true)
    setScanError(null)
    setScannedCode(merchantCode)
    try {
      const data = await payService.getMerchantSession(merchantCode)
      setScannedMerchant(data.merchant)
      setPreviewOpen(true)
    } catch (err) {
      setScanError(err.message || 'Failed to load merchant details')
    } finally {
      setScanLoading(false)
    }
  }, [])

  function handleScannerClose() {
    setScannerOpen(false)
    setScannedMerchant(null)
    setScannedCode(null)
    setScanError(null)
  }

  function handlePreviewClose() {
    setPreviewOpen(false)
    setScannedMerchant(null)
    setScannedCode(null)
    setScanError(null)
  }

  function handleProceedToPay() {
    if (scannedCode) {
      navigate(`/pay/${scannedCode}`)
    }
  }

  async function handleLinkWallet() {
    if (!walletAddress.trim()) return
    setWalletLoading(true)
    try {
      await updateProfile({ walletAddress: walletAddress.trim() })
      setWalletModalOpen(false)
    } catch {
      // handled by hook
    } finally {
      setWalletLoading(false)
    }
  }

  async function handleViewReceipt(txn) {
    setSelectedTxn(txn)
    setReceiptModalOpen(true)
    await fetchReceipt(txn._id)
  }

  if (loading) {
    return (
      <div className="page-customer-dashboard slide-up">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-customer-dashboard slide-up">
        <div className="customer-dashboard-header">
          <h1 className="page-title">My Payments</h1>
        </div>
        <ErrorCard message={error} onRetry={refetch} />
      </div>
    )
  }

  function renderStatusBadge(status) {
    const variants = {
      Confirmed: 'success',
      Submitted: 'info',
      Pending: 'warning',
      Failed: 'error',
      Expired: 'error',
    }
    return <Badge variant={variants[status] || 'info'}>{status || 'Unknown'}</Badge>
  }

  function renderReceiptModal() {
    return (
      <Modal isOpen={receiptModalOpen} onClose={() => { setReceiptModalOpen(false); setReceiptModalOpen(false) }} title="Payment Receipt">
        {receiptLoading ? (
          <div className="customer-receipt-loading">Loading receipt...</div>
        ) : receipt ? (
          <div className="customer-receipt">
            <div className="customer-receipt-row">
              <span className="customer-receipt-label">Merchant</span>
              <span className="customer-receipt-value">{receipt.merchant?.businessName || '—'}</span>
            </div>
            <div className="customer-receipt-row">
              <span className="customer-receipt-label">Amount</span>
              <span className="customer-receipt-value">{receipt.payment?.amount} {receipt.payment?.asset}</span>
            </div>
            <div className="customer-receipt-row">
              <span className="customer-receipt-label">Status</span>
              <span className="customer-receipt-value">{renderStatusBadge(receipt.receipt?.status)}</span>
            </div>
            {receipt.receipt?.transactionHash && (
              <div className="customer-receipt-row">
                <span className="customer-receipt-label">Explorer</span>
                <span className="customer-receipt-value">
                  <ExplorerTxLink hash={receipt.receipt.transactionHash} />
                </span>
              </div>
            )}
            {receipt.receipt?.ledger && (
              <div className="customer-receipt-row">
                <span className="customer-receipt-label">Ledger</span>
                <span className="customer-receipt-value">{receipt.receipt.ledger}</span>
              </div>
            )}
            {receipt.timestamp && (
              <div className="customer-receipt-row">
                <span className="customer-receipt-label">Time</span>
                <span className="customer-receipt-value">{formatFullDate(receipt.timestamp)}</span>
              </div>
            )}
          </div>
        ) : (
          <p className="customer-receipt-empty">Receipt data not available.</p>
        )}
      </Modal>
    )
  }

  return (
    <div className="page-customer-dashboard slide-up">
      <div className="customer-dashboard-header">
        <div>
          <h1 className="page-title">My Payments</h1>
          <p className="customer-dashboard-subtitle">Welcome back, {firstName}</p>
        </div>
        <Button
          size="lg"
          className="customer-scan-btn"
          onClick={() => { setScannerOpen(true); setScannedMerchant(null); setScannedCode(null); setScanError(null) }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 'var(--space-2)' }}>
            <path d="M3 7V5a2 2 0 012-2h2" />
            <path d="M17 3h2a2 2 0 012 2v2" />
            <path d="M21 17v2a2 2 0 01-2 2h-2" />
            <path d="M7 21H5a2 2 0 01-2-2v-2" />
            <path d="M7 12h10" />
          </svg>
          Scan QR
        </Button>
      </div>

      {scanError && (
        <div className="customer-scan-error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          <span>{scanError}</span>
          <button className="customer-scan-error-dismiss" onClick={() => setScanError(null)} aria-label="Dismiss">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <div className="customer-dashboard-cards">
        <Card variant="elevated" className="customer-stat-card">
          <span className="customer-stat-label">Total Payments</span>
          <span className="customer-stat-value">{profile?.paymentCount || 0}</span>
        </Card>
        <Card variant="elevated" className="customer-stat-card">
          <span className="customer-stat-label">Total Spent</span>
          <span className="customer-stat-value">{profile?.totalSpent || '0'} XLM</span>
        </Card>
        <Card variant="elevated" className="customer-stat-card">
          <span className="customer-stat-label">Wallet</span>
          <span className="customer-stat-value">
            {connected ? (
              <Badge variant="success">Connected</Badge>
            ) : profile?.walletAddress ? (
              <span className="customer-wallet-addr">{shortenAddress(profile.walletAddress, 6)}</span>
            ) : (
              <Badge variant="warning">Not linked</Badge>
            )}
          </span>
        </Card>
      </div>

      <Card className="customer-profile-card">
        <div className="customer-profile-info">
          <div className="customer-profile-avatar">
            {profile?.user?.name?.charAt(0) || user?.name?.charAt(0) || '?'}
          </div>
          <div>
            <h3 className="customer-profile-name">{profile?.user?.name || user?.name}</h3>
            <p className="customer-profile-email">{profile?.user?.email || user?.email}</p>
            {profile?.createdAt && (
              <p className="customer-profile-member">Member since {formatDate(profile.createdAt)}</p>
            )}
          </div>
        </div>
        <div className="customer-profile-actions">
          {!connected && !profile?.walletAddress && (
            <Button size="sm" variant="secondary" onClick={() => setWalletModalOpen(true)}>
              Link Wallet
            </Button>
          )}
          {connected && (
            <div className="customer-profile-wallet">
              <WalletConnect />
            </div>
          )}
        </div>
      </Card>

      {/* ── Blockchain Verification: Direct On-Chain Data ── */}
      <Card variant="elevated" className="customer-blockchain-card">
        <div className="customer-blockchain-header">
          <h3 className="customer-blockchain-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px', verticalAlign: 'middle' }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Blockchain Verification
          </h3>
          <Badge variant="info">Direct Soroban RPC</Badge>
        </div>
        <p className="customer-blockchain-desc">
          Data fetched directly from the deployed PayStream smart contract via Soroban RPC — no backend involved.
        </p>
        <div className="customer-blockchain-grid">
          <div className="customer-blockchain-item">
            <span className="customer-blockchain-label">Contract Status</span>
            <span className="customer-blockchain-value">
              {contractLoading ? '…' : contractConfig ? (
                <Badge variant={contractConfig.paused ? 'warning' : 'success'}>
                  {contractConfig.paused ? 'Paused' : 'Active'}
                </Badge>
              ) : '—'}
            </span>
          </div>
          <div className="customer-blockchain-item">
            <span className="customer-blockchain-label">Fee (basis points)</span>
            <span className="customer-blockchain-value">
              {contractLoading ? '…' : contractConfig?.fee_bps != null ? `${contractConfig.fee_bps} bps` : '—'}
            </span>
          </div>
          <div className="customer-blockchain-item">
            <span className="customer-blockchain-label">On-Chain Payments</span>
            <span className="customer-blockchain-value">
              {contractLoading ? '…' : connected && onChainCustomerTotal != null ? (
                <>{onChainCustomerTotal.toString()} <Badge variant="success">Verified On-Chain</Badge></>
              ) : (
                <span style={{ opacity: 0.6 }}>Connect wallet to verify</span>
              )}
            </span>
          </div>
          <div className="customer-blockchain-item">
            <span className="customer-blockchain-label">Contract ID</span>
            <span className="customer-blockchain-value customer-blockchain-mono">
              {shortenAddress(getInfo().contractId || '', 8)}
            </span>
          </div>
        </div>
      </Card>

      <div className="customer-section">
        <div className="customer-section-header">
          <h2 className="customer-section-title">Payment History</h2>
          {total > 0 && (
            <span className="customer-section-count">{total} payment{total !== 1 ? 's' : ''}</span>
          )}
        </div>

        <div className="customer-toolbar">
          <div className="customer-toolbar-left">
            <Input
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => setSearch(e.target.value)}
              className="customer-search-input"
            />
          </div>
          <div className="customer-toolbar-right">
            <select
              className="customer-filter-select"
              value={statusFilter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Submitted">Submitted</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
            </select>
            <select
              className="customer-filter-select"
              value={sort}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>

        <Card>
          {txnLoading ? (
            <div className="customer-txn-loading">Loading transactions...</div>
          ) : transactions.length === 0 ? (
            <EmptyState
              title="No payments yet"
              description="Scan a merchant QR code to make your first payment"
            />
          ) : (
            <div className="customer-txn-list">
              {transactions.map((txn) => (
                <div key={txn._id} className="customer-txn-row">
                  <div className="customer-txn-left">
                    <div className="customer-txn-merchant-icon">
                      {txn.merchant?.businessName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <span className="customer-txn-merchant">
                        {txn.merchant?.businessName || 'Unknown Merchant'}
                      </span>
                      <span className="customer-txn-date">{formatDate(txn.createdAt)}</span>
                    </div>
                  </div>
                  <div className="customer-txn-center">
                    <span className="customer-txn-amount">{txn.amount} {txn.asset}</span>
                    {txn.merchant?.merchantCode && (
                      <span className="customer-txn-code">{txn.merchant.merchantCode}</span>
                    )}
                  </div>
                  <div className="customer-txn-right">
                    {renderStatusBadge(txn.status)}
                    <div className="customer-txn-actions">
                      {txn.transactionHash && (
                        <ExplorerTxLink hash={txn.transactionHash}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                            <polyline points="15 3 21 3 21 9" />
                            <line x1="10" y1="14" x2="21" y2="3" />
                          </svg>
                        </ExplorerTxLink>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewReceipt(txn)}
                      >
                        Receipt
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          )}
        </Card>
      </div>

      <Modal isOpen={walletModalOpen} onClose={() => setWalletModalOpen(false)} title="Link Wallet">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <p className="customer-modal-hint">
            Enter your Stellar wallet address or connect Freighter to link your wallet.
          </p>
          <WalletConnect />
          <div className="customer-wallet-divider">
            <span>Or enter manually</span>
          </div>
          <Input
            label="Stellar Public Key"
            placeholder="G..."
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
          />
          <Button fullWidth loading={walletLoading} onClick={handleLinkWallet}>
            Save Wallet
          </Button>
        </div>
      </Modal>

      <QRScanner
        isOpen={scannerOpen}
        onClose={handleScannerClose}
        onScan={handleQRScan}
      />

      <Modal isOpen={previewOpen} onClose={handlePreviewClose} title="Confirm Merchant" className="qr-scanner-modal">
        <div className="qr-scanner-preview">
          <div className="qr-scanner-preview-merchant">
            {scannedMerchant?.logo ? (
              <img src={scannedMerchant.logo} alt="" className="qr-scanner-preview-logo-img" />
            ) : (
              <div className="qr-scanner-preview-logo">
                {scannedMerchant?.businessName?.charAt(0) || '?'}
              </div>
            )}
            <div className="qr-scanner-preview-info">
              <span className="qr-scanner-preview-name">{scannedMerchant?.businessName}</span>
              <span className="qr-scanner-preview-code">{scannedMerchant?.merchantCode}</span>
            </div>
          </div>
          <p className="qr-scanner-preview-detail">
            You are about to send a payment to this merchant.
          </p>
          {scanError && <p className="qr-scanner-error-text">{scanError}</p>}
          <div className="qr-scanner-preview-actions">
            <Button fullWidth onClick={handleProceedToPay}>
              Proceed to Pay
            </Button>
            <Button fullWidth variant="ghost" onClick={handlePreviewClose}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {renderReceiptModal()}
    </div>
  )
}
