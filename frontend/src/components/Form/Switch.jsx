import './Form.css'

export default function Switch({ label, id, ...props }) {
  const inputId = id || `switch-${label?.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div className="switch-wrapper">
      <input type="checkbox" id={inputId} className="switch-input" role="switch" {...props} />
      <label htmlFor={inputId} className="switch-label">
        <span className="switch-track" aria-hidden="true">
          <span className="switch-thumb" />
        </span>
        {label}
      </label>
    </div>
  )
}
