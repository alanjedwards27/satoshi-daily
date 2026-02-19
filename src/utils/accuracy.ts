export interface AccuracyResult {
  accuracy: number        // 0-1 percentage
  difference: number      // absolute dollar difference
  tier: AccuracyTier
  prize: PrizeTier | null
}

export type AccuracyTier = 'legendary' | 'bullseye' | 'onfire' | 'solid' | 'keepgoing'

export interface PrizeTier {
  label: string
  amount: string
}

/** Daily prize pool is $5, split between all exact-match winners. */
const WIN_THRESHOLD = 0 // Exact match only

export const DAILY_PRIZE_POOL = '$5'

export function calculateAccuracy(prediction: number, actual: number): AccuracyResult {
  const difference = Math.abs(prediction - actual)
  // Cap at 0.999 unless truly exact — prevents $5 off showing as "100%"
  const raw = Math.max(0, 1 - (difference / actual))
  const accuracy = difference === 0 ? 1 : Math.min(raw, 0.999)

  const tier = getAccuracyTier(accuracy)
  const prize = getPrizeTier(difference)

  return { accuracy, difference, tier, prize }
}

function getAccuracyTier(accuracy: number): AccuracyTier {
  if (accuracy >= 0.999) return 'legendary'   // exact or ~$96 off
  if (accuracy >= 0.995) return 'bullseye'    // within ~$480
  if (accuracy >= 0.99) return 'onfire'       // within ~$960
  if (accuracy >= 0.95) return 'solid'        // within ~$4,800
  return 'keepgoing'
}

function getPrizeTier(difference: number): PrizeTier | null {
  if (difference <= WIN_THRESHOLD) {
    return { label: 'EXACT!', amount: DAILY_PRIZE_POOL }
  }
  return null
}

export const TIER_INFO: Record<AccuracyTier, { emoji: string; title: string; color: string }> = {
  legendary: { emoji: '🏆', title: 'LEGENDARY', color: '#f7931a' },
  bullseye: { emoji: '🎯', title: 'BULLSEYE', color: '#05b169' },
  onfire: { emoji: '🔥', title: 'ON FIRE', color: '#f7931a' },
  solid: { emoji: '💪', title: 'SOLID', color: '#1652f0' },
  keepgoing: { emoji: '📈', title: 'KEEP GOING', color: '#5b616e' },
}

export function getAccuracyBlocks(accuracy: number): string {
  const filled = Math.round(accuracy * 10)
  return '🟧'.repeat(filled) + '⬛'.repeat(10 - filled)
}
