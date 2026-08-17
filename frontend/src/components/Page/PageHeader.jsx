import { cn } from '../../utils/helpers'
import './Page.css'

export default function PageHeader({ title, subtitle, actions, className }) {
  return (
    <div className={cn('page-header', className)}>
      <div className="page-header-text">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </div>
  )
}
