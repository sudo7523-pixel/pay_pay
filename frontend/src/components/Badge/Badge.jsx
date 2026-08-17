import { cn } from '../../utils/format'
import './Badge.css'

export default function Badge({ children, variant = 'info', className }) {
  return (
    <span className={cn('badge', `badge--${variant}`, className)}>
      {children}
    </span>
  )
}
