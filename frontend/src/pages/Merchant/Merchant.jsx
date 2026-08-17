import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMerchant, useFreighter } from '../../hooks'
import { useCopy } from '../../hooks/useCopy'
import { useAuth } from '../../context/AuthContext'
import * as dashboardService from '../../services/dashboardService'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import Input from '../../components/Input/Input'
import Modal from '../../components/Modal/Modal'
import Badge from '../../components/Badge/Badge'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import { ExplorerTxLink } from '../../components/ExplorerLink/ExplorerLink'
import { MerchantSkeleton } from '../../components/Skeleton'
import ErrorCard from '../../components/Error/ErrorCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import { shortenAddress } from '../../utils/format'
import { formatDate } from '../../utils/date'
import './Merchant.css'

const PAYMENT_BASE_URL = `${window.location.origin}/pay`

export default function Merchant() {
  const { user } = useAuth()
  const { profile, loading, error, register, updateProfile, refetch } = useMerchant()
  const { connected: freighterConnected, publicKey: freighterPublicKey, networkLabel: freighterNetwork } = useFreighter()
  const { copy, copied } = useCopy()
  const navigate = useNavigate()
  const [regOpen, setRegOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [formData, setFormData] = useState({ businessName: '', description: '', category: '', businessEmail: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [recentTxns, setRecentTxns] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [extraLoading, setExtraLoading] = useState(true)

  useEffect(() => {
    if (!profile) return
    Promise.all([
      dashboardService.getRecentTransactions(5),
      dashboardService.getCustomerAnalytics(),
    ]).then(([txns, analyticsData]) => {
      setRecentTxns(txns)
      setAnalytics(analyticsData)
    }).catch(() => {
      // non-critical
    }).finally(() => setExtraLoading(false))
  }, [profile])

  if (loading) {
    return (
      <div className="page-merchant slide-up">
        <MerchantSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-merchant slide-up">
        <div className="merchant-header">
          <h1 className="page-title">Merchant Dashboard</h1>
        </div>
        <ErrorCard message={error} onRetry={refetch} />
      </div>
    )
  }

  if (!profile) {
    const isCustomer = user?.role === 'customer'

    return (
      <div className="page-merchant slide-up">
        <div className="merchant-header">
          <h1 className="page-title">Merchant Dashboard</h1>
          {!isCustomer && (
            <Button size="sm" onClick={() => { setFormData({ businessName: '', description: '', category: '', businessEmail: '' }); setRegOpen(true) }}>
              Register Merchant
            </Button>
          )}
        </div>
        <Card>
          {isCustomer ? (
            <EmptyState
              title="Customer accounts cannot become merchants"
              description="Your account is registered as a Customer. Customer accounts can send payments by scanning merchant QR codes but cannot register as merchants."
              action={
                <Link to="/customer/dashboard" className="btn btn--primary" style={{ textDecoration: 'none' }}>
                  Go to Customer Dashboard
                </Link>
              }
            />
          ) : (
            <EmptyState
              title="No merchant profile"
              description="Register as a merchant to start accepting payments"
              action={
                <Button onClick={() => { setFormData({ businessName: '', description: '', category: '', businessEmail: '' }); setRegOpen(true) }}>
                  Register Merchant
                </Button>
              }
            />
          )}
        </Card>

        {!isCustomer && (
          <Modal isOpen={regOpen} onClose={() => setRegOpen(false)} title="Register Merchant">
            <form onSubmit={async (e) => {
              e.preventDefault()
              setFormLoading(true)
              try {
                await register(formData)
                setRegOpen(false)
              } catch { /* handled by hook */ } finally { setFormLoading(false) }
            }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
              <Input label="Business Name" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
              <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
              <Input label="Business Email" type="email" value={formData.businessEmail} onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })} />
              <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <Button type="submit" fullWidth loading={formLoading}>Register</Button>
            </form>
          </Modal>
        )}
      </div>
    )
  }

  const paymentUrl = `${PAYMENT_BASE_URL}/${profile.merchantCode}`
  const totalVolume = analytics?.totalVolume || 0
  const totalCustomers = analytics?.totalCustomers || 0
  const totalTransactions = analytics?.totalTransactions || recentTxns.length
  const avgTransaction = totalTransactions > 0 ? (totalVolume / totalTransactions).toFixed(2) : '0.00'

  return (
    <div className="page-merchant slide-up">
      <div className="merchant-header">
        <div className="merchant-header-info">
          <h1 className="page-title">{profile.businessName}</h1>
          <p className="merchant-subtitle">
            Merchant since {formatDate(profile.createdAt)}
          </p>
        </div>
        <div className="merchant-header-actions">
          <Badge variant={
            profile.verificationStatus === 'Verified' ? 'success' :
            profile.verificationStatus === 'Pending' ? 'warning' :
            profile.verificationStatus === 'Rejected' ? 'error' : 'info'
          }>
            {profile.verificationStatus || 'Active'}
          </Badge>
          <Button size="sm" variant="secondary" onClick={() => { setFormData({ businessName: profile.businessName, description: profile.description, category: profile.category, businessEmail: profile.businessEmail }); setEditOpen(true) }}>
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="merchant-stats">
        <Card variant="elevated" className="stat-card">
          <span className="stat-label">Total Transactions</span>
          <span className="stat-value">{totalTransactions}</span>
          <span className="stat-hint">All time payments</span>
        </Card>
        <Card variant="elevated" className="stat-card">
          <span className="stat-label">Total Volume</span>
          <span className="stat-value">{totalVolume} <span className="stat-currency">XLM</span></span>
          <span className="stat-hint">Lifetime revenue</span>
        </Card>
        <Card variant="elevated" className="stat-card">
          <span className="stat-label">Customers</span>
          <span className="stat-value">{totalCustomers}</span>
          <span className="stat-hint">Lifetime unique customers</span>
        </Card>
        <Card variant="elevated" className="stat-card">
          <span className="stat-label">Avg. Transaction</span>
          <span className="stat-value">{avgTransaction} <span className="stat-currency">XLM</span></span>
          <span className="stat-hint">Per payment</span>
        </Card>
      </div>

      <div className="merchant-columns">
        <div className="merchant-column-left">
          <Card className="merchant-section-card">
            <h3 className="merchant-section-title">Business Details</h3>
            {profile.businessEmail && (
              <div className="merchant-detail-row">
                <span className="merchant-detail-label">Email</span>
                <span className="merchant-detail-value">{profile.businessEmail}</span>
              </div>
            )}
            {profile.category && (
              <div className="merchant-detail-row">
                <span className="merchant-detail-label">Category</span>
                <span className="merchant-detail-value">{profile.category}</span>
              </div>
            )}
            {profile.businessPhone && (
              <div className="merchant-detail-row">
                <span className="merchant-detail-label">Phone</span>
                <span className="merchant-detail-value">{profile.businessPhone}</span>
              </div>
            )}
            {profile.description && (
              <div className="merchant-detail-row merchant-detail-row--column">
                <span className="merchant-detail-label">Description</span>
                <span className="merchant-detail-value">{profile.description}</span>
              </div>
            )}
            <div className="merchant-detail-row">
              <span className="merchant-detail-label">Merchant Code</span>
              <span className="merchant-detail-value merchant-detail-value--mono">{profile.merchantCode}</span>
            </div>
            <div className="merchant-detail-row">
              <span className="merchant-detail-label">Registered</span>
              <span className="merchant-detail-value">{formatDate(profile.createdAt)}</span>
            </div>
          </Card>
        </div>

        <div className="merchant-column-right">
          <Card className="merchant-section-card">
            <h3 className="merchant-section-title">Payment Link</h3>
            <p className="merchant-payment-hint">
              Share this link or display the QR code to receive payments.
            </p>
            <div className="merchant-payment-url">
              <code className="merchant-payment-code">{paymentUrl}</code>
              <Button
                size="sm"
                variant={copied ? 'primary' : 'secondary'}
                onClick={() => copy(paymentUrl)}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </div>
            <Button
              size="sm"
              variant="ghost"
              fullWidth
              onClick={() => navigate('/qr')}
              style={{ marginBottom: 'var(--space-3)' }}
            >
              Manage QR Code →
            </Button>
            <div className="merchant-wallet-section">
              <h4 className="merchant-wallet-label">Wallet Connection</h4>
              <WalletConnect />
              {freighterConnected && freighterPublicKey && (
                <div className="merchant-wallet-address">
                  <span className="merchant-detail-label">Address</span>
                  <span className="merchant-detail-value merchant-detail-value--mono">
                    {shortenAddress(freighterPublicKey, 10)}
                  </span>
                </div>
              )}
              {freighterConnected && freighterNetwork && (
                <div className="merchant-wallet-network">
                  <span className="merchant-detail-label">Network</span>
                  <Badge variant="info">{freighterNetwork}</Badge>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="merchant-section">
        <div className="merchant-section-header">
          <h2 className="merchant-section-title">Recent Transactions</h2>
          {recentTxns.length > 0 && (
            <span className="merchant-section-count">{recentTxns.length} recent</span>
          )}
        </div>
        <Card className="transactions-list">
          {extraLoading ? (
            <div className="merchant-txn-loading">Loading transactions...</div>
          ) : recentTxns.length === 0 ? (
            <EmptyState
              title="No transactions yet"
              description="Recent payments from customers will appear here"
            />
          ) : (
            recentTxns.map((txn) => (
              <div key={txn._id || txn.id} className="txn-row">
                <div className="txn-left">
                  <div className="txn-icon txn-icon--received">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M12 5v14M5 12l7 7 7-7" />
                    </svg>
                  </div>
                  <div>
                    <span className="txn-name">{txn.asset || txn.currency || 'Payment'}</span>
                    <span className="txn-date">{formatDate(txn.createdAt || txn.date)}</span>
                    {txn.customer?.name && (
                      <span className="txn-date" style={{ color: 'var(--color-accent)' }}>
                        {txn.customer.name}
                      </span>
                    )}
                  </div>
                </div>
                <div className="txn-right">
                  <span className="txn-amount txn-amount--received">
                    {txn.amount ? `${txn.amount} ${txn.asset || ''}` : '—'}
                  </span>
                  <div className="txn-actions">
                    <Badge variant={txn.status === 'confirmed' || txn.status === 'completed' ? 'success' : 'warning'}>
                      {txn.status || 'Pending'}
                    </Badge>
                    {txn.transactionHash && (
                      <ExplorerTxLink hash={txn.transactionHash}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </ExplorerTxLink>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>

      <Modal isOpen={regOpen || editOpen} onClose={() => { setRegOpen(false); setEditOpen(false) }} title={editOpen ? 'Edit Merchant' : 'Register Merchant'}>
        <form onSubmit={async (e) => {
          e.preventDefault()
          setFormLoading(true)
          try {
            if (editOpen) {
              await updateProfile(formData)
            } else {
              await register(formData)
            }
            setRegOpen(false); setEditOpen(false)
          } catch { /* handled by hook */ } finally { setFormLoading(false) }
        }} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <Input label="Business Name" value={formData.businessName} onChange={(e) => setFormData({ ...formData, businessName: e.target.value })} required />
          <Input label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
          <Input label="Business Email" type="email" value={formData.businessEmail} onChange={(e) => setFormData({ ...formData, businessEmail: e.target.value })} />
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Button type="submit" fullWidth loading={formLoading}>{editOpen ? 'Save Changes' : 'Register'}</Button>
        </form>
      </Modal>
    </div>
  )
}
