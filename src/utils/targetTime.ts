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
 * Generate a deterministic target time for today's date.
 * Same seed = same time for all users.
 * Players predict before the target time, result reveals when it passes.
 */
export function getTargetTime(forDate?: Date): TargetTimeInfo {
  const now = forDate || new Date()
  const today = new Date(now)

  const dateStr = today.toISOString().split('T')[0] // YYYY-MM-DD
  const seed = hashCode(dateStr + 'satoshi')

  const hours = (Math.abs(seed) % 18) + 3 // 03:00 - 20:59 UTC
  const minutes = Math.abs((seed * 31) % 60)

  const targetDate = new Date(today)
  targetDate.setUTCHours(hours, minutes, 0, 0)

  // Predictions lock at the target time (can predict any time before it)
  const lockDate = new Date(targetDate)

  const formatted = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`

  return { hours, minutes, targetDate, lockDate, dateStr, formatted }
}

export function formatDateShort(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}
