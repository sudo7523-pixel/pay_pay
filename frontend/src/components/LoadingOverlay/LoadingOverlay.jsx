import { Spinner } from '../Loader/Loader'
import './LoadingOverlay.css'

export default function LoadingOverlay() {
  return (
    <div className="loading-overlay" role="progressbar" aria-label="Loading">
      <Spinner size="lg" />
    </div>
  )
}
