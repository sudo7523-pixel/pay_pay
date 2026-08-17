import { useFreighter } from '../../hooks'
import Badge from '../Badge/Badge'
import { shortenAddress } from '../../utils/format'
import './WalletStatus.css'

export default function WalletStatus({ compact = false, className }) {
  const { installed, detecting, connected, publicKey, networkLabel, isCorrectNetwork } = useFreighter()

  if (detecting) return null

  if (!installed || !connected) {
    return (
      <div className={`wallet-status ${compact ? 'wallet-status--compact' : ''} ${className || ''}`} title="Wallet not connected">
        <span className="wallet-status__dot wallet-status__dot--offline" />
        {!compact && <span className="wallet-status__label">Not Connected</span>}
      </div>
    )
  }

  const dotClass = isCorrectNetwork ? 'wallet-status__dot--online' : 'wallet-status__dot--warning'
  const statusLabel = isCorrectNetwork ? 'Connected' : 'Wrong Network'

  return (
    <div className={`wallet-status ${compact ? 'wallet-status--compact' : ''} ${className || ''}`} title={publicKey ? `${statusLabel}: ${publicKey}` : statusLabel}>
      <span className={`wallet-status__dot ${dotClass}`} />
      {compact ? (
        <Badge variant={isCorrectNetwork ? 'success' : 'warning'}>{networkLabel}</Badge>
      ) : (
        <>
          <div className="wallet-status__info">
            <span className="wallet-status__label">{statusLabel}</span>
            {publicKey && (
              <span className="wallet-status__address">{shortenAddress(publicKey, 5)}</span>
            )}
          </div>
          <Badge variant={isCorrectNetwork ? 'success' : 'warning'}>{networkLabel}</Badge>
        </>
      )}
    </div>
  )
}
