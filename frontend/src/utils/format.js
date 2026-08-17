export { cn } from './helpers'
export { formatDate, formatFullDate, formatRelativeTime } from './date'

export function formatCurrency(amount, currency = 'USDC') {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ` ${currency}`
}

export function shortenAddress(address, chars = 6) {
  if (!address) return ''
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}
