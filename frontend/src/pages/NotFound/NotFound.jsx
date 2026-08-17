import { Link } from 'react-router-dom'
import Button from '../../components/Button/Button'
import EmptyState from '../../components/EmptyState/EmptyState'
import { ROUTES } from '../../constants'

export default function NotFound() {
  return (
    <div className="page-not-found">
      <EmptyState
        icon={
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
            <line x1="9" y1="9" x2="9.01" y2="9" />
            <line x1="15" y1="9" x2="15.01" y2="9" />
          </svg>
        }
        title="Page not found"
        description="Sorry, we couldn't find the page you're looking for."
        action={
          <Link to={ROUTES.HOME}>
            <Button>Go Home</Button>
          </Link>
        }
      />
    </div>
  )
}
