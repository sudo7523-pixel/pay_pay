import { useToast } from '../../context/ToastContext'
import Toast from './Toast'
import './Toast.css'

export default function ToastContainer() {
  const { toasts } = useToast()

  if (toasts.length === 0) return null

  return (
    <div className="toast-container" aria-label="Notifications">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  )
}
