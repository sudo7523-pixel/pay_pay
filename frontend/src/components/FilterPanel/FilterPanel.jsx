import { cn } from '../../utils/helpers'
import './FilterPanel.css'

export default function FilterPanel({ filters, activeFilters, onChange, className }) {
  function handleToggle(key, value) {
    const current = activeFilters[key] || []
    const exists = current.includes(value)
    const next = exists ? current.filter(v => v !== value) : [...current, value]
    onChange({ ...activeFilters, [key]: next.length ? next : undefined })
  }

  function clearAll() {
    onChange({})
  }

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== undefined)

  return (
    <div className={cn('filter-panel', className)}>
      {filters.map((group) => (
        <div key={group.key} className="filter-group">
          <span className="filter-group-label">{group.label}</span>
          <div className="filter-options">
            {group.options.map((opt) => {
              const isActive = (activeFilters[group.key] || []).includes(opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  className={cn('filter-chip', isActive && 'filter-chip--active')}
                  onClick={() => handleToggle(group.key, opt.value)}
                >
                  {opt.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {hasActiveFilters && (
        <button type="button" className="filter-clear" onClick={clearAll}>
          Clear all
        </button>
      )}
    </div>
  )
}
