export function formatPrice(value: number): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}

export function formatPriceWithDollar(value: number): string {
  return `$${formatPrice(value)}`
}

export function maskEmail(email: string): string {
  const [local, domain] = email.split('@')
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local[0]}${local[1]}***@${domain}`
}

export function parsePriceInput(value: string): number {
  // Remove everything except digits
  const cleaned = value.replace(/[^0-9]/g, '')
  return parseInt(cleaned, 10) || 0
}
