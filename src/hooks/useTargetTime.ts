import { useMemo } from 'react'
import { getTargetTime, type TargetTimeInfo } from '../utils/targetTime'

export function useTargetTime(): TargetTimeInfo {
  return useMemo(() => getTargetTime(), [])
}
