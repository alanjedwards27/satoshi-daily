import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useBtcPrice } from '../hooks/useBtcPrice'
import { useTargetTime } from '../hooks/useTargetTime'
import { calculateAccuracy, type AccuracyResult } from '../utils/accuracy'

type GamePhase = 'predicting' | 'locked' | 'revealed'

interface DayData {
  date: string
  predictions: number[]
  bonusUnlocked: boolean
  result: AccuracyResult | null
  actualPrice: number | null
}

interface Stats {
  streak: number
  played: number
  bestAccuracy: number
  totalAccuracy: number
}

interface HistoryEntry {
  date: string
  prediction: number
  actual: number
  accuracy: number
}

interface GameContextValue {
  // Current state
  phase: GamePhase
  dayData: DayData
  stats: Stats
  history: HistoryEntry[]

  // Price data
  btcPrice: number
  btcChange24h: number
  btcLoading: boolean

  // Target time
  targetTime: ReturnType<typeof useTargetTime>

  // Actions
  submitPrediction: (price: number) => void
  unlockBonus: () => void
  revealResult: () => void

  // Debug
  forceReveal: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0]
}

const EMPTY_DAY: DayData = {
  date: '',
  predictions: [],
  bonusUnlocked: false,
  result: null,
  actualPrice: null,
}

const EMPTY_STATS: Stats = {
  streak: 0,
  played: 0,
  bestAccuracy: 0,
  totalAccuracy: 0,
}

export function GameProvider({ children }: { children: ReactNode }) {
  const { price: btcPrice, change24h: btcChange24h, loading: btcLoading } = useBtcPrice()
  const targetTime = useTargetTime()

  const [dayData, setDayData] = useLocalStorage<DayData>('sd_day', EMPTY_DAY)
  const [stats, setStats] = useLocalStorage<Stats>('sd_stats', EMPTY_STATS)
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('sd_history', [])

  const today = getTodayStr()

  // Day rollover: if stored day doesn't match today, reset day data
  useEffect(() => {
    if (dayData.date && dayData.date !== today) {
      // Check if yesterday was played for streak
      setDayData({ ...EMPTY_DAY, date: today })
    } else if (!dayData.date) {
      setDayData({ ...EMPTY_DAY, date: today })
    }
  }, [today, dayData.date, setDayData])

  const maxGuesses = dayData.bonusUnlocked ? 2 : 1

  const phase: GamePhase = useMemo(() => {
    if (dayData.result) return 'revealed'
    if (dayData.predictions.length >= maxGuesses) return 'locked'
    return 'predicting'
  }, [dayData.result, dayData.predictions.length, maxGuesses])

  const submitPrediction = useCallback((price: number) => {
    setDayData(prev => ({
      ...prev,
      date: today,
      predictions: [...prev.predictions, price],
    }))
  }, [today, setDayData])

  const unlockBonus = useCallback(() => {
    setDayData(prev => ({ ...prev, bonusUnlocked: true }))
  }, [setDayData])

  const doReveal = useCallback((overridePrice?: number) => {
    const actualPrice = overridePrice || btcPrice

    setDayData(prev => {
      if (prev.result) return prev

      // Find best prediction
      let bestPrediction = prev.predictions[0]
      let bestDiff = Math.abs(bestPrediction - actualPrice)

      for (const p of prev.predictions) {
        const diff = Math.abs(p - actualPrice)
        if (diff < bestDiff) {
          bestDiff = diff
          bestPrediction = p
        }
      }

      const result = calculateAccuracy(bestPrediction, actualPrice)

      // Update stats
      setStats(s => ({
        streak: s.streak + 1,
        played: s.played + 1,
        bestAccuracy: Math.max(s.bestAccuracy, result.accuracy),
        totalAccuracy: s.totalAccuracy + result.accuracy,
      }))

      // Update history
      setHistory(h => [
        { date: today, prediction: bestPrediction, actual: actualPrice, accuracy: result.accuracy },
        ...h.slice(0, 4), // Keep last 5
      ])

      return { ...prev, result, actualPrice }
    })
  }, [btcPrice, today, setDayData, setStats, setHistory])

  const revealResult = useCallback(() => doReveal(), [doReveal])

  // Auto-reveal if target time has passed
  useEffect(() => {
    if (phase === 'locked' && !dayData.result) {
      const now = new Date()
      if (now >= targetTime.targetDate) {
        doReveal()
      }
    }
  }, [phase, dayData.result, targetTime.targetDate, doReveal])

  const forceReveal = useCallback(() => {
    doReveal(btcPrice)
  }, [doReveal, btcPrice])

  return (
    <GameContext.Provider value={{
      phase,
      dayData,
      stats,
      history,
      btcPrice,
      btcChange24h,
      btcLoading,
      targetTime,
      submitPrediction,
      unlockBonus,
      revealResult,
      forceReveal,
    }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
