import { useState, useRef, useEffect } from 'react'
import './Dropdown.css'

export default function Dropdown({ trigger, children, align = 'left' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="dropdown" ref={ref}>
      <div onClick={() => setOpen(!open)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') setOpen(!open) }} aria-haspopup="true" aria-expanded={open}>
        {trigger}
      </div>
      {open && (
        <div className={`dropdown-menu dropdown-menu--${align}`}>
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ children, onClick }) {
  return (
    <button className="dropdown-item" onClick={onClick} type="button">
      {children}
    </button>
  )
}
