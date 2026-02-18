import { createContext, useContext, type ReactNode, useCallback, useMemo, useEffect, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { useBtcPrice } from '../hooks/useBtcPrice'
import { useTargetTime } from '../hooks/useTargetTime'
import { calculateAccuracy, type AccuracyResult } from '../utils/accuracy'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'

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
  predictions: number[]
  actual: number | null       // null = result pending
  accuracy: number | null     // null = result pending
  targetTime: string | null   // e.g. "14:30 UTC" — shown when pending
}

interface GameContextValue {
  // Current state
  phase: GamePhase
  dayData: DayData
  stats: Stats
  history: HistoryEntry[]

  // Guess tier info
  maxGuesses: number          // 1 = free only, 2 = email unlocked, 3 = share unlocked
  canGuess: boolean
  needsEmail: boolean         // true when they need to sign up for guess 2
  needsShare: boolean         // true when they need to share for guess 3

  // Price data
  btcPrice: number
  btcChange24h: number
  btcLoading: boolean

  // Target time
  targetTime: ReturnType<typeof useTargetTime>

  // Actions
  submitPrediction: (price: number) => void
  unlockBonus: (platform: string) => void
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
  const { user } = useAuth()
  const { price: btcPrice, change24h: btcChange24h, loading: btcLoading } = useBtcPrice()
  const targetTime = useTargetTime()

  // localStorage as fast cache
  const [dayData, setDayData] = useLocalStorage<DayData>('sd_day', EMPTY_DAY)
  const [stats, setStats] = useLocalStorage<Stats>('sd_stats', EMPTY_STATS)
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('sd_history', [])
  const [synced, setSynced] = useState(false)
  const [syncedDate, setSyncedDate] = useState('')

  const today = getTodayStr()

  // Day rollover: if stored day doesn't match today, reset day data
  useEffect(() => {
    if (dayData.date && dayData.date !== today) {
      setDayData({ ...EMPTY_DAY, date: today })
      setSynced(false) // Re-sync on new day
      setSyncedDate('')
    } else if (!dayData.date) {
      setDayData({ ...EMPTY_DAY, date: today })
    }
  }, [today, dayData.date, setDayData])

  // Sync predictions to/from Supabase
  // Runs when: user signs in, or new day starts
  useEffect(() => {
    if (!user || (synced && syncedDate === today)) return
    // Don't sync until day rollover has completed
    if (dayData.date !== today) return

    async function syncToServer() {
      // If there are local predictions that haven't been saved to Supabase yet
      // (i.e., the anonymous first guess), sync them now
      if (dayData.predictions.length > 0 && dayData.date === today) {
        for (let i = 0; i < dayData.predictions.length; i++) {
          // Check if this prediction already exists on server
          const { data: existing } = await supabase
            .from('predictions')
            .select('id')
            .eq('user_id', user!.id)
            .eq('game_date', today)
            .eq('guess_number', i + 1)
            .maybeSingle()

          if (!existing) {
            await supabase.from('predictions').insert({
              user_id: user!.id,
              game_date: today,
              predicted_price: dayData.predictions[i],
              guess_number: i + 1,
            })
          }
        }

        // Sync bonus unlock if it exists locally
        if (dayData.bonusUnlocked) {
          const { data: existingBonus } = await supabase
            .from('bonus_unlocks')
            .select('id')
            .eq('user_id', user!.id)
            .eq('game_date', today)
            .maybeSingle()

          if (!existingBonus) {
            await supabase.from('bonus_unlocks').insert({
              user_id: user!.id,
              game_date: today,
              platform: 'synced',
            })
          }
        }
      }
    }

    async function syncFromServer() {
      try {
        // First push any local predictions to server
        await syncToServer()

        // Then fetch server state (source of truth after sync)
        const { data: predictions } = await supabase
          .from('predictions')
          .select('predicted_price, guess_number')
          .eq('user_id', user!.id)
          .eq('game_date', today)
          .order('guess_number', { ascending: true })

        // Fetch bonus unlock status
        const { data: bonus } = await supabase
          .from('bonus_unlocks')
          .select('id')
          .eq('user_id', user!.id)
          .eq('game_date', today)
          .maybeSingle()

        // Fetch today's result (if game has been resolved)
        const { data: dailyResult } = await supabase
          .from('daily_results')
          .select('actual_price')
          .eq('game_date', today)
          .maybeSingle()

        const serverPredictions = predictions?.map(p => Number(p.predicted_price)) || []
        const bonusUnlocked = !!bonus

        // Merge: use server predictions if they exist, otherwise keep local
        const mergedPredictions = serverPredictions.length > 0
          ? serverPredictions
          : dayData.predictions

        if (mergedPredictions.length > 0 || bonusUnlocked) {
          const actualPrice = dailyResult?.actual_price ? Number(dailyResult.actual_price) : null

          // Determine max guesses for this user state
          const syncMaxGuesses = bonusUnlocked ? 3 : 2 // authenticated user has at least 2

          // Only compute result if they've used all their guesses AND actual price exists
          let result: AccuracyResult | null = null
          if (actualPrice && mergedPredictions.length > 0 && mergedPredictions.length >= syncMaxGuesses) {
            const bestPrediction = mergedPredictions.reduce((best, p) =>
              Math.abs(p - actualPrice) < Math.abs(best - actualPrice) ? p : best
            , mergedPredictions[0])
            result = calculateAccuracy(bestPrediction, actualPrice)
          }

          setDayData({
            date: today,
            predictions: mergedPredictions,
            bonusUnlocked,
            result,
            actualPrice,
          })
        }

        // Fetch user stats from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('current_streak, last_played_date')
          .eq('id', user!.id)
          .single()

        // Fetch recent history (last 5 games)
        const { data: historyData } = await supabase
          .from('predictions')
          .select('game_date, predicted_price')
          .eq('user_id', user!.id)
          .order('game_date', { ascending: false })
          .limit(20) // fetch extra, we'll dedupe by date

        // Fetch all daily_results (including pending ones without actual_price)
        const { data: results } = await supabase
          .from('daily_results')
          .select('game_date, actual_price, target_hour, target_minute')
          .order('game_date', { ascending: false })
          .limit(10)

        if (historyData && results) {
          const resultsMap = new Map(results.map(r => [r.game_date, {
            actual: r.actual_price ? Number(r.actual_price) : null,
            targetTime: `${String(r.target_hour).padStart(2, '0')}:${String(r.target_minute).padStart(2, '0')} UTC`,
          }]))

          // Group predictions by date
          const byDate = new Map<string, number[]>()
          for (const p of historyData) {
            const existing = byDate.get(p.game_date) || []
            existing.push(Number(p.predicted_price))
            byDate.set(p.game_date, existing)
          }

          const historyEntries: HistoryEntry[] = []
          let totalAccuracy = 0
          let bestAccuracy = 0

          for (const [date, preds] of byDate) {
            if (date === today) continue // Skip today — shown in the main game UI

            const result = resultsMap.get(date)
            const actual = result?.actual ?? null

            if (actual !== null) {
              // Resolved game — compute accuracy
              const bestPred = preds.reduce((best, p) =>
                Math.abs(p - actual) < Math.abs(best - actual) ? p : best
              , preds[0])
              const acc = Math.max(0, 1 - Math.abs(bestPred - actual) / actual)

              historyEntries.push({ date, predictions: preds, actual, accuracy: acc, targetTime: result?.targetTime ?? null })
              totalAccuracy += acc
              bestAccuracy = Math.max(bestAccuracy, acc)
            } else {
              const targetInfo = result?.targetTime ?? null
              historyEntries.push({ date, predictions: preds, actual: null, accuracy: null, targetTime: targetInfo })
            }
          }

          historyEntries.sort((a, b) => b.date.localeCompare(a.date))
          setHistory(historyEntries.slice(0, 10))

          const resolvedEntries = historyEntries.filter(e => e.accuracy !== null)
          if (resolvedEntries.length > 0) {
            setStats({
              streak: profile?.current_streak || 0,
              played: resolvedEntries.length,
              bestAccuracy,
              totalAccuracy,
            })
          }
        }

        setSynced(true)
        setSyncedDate(today)
      } catch (err) {
        console.error('Failed to sync from Supabase:', err)
        setSynced(true) // Use cached data
        setSyncedDate(today)
      }
    }

    syncFromServer()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, today, synced, syncedDate, dayData.date])

  // Guess tiers:
  // - Guess 1: always free (anonymous, localStorage only)
  // - Guess 2: requires email signup (authenticated)
  // - Guess 3: requires share (bonusUnlocked)
  const maxGuesses = useMemo(() => {
    if (dayData.bonusUnlocked && user) return 3
    if (user) return 2
    return 1
  }, [user, dayData.bonusUnlocked])

  const canGuess = dayData.predictions.length < maxGuesses
  const needsEmail = !user && dayData.predictions.length >= 1
  const needsShare = !!user && !dayData.bonusUnlocked && dayData.predictions.length >= 2

  const phase: GamePhase = useMemo(() => {
    if (dayData.result) return 'revealed'
    if (dayData.predictions.length >= maxGuesses) return 'locked'
    return 'predicting'
  }, [dayData.result, dayData.predictions.length, maxGuesses])

  const submitPrediction = useCallback((price: number) => {
    const guessNumber = dayData.predictions.length + 1

    // Optimistic update to localStorage
    setDayData(prev => ({
      ...prev,
      date: today,
      predictions: [...prev.predictions, price],
    }))

    // Persist to Supabase (only if authenticated)
    if (user) {
      supabase.from('predictions').insert({
        user_id: user.id,
        game_date: today,
        predicted_price: price,
        guess_number: guessNumber,
      }).then(({ error }) => {
        if (error) console.error('Failed to save prediction:', error.message)
      })
    }
    // If not authenticated, prediction lives in localStorage only
    // It will be synced when they sign up (see syncToServer above)
  }, [today, user, dayData.predictions.length, setDayData])

  const unlockBonus = useCallback((platform: string) => {
    setDayData(prev => ({ ...prev, bonusUnlocked: true }))

    // Persist to Supabase
    if (user) {
      supabase.from('bonus_unlocks').insert({
        user_id: user.id,
        game_date: today,
        platform,
      }).then(({ error }) => {
        if (error) console.error('Failed to save bonus unlock:', error.message)
      })
    }
  }, [user, today, setDayData])

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
        { date: today, predictions: prev.predictions, actual: actualPrice, accuracy: result.accuracy, targetTime: null },
        ...h.filter(e => e.date !== today).slice(0, 9),
      ])

      return { ...prev, result, actualPrice }
    })
  }, [btcPrice, today, setDayData, setStats, setHistory])

  const revealResult = useCallback(() => doReveal(), [doReveal])

  // Auto-reveal: check daily_results from Supabase when target time has passed
  // Only reveal if user has no more guesses available
  useEffect(() => {
    if (dayData.result || dayData.predictions.length === 0 || canGuess) return

    const now = new Date()
    if (now < targetTime.targetDate) return

    // Target time has passed and all guesses used — check Supabase for recorded price
    async function checkResult() {
      const { data } = await supabase
        .from('daily_results')
        .select('actual_price')
        .eq('game_date', today)
        .maybeSingle()

      if (data?.actual_price) {
        doReveal(Number(data.actual_price))
      } else {
        // Server hasn't recorded yet — fall back to client BTC price
        if (btcPrice > 0) {
          doReveal(btcPrice)
        }
      }
    }

    checkResult()
  }, [phase, dayData.result, dayData.predictions.length, canGuess, targetTime.targetDate, today, btcPrice, doReveal])

  const forceReveal = useCallback(() => {
    doReveal(btcPrice)
  }, [doReveal, btcPrice])

  return (
    <GameContext.Provider value={{
      phase,
      dayData,
      stats,
      history,
      maxGuesses,
      canGuess,
      needsEmail,
      needsShare,
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
