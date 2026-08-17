import { cn } from '../../utils/helpers'
import './Page.css'

export default function SectionTitle({ children, className }) {
  return (
    <h2 className={cn('section-title', className)}>
      {children}
    </h2>
  )
}
