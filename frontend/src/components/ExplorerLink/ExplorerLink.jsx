import { useBlockchain } from '../../context/BlockchainContext'
import './ExplorerLink.css'

export default function ExplorerLink({ type = 'tx', value, children, className }) {
  const { getExplorerLink, network } = useBlockchain()

  if (!value) return null

  const href = getExplorerLink(type, value)
  if (!href) return null

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`explorer-link ${className || ''}`}
      title={`View on Stellar ${network} explorer`}
    >
      {children || (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
          <span>View on Explorer</span>
        </>
      )}
    </a>
  )
}

export function ExplorerAccountLink({ address, ...props }) {
  return <ExplorerLink type="account" value={address} {...props} />
}

export function ExplorerContractLink({ contractId, ...props }) {
  return <ExplorerLink type="contract" value={contractId} {...props} />
}

export function ExplorerTxLink({ hash, ...props }) {
  return <ExplorerLink type="tx" value={hash} {...props} />
}
