import { cn } from '../../utils/helpers'
import './Page.css'

export default function PageContainer({ children, className }) {
  return (
    <div className={cn('page-container', className)}>
      {children}
    </div>
  )
}
