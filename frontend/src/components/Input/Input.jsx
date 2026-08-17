import { useState, useId } from 'react'
import './Input.css'

export default function Input({
  label,
  error,
  type = 'text',
  id,
  className,
  ...props
}) {
  const [focused, setFocused] = useState(false)
  const generatedId = useId()
  const inputId = id || generatedId

  return (
    <div className={`input-group ${error ? 'input-group--error' : ''} ${className || ''}`}>
      {label && (
        <label htmlFor={inputId} className="input-label">
          {label}
        </label>
      )}
      <div className={`input-wrapper ${focused ? 'input-wrapper--focused' : ''}`}>
        <input
          id={inputId}
          type={type}
          className="input"
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className="input-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
