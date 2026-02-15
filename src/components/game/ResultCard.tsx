import { useState } from 'react'
import Card from '../shared/Card'
import Button from '../shared/Button'
import AccuracyMeter from './AccuracyMeter'
import ShareModal from './ShareModal'
import { useGame } from '../../context/GameContext'
import { TIER_INFO } from '../../utils/accuracy'
import { formatPriceWithDollar, formatPrice } from '../../utils/format'
import { formatDateShort } from '../../utils/targetTime'

export default function ResultCard() {
  const { dayData, stats, targetTime } = useGame()
  const [shareOpen, setShareOpen] = useState(false)

  if (!dayData.result || !dayData.actualPrice) return null

  const { accuracy, difference, tier, prize } = dayData.result
  const tierInfo = TIER_INFO[tier]
  const pct = (accuracy * 100).toFixed(1)

  const bestPrediction = dayData.predictions.reduce((best, p) =>
    Math.abs(p - dayData.actualPrice!) < Math.abs(best - dayData.actualPrice!) ? p : best
  , dayData.predictions[0])

  const shareData = {
    date: formatDateShort(new Date()),
    targetTime: targetTime.formatted,
    accuracy,
    difference,
    streak: stats.streak,
    guessCount: dayData.predictions.length,
  }

  return (
    <>
      <Card delay={0.1}>
        <div style={{ textAlign: 'center' }}>
          {/* Tier header */}
          <div style={{ fontSize: '48px', marginBottom: '4px' }}>{tierInfo.emoji}</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '18px',
            fontWeight: 700,
            color: tierInfo.color,
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            {tierInfo.title}
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '32px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '16px',
          }}>
            {pct}%
          </div>

          {/* Accuracy meter */}
          <div style={{ marginBottom: '20px' }}>
            <AccuracyMeter accuracy={accuracy} />
          </div>

          {/* Prize result */}
          {prize ? (
            <div style={{
              padding: '12px 16px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent-border)',
              marginBottom: '20px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                ⚡ You're a winner! — {prize.label}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: '1.4' }}>
                You're in the £5 daily prize pool. Your share is paid to your Lightning wallet within 24h.
              </div>
            </div>
          ) : (
            <div style={{
              padding: '10px 16px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '20px',
              fontSize: '13px',
              color: 'var(--text-muted)',
            }}>
              Not within $500 today — try again tomorrow!
            </div>
          )}

          {/* Detail boxes */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            marginBottom: '20px',
          }}>
            {[
              { label: 'Your Call', value: formatPriceWithDollar(bestPrediction) },
              { label: 'Actual Price', value: formatPriceWithDollar(dayData.actualPrice) },
              { label: 'Difference', value: `$${formatPrice(Math.round(difference))}` },
              { label: 'Accuracy', value: `${pct}%` },
            ].map((item) => (
              <div key={item.label} style={{
                padding: '10px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <Button fullWidth onClick={() => setShareOpen(true)}>
            Share My Result
          </Button>
        </div>
      </Card>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareData={shareData}
        prediction={bestPrediction}
        actual={dayData.actualPrice}
        tier={tier}
        isWinner={!!prize}
      />
    </>
  )
}
