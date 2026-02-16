function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

export interface TargetTimeInfo {
  hours: number
  minutes: number
  targetDate: Date
  lockDate: Date
  dateStr: string
  formatted: string
}

/**
 * Generate a deterministic target time from tomorrow's date.
 * Same seed = same time for all users.
 * Players predict today, result reveals tomorrow at the target time.
 */
export function getTargetTime(forDate?: Date): TargetTimeInfo {
  const now = forDate || new Date()
  // Target is always tomorrow — prevents last-second guessing
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)

  const dateStr = tomorrow.toISOString().split('T')[0] // YYYY-MM-DD
  const seed = hashCode(dateStr + 'satoshi')

  const hours = (Math.abs(seed) % 18) + 3 // 03:00 - 20:59 UTC
  const minutes = Math.abs((seed * 31) % 60)

  const targetDate = new Date(tomorrow)
  targetDate.setUTCHours(hours, minutes, 0, 0)

  // Predictions lock at midnight UTC (start of the target day)
  const lockDate = new Date(tomorrow)
  lockDate.setUTCHours(0, 0, 0, 0)

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`

  return { hours, minutes, targetDate, lockDate, dateStr, formatted }
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
