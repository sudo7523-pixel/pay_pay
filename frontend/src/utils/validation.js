export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password) {
  return password.length >= 8
}

export function isValidStellarAddress(address) {
  return /^G[A-Z0-9]{55}$/.test(address)
}

export function isValidAmount(value) {
  const num = parseFloat(value)
  return !isNaN(num) && num > 0
}

export function isRequired(value) {
  if (typeof value === 'string') return value.trim().length > 0
  return value !== null && value !== undefined
}

export function minLength(min) {
  return (value) => value.length >= min
}

export function maxLength(max) {
  return (value) => value.length <= max
}

export function validate(rules, values) {
  const errors = {}
  for (const [field, validators] of Object.entries(rules)) {
    for (const validator of validators) {
      const error = validator(values[field])
      if (error) {
        errors[field] = error
        break
      }
    }
  }
  return errors
}
