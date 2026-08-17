import { cn } from '../../utils/helpers'
import './Page.css'

export default function Section({ children, className }) {
  return (
    <section className={cn('page-section', className)}>
      {children}
    </section>
  )
}
