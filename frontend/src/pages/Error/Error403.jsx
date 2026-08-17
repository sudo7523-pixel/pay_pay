import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'
import Button from '../../components/Button/Button'

export default function Error403() {
  return (
    <div className="page-error page-error--403">
      <div className="page-error-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </div>
      <h1 className="page-error-title">Forbidden</h1>
      <p className="page-error-desc">You don't have permission to access this resource.</p>
      <Link to={ROUTES.DASHBOARD}>
        <Button>Go to Dashboard</Button>
      </Link>
    </div>
  )
}
