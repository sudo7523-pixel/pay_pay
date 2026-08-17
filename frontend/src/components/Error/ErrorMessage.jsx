import { cn } from '../../utils/helpers'
import './Error.css'

export default function ErrorMessage({ message, onRetry, className }) {
  return (
    <div className={cn('error-message', className)} role="alert">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
      <span className="error-text">{message}</span>
      {onRetry && (
        <button className="error-retry" onClick={onRetry} type="button">
          Retry
        </button>
      )}
    </div>
  )
}
