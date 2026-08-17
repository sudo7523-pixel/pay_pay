import './Form.css'

export default function Form({ children, onSubmit, className }) {
  function handleSubmit(e) {
    e.preventDefault()
    onSubmit?.(e)
  }

  return (
    <form className={`form ${className || ''}`} onSubmit={handleSubmit} noValidate>
      {children}
    </form>
  )
}
