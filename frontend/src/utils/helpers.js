export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function capitalize(str) {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str, length = 50) {
  if (!str) return ''
  return str.length > length ? `${str.slice(0, length)}...` : str
}

export function generateId() {
  return `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce(fn, ms = 300) {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), ms)
  }
}

export function pluralize(count, singular, plural) {
  return count === 1 ? singular : plural
}
