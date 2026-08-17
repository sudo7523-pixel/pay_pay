import Card from '../Card/Card'
import ErrorMessage from './ErrorMessage'
import './Error.css'

export default function ErrorCard({ message, onRetry, className }) {
  return (
    <Card className={`error-card ${className || ''}`}>
      <ErrorMessage message={message} onRetry={onRetry} />
    </Card>
  )
}
