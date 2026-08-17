import { useState, useRef } from 'react'
import { useClickOutside } from '../../hooks'
import { cn } from '../../utils/helpers'
import './SortDropdown.css'

export default function SortDropdown({ options, value, onChange, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useClickOutside(ref, () => setOpen(false))

  const activeLabel = options.find(o => o.value === value)?.label || 'Sort'

  function handleSelect(optValue) {
    onChange(optValue)
    setOpen(false)
  }

  return (
    <div ref={ref} className={cn('sort-dropdown', className)}>
      <button
        type="button"
        className="sort-dropdown-trigger"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="8" y1="12" x2="20" y2="12" />
          <line x1="12" y1="18" x2="20" y2="18" />
        </svg>
        {activeLabel}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="sort-dropdown-chevron">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && (
        <div className="sort-dropdown-menu" role="listbox">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={cn('sort-dropdown-item', opt.value === value && 'sort-dropdown-item--active')}
              onClick={() => handleSelect(opt.value)}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
