import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboard, useFreighter } from '../../hooks'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import { ExplorerTxLink } from '../../components/ExplorerLink/ExplorerLink'
import { DashboardSkeleton } from '../../components/Skeleton'
import ErrorCard from '../../components/Error/ErrorCard'
import EmptyState from '../../components/EmptyState/EmptyState'
import { shortenAddress } from '../../utils/format'
import { formatDate } from '../../utils/date'
import './Dashboard.css'

export default function Dashboard() {
  const { user } = useAuth()
  const { wallet, merchant, recentTxns, customerAnalytics, loading, error, refetch } = useDashboard()
  const { connected: freighterConnected, publicKey: freighterPublicKey, networkLabel: freighterNetwork, installed: freighterInstalled } = useFreighter()

  if (user?.role === 'customer') {
    return <Navigate to="/customer/dashboard" replace />
  }

  const firstName = user?.name?.split(' ')[0] || 'User'

  if (loading) {
    return (
      <div className="page-dashboard slide-up">
        <DashboardSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-dashboard slide-up">
        <div className="dashboard-welcome">
          <h1 className="dashboard-greeting">Welcome back, {firstName}</h1>
        </div>
        <ErrorCard message={error} onRetry={refetch} />
      </div>
    )
  }

  return (
    <div className="page-dashboard slide-up">
      <div className="dashboard-welcome">
        <h1 className="dashboard-greeting">Welcome back, {firstName}</h1>
        <p className="dashboard-subtitle">Here's your financial overview</p>
      </div>

      <div className="dashboard-balances">
        <Card variant="elevated" className="balance-card">
          <span className="balance-label">Wallet Status</span>
          <span className="balance-amount">
            {freighterConnected ? (
              <Badge variant="success">Connected</Badge>
            ) : freighterInstalled ? (
              <Badge variant="warning">Available</Badge>
            ) : wallet ? (
              <Badge variant={wallet.walletStatus === 'Verified' ? 'success' : 'warning'}>{wallet.walletStatus || 'Unknown'}</Badge>
            ) : 'Not linked'}
          </span>
          {freighterConnected ? (
            <span className="balance-hint">{freighterNetwork}</span>
          ) : wallet?.network && (
            <span className="balance-hint">{wallet.network}</span>
          )}
        </Card>
        <Card variant="elevated" className="balance-card">
          <span className="balance-label">Wallet Address</span>
          <span className="balance-addr">
            {freighterConnected ? shortenAddress(freighterPublicKey, 8) : (shortenAddress(wallet?.walletAddress, 8) || '—')}
          </span>
          <span className="balance-hint">{freighterConnected ? 'Freighter' : (wallet?.walletProvider || 'Stellar')}</span>
        </Card>
        <Card variant="elevated" className="balance-card">
          <span className="balance-label">Merchant Status</span>
          <span className="balance-amount">
            {merchant ? (
              <Badge variant={merchant.verificationStatus === 'Verified' ? 'success' : merchant.verificationStatus === 'Pending' ? 'warning' : 'info'}>
                {merchant.verificationStatus || 'Active'}
              </Badge>
            ) : freighterConnected ? (
              <Badge variant="info">Ready to Register</Badge>
            ) : 'Not registered'}
          </span>
          {merchant?.merchantCode && (
            <span className="balance-hint">{merchant.merchantCode}</span>
          )}
          {!merchant && freighterConnected && (
            <a href="/merchant" className="balance-hint" style={{ color: 'var(--color-accent)', textDecoration: 'none' }}>
              Register as Merchant →
            </a>
          )}
        </Card>
        <Card variant="elevated" className="balance-card">
          <span className="balance-label">Wallet Connection</span>
          <WalletConnect />
        </Card>
      </div>

      {customerAnalytics && (
        <div className="dashboard-section">
          <h2 className="dashboard-section-title">Customer Analytics</h2>
          <div className="dashboard-balances">
            <Card variant="elevated" className="balance-card">
              <span className="balance-label">Total Customers</span>
              <span className="balance-amount">{customerAnalytics.totalCustomers || 0}</span>
              <span className="balance-hint">Lifetime unique customers</span>
            </Card>
            <Card variant="elevated" className="balance-card">
              <span className="balance-label">Repeat Customers</span>
              <span className="balance-amount">{customerAnalytics.repeatCustomers || 0}</span>
              <span className="balance-hint">{customerAnalytics.uniqueCustomerRate || 0}% return rate</span>
            </Card>
            <Card variant="elevated" className="balance-card">
              <span className="balance-label">New This Month</span>
              <span className="balance-amount">{customerAnalytics.newCustomersThisMonth || 0}</span>
              <span className="balance-hint">First-time customers</span>
            </Card>
          </div>

          {customerAnalytics.topCustomers && customerAnalytics.topCustomers.length > 0 && (
            <Card className="transactions-list" style={{ marginTop: 'var(--space-4)' }}>
              <h3 style={{ padding: 'var(--space-4)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)', color: 'var(--color-text-secondary)' }}>
                Top Customers
              </h3>
              {customerAnalytics.topCustomers.slice(0, 5).map((c, i) => (
                <div key={c._id || i} className="txn-row">
                  <div className="txn-left">
                    <div className="txn-icon txn-icon--received">
                      <span>{c.name?.charAt(0) || '?'}</span>
                    </div>
                    <div>
                      <span className="txn-name">{c.name || 'Unknown'}</span>
                      {c.email && <span className="txn-date">{c.email}</span>}
                    </div>
                  </div>
                  <div className="txn-right">
                    <span className="txn-amount txn-amount--received">
                      {c.totalSpent || 0} XLM
                    </span>
                    <span className="txn-date">{c.paymentCount || 0} payment{c.paymentCount !== 1 ? 's' : ''}</span>
                  </div>
                </div>
              ))}
            </Card>
          )}
        </div>
      )}

      <div className="dashboard-section">
        <h2 className="dashboard-section-title">Recent Activity</h2>
        <Card className="transactions-list">
          {recentTxns.length === 0 ? (
            <EmptyState
              title="No recent activity"
              description="Your recent transactions will appear here"
            />
          ) : (
            recentTxns.map((txn) => (
              <div key={txn._id || txn.id} className="txn-row">
                <div className="txn-left">
                  <div className={`txn-icon txn-icon--received`}>
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
    </div>
  )
}
