import './Loader.css'

export function Spinner({ size = 'md', className }) {
  const sizeMap = { sm: 20, md: 32, lg: 48 }
  return (
    <span
      className={`spinner spinner--${size} ${className || ''}`}
      style={{ width: sizeMap[size], height: sizeMap[size] }}
      role="status"
      aria-label="Loading"
    />
  )
}

export function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <Spinner size="lg" />
    </div>
  )
}
