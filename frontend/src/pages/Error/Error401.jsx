import { Link } from 'react-router-dom'
import { ROUTES } from '../../constants'
import Button from '../../components/Button/Button'

export default function Error401() {
  return (
    <div className="page-error page-error--401">
      <div className="page-error-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      </div>
      <h1 className="page-error-title">Unauthorized</h1>
      <p className="page-error-desc">You need to sign in to access this page.</p>
      <Link to={ROUTES.LOGIN}>
        <Button>Sign In</Button>
      </Link>
    </div>
  )
}
