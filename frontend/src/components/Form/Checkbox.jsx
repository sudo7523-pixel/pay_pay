import './Form.css'

export default function Checkbox({ label, id, error, className, ...props }) {
  const inputId = id || `check-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className={`checkbox-wrapper ${error ? 'checkbox-wrapper--error' : ''} ${className || ''}`}>
      <input type="checkbox" id={inputId} className="checkbox-input" {...props} />
      <label htmlFor={inputId} className="checkbox-label">
        <span className="checkbox-custom" aria-hidden="true">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {label}
      </label>
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
