import { cn } from '../../utils/format'
import './Card.css'

export default function Card({
  children,
  variant = 'simple',
  padding = true,
  className,
  onClick,
  ...props
}) {
  return (
    <div
      className={cn(
        'card',
        `card--${variant}`,
        padding && 'card--padded',
        onClick && 'card--clickable',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e) } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
