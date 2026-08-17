import './Form.css'

export default function FormField({ label, error, required, children }) {
  return (
    <div className={`form-field ${error ? 'form-field--error' : ''}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required" aria-hidden="true"> *</span>}
        </label>
      )}
      {children}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  )
}
