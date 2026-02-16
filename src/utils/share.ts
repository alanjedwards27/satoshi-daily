import { getAccuracyBlocks } from './accuracy'

const BASE_URL = 'satoshidaily.app'

export interface ShareData {
  date: string
  targetTime: string
  accuracy: number
  difference: number
  streak: number
  guessCount: number
}

function buildResultText(opts: ShareData): string {
  const blocks = getAccuracyBlocks(opts.accuracy)
  const pct = (opts.accuracy * 100).toFixed(1)
  return [
    `@SatoshiDailyApp — ${opts.date}`,
    `🎯 Target: ${opts.targetTime}`,
    '',
    `${blocks} ${pct}% accuracy · $${Math.round(opts.difference).toLocaleString()} off`,
    `🔥 ${opts.streak} day streak · ${opts.guessCount} guess${opts.guessCount > 1 ? 'es' : ''}`,
    '',
    BASE_URL,
  ].join('\n')
}

function buildPreGuessText(targetTime: string): string {
  return `I just made my daily Bitcoin prediction on @SatoshiDailyApp 🎯\n\nTarget time: ${targetTime} today\n\nCan you beat me?\n${BASE_URL}`
}

// --- Share to X ---
export function shareToX(text: string): void {
  const encoded = encodeURIComponent(text)
  window.open(`https://x.com/intent/tweet?text=${encoded}`, '_blank', 'width=550,height=420')
}

// --- Share to Facebook ---
export function shareToFacebook(): void {
  const url = encodeURIComponent(`https://${BASE_URL}`)
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank', 'width=550,height=420')
}

// --- Share via Email ---
export function shareViaEmail(subject: string, body: string): void {
  const mailTo = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  window.location.href = mailTo
}

// --- Copy to clipboard ---
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// --- Pre-guess share (for bonus) ---
export function sharePreGuess(targetTime: string): void {
  shareToX(buildPreGuessText(targetTime))
}

// --- Result share helpers ---
export function getResultShareText(opts: ShareData): string {
  return buildResultText(opts)
}

export function shareResultToX(opts: ShareData): void {
  shareToX(buildResultText(opts))
}

export function shareResultToFacebook(): void {
  shareToFacebook()
}

export function shareResultViaEmail(opts: ShareData): void {
  const pct = (opts.accuracy * 100).toFixed(1)
  const subject = `My Satoshi Daily result — ${pct}% accuracy!`
  const body = buildResultText(opts)
  shareViaEmail(subject, body)
}
