import { useQR } from '../../hooks'
import { useCopy } from '../../hooks'
import Card from '../../components/Card/Card'
import Button from '../../components/Button/Button'
import Badge from '../../components/Badge/Badge'
import { WalletSkeleton } from '../../components/Skeleton'
import ErrorCard from '../../components/Error/ErrorCard'
import EmptyState from '../../components/EmptyState/EmptyState'

import './QR.css'

export default function QR() {
  const { qr, merchant, loading, error, generating, paymentLink, generate, regenerate, disable, refetch } = useQR()
  const { copy, copied } = useCopy()

  if (loading) {
    return (
      <div className="page-qr slide-up">
        <WalletSkeleton />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-qr slide-up">
        <div className="qr-header">
          <h1 className="page-title">QR Code</h1>
        </div>
        <ErrorCard message={error} onRetry={refetch} />
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="page-qr slide-up">
        <div className="qr-header">
          <h1 className="page-title">QR Code</h1>
        </div>
        <Card>
          <EmptyState
            title="No merchant profile"
            description="Register a merchant profile first to generate QR codes"
            action={
              <Button variant="primary" size="sm" disabled>Generate QR</Button>
            }
          />
        </Card>
      </div>
    )
  }

  return (
    <div className="page-qr slide-up">
      <div className="qr-header">
        <h1 className="page-title">QR Code</h1>
      </div>

      <Card className="qr-card">
        <p className="qr-label">{merchant.businessName || 'Merchant'} — Scan to pay</p>

        {qr?.images?.png ? (
          <div className="qr-visual">
            <img src={qr.images.png} alt={`QR code for ${merchant.businessName}`} style={{ width: 180, height: 180 }} />
          </div>
        ) : qr?.images?.svg ? (
          <div className="qr-visual" dangerouslySetInnerHTML={{ __html: qr.images.svg }} />
        ) : (
          <div className="qr-visual" aria-hidden="true">
            <div className="qr-grid">
              {Array.from({ length: 11 }).map((_, i) => (
                <div key={i} className="qr-row">
                  {Array.from({ length: 11 }).map((_, j) => (
                    <div key={j} className={`qr-cell ${(i + j) % 3 === 0 || (i * j) % 5 === 0 ? 'qr-cell--filled' : ''} ${(i === 0 || i === 10 || j === 0 || j === 10) ? 'qr-cell--border' : ''}`} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {merchant.merchantCode && (
          <p className="qr-address">
            <code>{merchant.merchantCode}</code>
          </p>
        )}

        {qr && (
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Badge variant={qr.active ? 'success' : 'error'}>{qr.active ? 'Active' : 'Disabled'}</Badge>
            <Badge variant="info">v{qr.version || 1}</Badge>
            {qr.createdAt && <Badge variant="info">Created {new Date(qr.createdAt).toLocaleDateString()}</Badge>}
          </div>
        )}

        {!qr && (
          <p className="qr-hint">
            Generate a QR code to start receiving payments
          </p>
        )}

        <div className="qr-actions">
          {!qr ? (
            <Button fullWidth loading={generating} onClick={generate}>
              Generate QR Code
            </Button>
          ) : (
            <>
              {qr.images?.png && (
                <Button fullWidth variant="secondary" onClick={() => {
                  const link = document.createElement('a')
                  link.download = `PayStream-qr-${merchant.merchantCode}.png`
                  link.href = qr.images.png
                  link.click()
                }}>
                  Download QR Code
                </Button>
              )}
              {paymentLink && (
                <Button fullWidth variant="secondary" onClick={() => copy(paymentLink)}>
                  {copied ? 'Copied!' : 'Copy Payment Link'}
                </Button>
              )}
              <Button fullWidth variant="secondary" loading={generating} onClick={regenerate}>
                Regenerate QR
              </Button>
              <Button fullWidth variant="secondary" onClick={disable}>
                Disable QR
              </Button>
            </>
          )}
        </div>
      </Card>
    </div>
  )
}
