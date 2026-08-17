import { useFreighter } from '../../hooks'
import Button from '../Button/Button'
import Badge from '../Badge/Badge'
import { shortenAddress } from '../../utils/format'
import './WalletConnect.css'

export default function WalletConnect({ onConnect, onDisconnect, className }) {
  const {
    installed,
    detecting,
    connected,
    connecting,
    publicKey,
    isCorrectNetwork,
    networkLabel,
    connect,
    disconnect,
    downloadUrl,
  } = useFreighter()

  if (detecting) {
    return (
      <div className={`wallet-connect wallet-connect--detecting ${className || ''}`}>
        <span className="wallet-connect__dot wallet-connect__dot--neutral" />
        <span className="wallet-connect__text">Detecting wallet...</span>
      </div>
    )
  }

  if (!installed) {
    return (
      <div className={`wallet-connect wallet-connect--unavailable ${className || ''}`}>
        <span className="wallet-connect__dot wallet-connect__dot--error" />
        <span className="wallet-connect__text">Freighter Not Installed</span>
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="wallet-connect__link"
        >
          Install Freighter
        </a>
      </div>
    )
  }

  if (connecting) {
    return (
      <div className={`wallet-connect wallet-connect--connecting ${className || ''}`}>
        <span className="wallet-connect__dot wallet-connect__dot--neutral" />
        <span className="wallet-connect__text">Connecting...</span>
      </div>
    )
  }

  if (connected && !isCorrectNetwork) {
    return (
      <div className={`wallet-connect wallet-connect--wrong-network ${className || ''}`}>
        <span className="wallet-connect__dot wallet-connect__dot--warning" />
        <div className="wallet-connect__info">
          <span className="wallet-connect__text">Wrong Network</span>
          <span className="wallet-connect__hint">
            Switch to {networkLabel} in Freighter
          </span>
        </div>
        <Badge variant="warning">{networkLabel}</Badge>
      </div>
    )
  }

  if (connected && publicKey) {
    return (
      <div className={`wallet-connect wallet-connect--connected ${className || ''}`}>
        <span className="wallet-connect__dot wallet-connect__dot--success" />
        <div className="wallet-connect__info">
          <span className="wallet-connect__text">Connected</span>
          <span className="wallet-connect__address">{shortenAddress(publicKey, 6)}</span>
        </div>
        <Badge variant="success">{networkLabel}</Badge>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { disconnect(); onDisconnect?.() }}
        >
          Disconnect
        </Button>
      </div>
    )
  }

  return (
    <div className={`wallet-connect wallet-connect--idle ${className || ''}`}>
      <span className="wallet-connect__dot wallet-connect__dot--neutral" />
      <span className="wallet-connect__text">Connect a Stellar wallet to interact with the blockchain</span>
      <Button
        variant="primary"
        size="sm"
        onClick={async () => {
          try {
            await connect()
            onConnect?.()
          } catch {
            // Toast handles the error
          }
        }}
      >
        Connect Wallet
      </Button>
    </div>
  )
}
