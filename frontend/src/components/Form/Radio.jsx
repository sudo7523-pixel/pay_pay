import './Form.css'

export default function Radio({ label, name, value, checked, onChange, ...props }) {
  const inputId = `radio-${name}-${value}`

  return (
    <div className="radio-wrapper">
      <input
        type="radio"
        id={inputId}
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="radio-input"
        {...props}
      />
      <label htmlFor={inputId} className="radio-label">
        <span className="radio-custom" aria-hidden="true" />
        {label}
      </label>
    </div>
  )
}
