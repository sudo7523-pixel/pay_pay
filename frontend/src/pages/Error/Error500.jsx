import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'
import Button from '../../components/Button/Button'

export default function Error500() {
  return (
    <div className="page-error page-error--500">
      <div className="page-error-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>
      <h1 className="page-error-title">Server Error</h1>
      <p className="page-error-desc">Something went wrong on our end. Please try again later.</p>
      <Link to={ROUTES.HOME}>
        <Button>Go Home</Button>
      </Link>
    </div>
  )
}
