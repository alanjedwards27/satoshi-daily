import { TIER_INFO, type AccuracyTier } from './accuracy'

interface ShareCardData {
  date: string
  targetTime: string
  prediction: number
  actual: number
  accuracy: number
  difference: number
  tier: AccuracyTier
  streak: number
  isWinner: boolean
}

function formatNum(n: number): string {
  return '$' + n.toLocaleString('en-US')
}

/**
 * Preload the logo image once so share cards generate instantly.
 */
let logoImg: HTMLImageElement | null = null
const logoPromise = new Promise<HTMLImageElement>((resolve) => {
  const img = new Image()
  img.onload = () => { logoImg = img; resolve(img) }
  img.onerror = () => resolve(img) // fallback: draw without logo
  img.src = '/logo.png'
})

/**
 * Generates a share card as a canvas and returns it as a data URL (PNG).
 */
export async function generateShareCard(data: ShareCardData): Promise<string> {
  // Ensure logo is loaded
  await logoPromise

  const W = 600
  const H = 400
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#0a0b0d'
  ctx.fillRect(0, 0, W, H)

  // Accent bar at top
  const grad = ctx.createLinearGradient(0, 0, W, 0)
  grad.addColorStop(0, '#f7931a')
  grad.addColorStop(1, '#e5850f')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, W, 5)

  // Logo area
  if (logoImg && logoImg.complete && logoImg.naturalWidth > 0) {
    ctx.drawImage(logoImg, 20, 18, 36, 36)
  } else {
    // Fallback: draw ₿ circle
    ctx.fillStyle = '#f7931a'
    ctx.beginPath()
    ctx.arc(40, 36, 16, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 16px monospace'
    ctx.textAlign = 'center'
    ctx.fillText('₿', 40, 42)
  }

  // "Satoshi Daily" text
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 18px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText('Satoshi Daily', 64, 42)

  // Date + target time
  ctx.fillStyle = '#8a8f9c'
  ctx.font = '13px sans-serif'
  ctx.textAlign = 'right'
  ctx.fillText(`${data.date} · ${data.targetTime}`, W - 30, 42)

  // Divider
  ctx.strokeStyle = '#2a2d33'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(30, 65)
  ctx.lineTo(W - 30, 65)
  ctx.stroke()

  // Tier emoji + title
  const tierInfo = TIER_INFO[data.tier]
  ctx.textAlign = 'center'

  ctx.font = '40px serif'
  ctx.fillText(tierInfo.emoji, W / 2, 110)

  ctx.fillStyle = tierInfo.color
  ctx.font = 'bold 20px monospace'
  ctx.letterSpacing = '3px'
  ctx.fillText(tierInfo.title, W / 2, 140)

  // Accuracy percentage — big
  const pct = (data.accuracy * 100).toFixed(1)
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 56px monospace'
  ctx.fillText(`${pct}%`, W / 2, 200)

  // Accuracy label
  ctx.fillStyle = '#8a8f9c'
  ctx.font = '13px sans-serif'
  ctx.fillText('accuracy', W / 2, 220)

  // Accuracy bar
  const barY = 240
  const barW = 340
  const barH = 10
  const barX = (W - barW) / 2
  const segments = 10
  const filled = Math.round(data.accuracy * segments)

  for (let i = 0; i < segments; i++) {
    const segX = barX + i * (barW / segments + 2)
    const segW = barW / segments - 2
    ctx.fillStyle = i < filled ? '#f7931a' : '#2a2d33'
    ctx.beginPath()
    ctx.roundRect(segX, barY, segW, barH, 3)
    ctx.fill()
  }

  // Stats row
  const statsY = 280
  const stats = [
    { label: 'MY CALL', value: formatNum(data.prediction) },
    { label: 'ACTUAL', value: formatNum(data.actual) },
    { label: 'DIFF', value: formatNum(Math.round(data.difference)) },
    { label: 'STREAK', value: `${data.streak}🔥` },
  ]

  const colW = (W - 60) / stats.length
  stats.forEach((s, i) => {
    const cx = 30 + colW * i + colW / 2

    ctx.fillStyle = '#5b616e'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(s.label, cx, statsY)

    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 16px monospace'
    ctx.fillText(s.value, cx, statsY + 22)
  })

  // Winner badge
  if (data.isWinner) {
    const badgeY = 330
    const badgeText = '⚡ Winner — $5 prize pool'
    ctx.fillStyle = 'rgba(247, 147, 26, 0.15)'
    ctx.beginPath()
    ctx.roundRect(W / 2 - 120, badgeY, 240, 30, 8)
    ctx.fill()
    ctx.fillStyle = '#f7931a'
    ctx.font = 'bold 13px sans-serif'
    ctx.fillText(badgeText, W / 2, badgeY + 20)
  }

  // Footer
  ctx.fillStyle = '#5b616e'
  ctx.font = '12px sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('satoshidaily.app — Free daily Bitcoin prediction game', W / 2, H - 18)

  return canvas.toDataURL('image/png')
}

