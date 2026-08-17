import { useState } from 'react'
import { useCopy, useWallet, useFreighter } from '../../hooks'
import * as walletService from '../../services/walletService'
import Card from '../../components/Card/Card'
import Badge from '../../components/Badge/Badge'
import Button from '../../components/Button/Button'
import WalletConnect from '../../components/WalletConnect/WalletConnect'
import { WalletSkeleton } from '../../components/Skeleton'
import ErrorCard from '../../components/Error/ErrorCard'
import EmptyState from '../../components/EmptyState/EmptyState'

import './Wallet.css'

export default function Wallet() {
  const { wallet, assets, loading, error, refetch, refreshBalance } = useWallet()
  const { copy, copied } = useCopy()
  const { connected, publicKey, balance, balanceLoading, fetchBalance } = useFreighter()
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState(null)

  async function handleLink() {
    if (!publicKey) return
    setLinking(true)
    setLinkError(null)
    try {
      await walletService.linkWallet(publicKey)
      await refetch()
    } catch (err) {
      setLinkError(err.message || 'Failed to link wallet')
    } finally {
      setLinking(false)
    }
  }

  if (loading && !connected) {
    return (
      <div className="page-wallet slide-up">
        <WalletSkeleton />
      </div>
    )
  }

  if (error && !connected) {
    return (
      <div className="page-wallet slide-up">
        <div className="wallet-header">
          <h1 className="page-title">Wallet</h1>
        </div>
        <ErrorCard message={error} onRetry={refetch} />
      </div>
    )
  }

  if (!wallet && !connected) {
    return (
      <div className="page-wallet slide-up">
        <div className="wallet-header">
          <h1 className="page-title">Wallet</h1>
        </div>
        <Card>
          <EmptyState
            title="No wallet linked"
            description="Link a Stellar wallet to start receiving payments"
            action={
              <Button variant="primary" size="sm" disabled>Link Wallet</Button>
            }
          />
        </Card>
      </div>
    )
  }

  const freighterBalances = balance?.balances || []

  return (
    <div className="page-wallet slide-up">
      <div className="wallet-header">
        <h1 className="page-title">Wallet</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
          {connected && (
            <Button variant="secondary" size="sm" onClick={fetchBalance} loading={balanceLoading}>
              Refresh Balance
            </Button>
          )}
          <Button variant="secondary" size="sm" onClick={refreshBalance} loading={loading}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="wallet-connection-section">
        <WalletConnect />
      </div>

      {connected && !wallet && (
        <Card className="wallet-link-card">
          <div className="wallet-link-content">
            <h3 className="wallet-section-subtitle">Link Wallet to Account</h3>
            <p className="wallet-link-description">
              Connect your Freighter wallet to your merchant account to start receiving payments.
            </p>
            {linkError && <p className="wallet-link-error">{linkError}</p>}
            <Button onClick={handleLink} loading={linking} variant="primary" size="md">
              Link This Wallet
            </Button>
          </div>
        </Card>
      )}

      {connected && (
        <div className="wallet-balances">
          <h3 className="wallet-section-subtitle">Live Blockchain Balances</h3>
          {freighterBalances.length === 0 && !balanceLoading ? (
            <Card variant="elevated" className="wallet-asset">
              <div className="asset-left">
                <div className="asset-icon asset-icon--xlm">
                  <span>*</span>
                </div>
                <div>
                  <span className="asset-name">XLM</span>
                  <span className="asset-desc">Stellar Lumens</span>
                </div>
              </div>
              <div className="asset-right">
                <span className="asset-amount">—</span>
                <Badge variant="info">Live</Badge>
              </div>
            </Card>
          ) : (
            freighterBalances.map((bal, idx) => {
              const code = bal.asset_type === 'native' ? 'XLM' : (bal.asset_code || 'Unknown')
              const issuer = bal.asset_issuer || ''
              const amount = bal.balance != null ? parseFloat(bal.balance).toFixed(2) : '—'
              return (
                <Card key={code + idx} variant="elevated" className="wallet-asset">
                  <div className="asset-left">
                    <div className={`asset-icon asset-icon--${code.toLowerCase()}`}>
                      <span>{code === 'USDC' ? '$' : '*'}</span>
                    </div>
                    <div>
                      <span className="asset-name">{code}</span>
                      <span className="asset-desc">{issuer || 'Stellar'}</span>
                    </div>
                  </div>
                  <div className="asset-right">
                    <span className="asset-amount">{amount} {code}</span>
                    <Badge variant="success">Live</Badge>
                  </div>
                </Card>
              )
            })
          )}
          {balanceLoading && (
            <div className="wallet-balance-loading">Loading live balances...</div>
          )}
        </div>
      )}

      {wallet && (
        <div className="wallet-balances">
          <h3 className="wallet-section-subtitle">Wallet Details</h3>
          {assets.length === 0 ? (
            <Card variant="elevated" className="wallet-asset">
              <div className="asset-left">
                <div className="asset-icon asset-icon--xlm">
                  <span>*</span>
                </div>
                <div>
                  <span className="asset-name">XLM</span>
                  <span className="asset-desc">Stellar Lumens</span>
                </div>
              </div>
              <div className="asset-right">
                <span className="asset-amount">—</span>
                <Badge variant={wallet.walletStatus === 'Verified' ? 'success' : 'warning'}>
                  {wallet.walletStatus || 'Unknown'}
                </Badge>
              </div>
            </Card>
          ) : (
            assets.map((asset) => (
              <Card key={asset.code} variant="elevated" className="wallet-asset">
                <div className="asset-left">
                  <div className={`asset-icon asset-icon--${asset.code.toLowerCase()}`}>
                    <span>{asset.code === 'USDC' ? '$' : '*' }</span>
                  </div>
                  <div>
                    <span className="asset-name">{asset.code}</span>
                    <span className="asset-desc">{asset.issuer || ''}</span>
                  </div>
                </div>
                <div className="asset-right">
                  <span className="asset-amount">
                    {asset.balance != null ? asset.balance.toFixed(2) : '—'} {asset.code}
                  </span>
                  <Badge variant={wallet.walletStatus === 'Verified' ? 'success' : 'warning'}>
                    {wallet.walletStatus || 'Unknown'}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      <Card className="wallet-address-section">
        <h3 className="wallet-address-label">Wallet Address</h3>
        <div className="wallet-address-value">
          <code>{connected ? publicKey : (wallet?.walletAddress || 'No address set')}</code>
          {(connected || wallet?.walletAddress) && (
            <Button variant="ghost" size="sm" onClick={() => copy(connected ? publicKey : wallet?.walletAddress)}>
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          )}
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <Badge variant="info">{connected ? 'freighter' : (wallet?.network || 'testnet')}</Badge>
          <Badge variant="info">{connected ? 'Freighter' : (wallet?.walletProvider || 'Stellar')}</Badge>
        </div>
      </Card>
    </div>
  )
}
