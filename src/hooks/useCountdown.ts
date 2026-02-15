import { useState, useEffect } from 'react'

interface CountdownResult {
  hours: number
  minutes: number
  seconds: number
  totalSeconds: number
  isExpired: boolean
}

export function useCountdown(targetDate: Date): CountdownResult {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  const diff = targetDate.getTime() - now.getTime()

  if (diff <= 0) {
    return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0, isExpired: true }
  }

  const totalSeconds = Math.floor(diff / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return { hours, minutes, seconds, totalSeconds, isExpired: false }
}
