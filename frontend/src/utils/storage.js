export function getItem(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or unavailable
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key)
  } catch {
    // Unavailable
  }
}

export function clear() {
  try {
    localStorage.clear()
  } catch {
    // Unavailable
  }
}
