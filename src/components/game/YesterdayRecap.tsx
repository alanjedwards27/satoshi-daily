import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Card from '../shared/Card'
import ShareModal from './ShareModal'
import AccuracyMeter from './AccuracyMeter'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import { useGame } from '../../context/GameContext'
import { calculateAccuracy, TIER_INFO, getAccuracyBlocks } from '../../utils/accuracy'
import { formatPriceWithDollar, formatPrice } from '../../utils/format'
import { shareToX, copyToClipboard, type ShareData } from '../../utils/share'

interface RecapData {
  gameDate: string
  actualPrice: number
  userPredictions: number[]
  bestPrediction: number
  accuracy: number
  difference: number
  tier: ReturnType<typeof calculateAccuracy>['tier']
  prize: ReturnType<typeof calculateAccuracy>['prize']
  rank: number
  totalPlayers: number
  isWinner: boolean
  targetTime: string
}

function getYesterdayStr(): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().split('T')[0]
}

function formatRecapDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
}

function getOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}

export default function YesterdayRecap() {
  const { user } = useAuth()
  const { stats } = useGame()
  const [recap, setRecap] = useState<RecapData | null>(null)
  const [loading, setLoading] = useState(true)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    async function fetchRecap() {
      try {
        const yesterday = getYesterdayStr()

        // Fetch yesterday's result
        const { data: dailyResult } = await supabase
          .from('daily_results')
          .select('game_date, actual_price, target_hour, target_minute')
          .eq('game_date', yesterday)
          .maybeSingle()

        if (!dailyResult?.actual_price) { setLoading(false); return }

        const actualPrice = Number(dailyResult.actual_price)
        const targetTime = `${String(dailyResult.target_hour).padStart(2, '0')}:${String(dailyResult.target_minute).padStart(2, '0')} UTC`

        // Fetch user's predictions for yesterday
        const { data: userPreds } = await supabase
          .from('predictions')
          .select('predicted_price, guess_number')
          .eq('user_id', user!.id)
          .eq('game_date', yesterday)
          .order('guess_number', { ascending: true })

        if (!userPreds || userPreds.length === 0) { setLoading(false); return }

        const userPredictions = userPreds.map(p => Number(p.predicted_price))

        // Find user's best prediction
        const bestPrediction = userPredictions.reduce((best, p) =>
          Math.abs(p - actualPrice) < Math.abs(best - actualPrice) ? p : best
        , userPredictions[0])

        const result = calculateAccuracy(bestPrediction, actualPrice)

        // Fetch ALL predictions for yesterday to compute ranking
        const { data: allPreds } = await supabase
          .from('predictions')
          .select('user_id, predicted_price')
          .eq('game_date', yesterday)

        // Group by user, find each user's best prediction
        const userBests = new Map<string, number>()
        if (allPreds) {
          for (const p of allPreds) {
            const price = Number(p.predicted_price)
            const diff = Math.abs(price - actualPrice)
            const existing = userBests.get(p.user_id)
            if (existing === undefined || diff < Math.abs(existing - actualPrice)) {
              userBests.set(p.user_id, price)
            }
          }
        }

        // Sort by accuracy (closest first) and find user's rank
        const ranked = Array.from(userBests.entries())
          .map(([uid, pred]) => ({ uid, diff: Math.abs(pred - actualPrice) }))
          .sort((a, b) => a.diff - b.diff)

        const rank = ranked.findIndex(r => r.uid === user!.id) + 1
        const totalPlayers = ranked.length

        // Check if winner
        const { data: winner } = await supabase
          .from('winners')
          .select('id')
          .eq('user_id', user!.id)
          .eq('game_date', yesterday)
          .maybeSingle()

        setRecap({
          gameDate: yesterday,
          actualPrice,
          userPredictions,
          bestPrediction,
          accuracy: result.accuracy,
          difference: result.difference,
          tier: result.tier,
          prize: result.prize,
          rank,
          totalPlayers,
          isWinner: !!winner,
          targetTime,
        })
      } catch (err) {
        console.error('Failed to fetch yesterday recap:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecap()
  }, [user])

  const handleCopyCard = useCallback(async () => {
    if (!recap) return
    const blocks = getAccuracyBlocks(recap.accuracy)
    const pct = (recap.accuracy * 100).toFixed(1)
    const text = [
      `@SatoshiDailyApp — ${formatRecapDate(recap.gameDate)}`,
      `🎯 Target: ${recap.targetTime}`,
      '',
      `${blocks} ${pct}%`,
      `${getOrdinal(recap.rank)} out of ${recap.totalPlayers} players`,
      `$${Math.round(recap.difference).toLocaleString()} off`,
      recap.isWinner ? '⚡ Winner!' : '',
      '',
      'satoshidaily.app',
    ].filter(Boolean).join('\n')

    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [recap])

  const handleShareX = useCallback(() => {
    if (!recap) return
    const blocks = getAccuracyBlocks(recap.accuracy)
    const pct = (recap.accuracy * 100).toFixed(1)
    const text = [
      `@SatoshiDailyApp — ${formatRecapDate(recap.gameDate)}`,
      '',
      `${blocks} ${pct}%`,
      `${getOrdinal(recap.rank)} out of ${recap.totalPlayers} players`,
      recap.isWinner ? '⚡ Winner!' : '',
      '',
      'satoshidaily.app',
    ].filter(Boolean).join('\n')
    shareToX(text)
  }, [recap])

  if (loading || !recap) return null

  const tierInfo = TIER_INFO[recap.tier]

  const shareData: ShareData = {
    date: formatRecapDate(recap.gameDate),
    targetTime: recap.targetTime,
    accuracy: recap.accuracy,
    difference: recap.difference,
    streak: stats.streak,
    guessCount: recap.userPredictions.length,
  }

  return (
    <>
      <Card delay={0.1} variant="accent">
        <div style={{ textAlign: 'center' }}>
          {/* Header */}
          <div style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '4px',
          }}>
            Yesterday's Result
          </div>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
          }}>
            {formatRecapDate(recap.gameDate)} · {recap.targetTime}
          </div>

          {/* Tier + accuracy */}
          <div style={{ fontSize: '36px', marginBottom: '2px' }}>{tierInfo.emoji}</div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
            fontWeight: 700,
            color: tierInfo.color,
            letterSpacing: '2px',
            marginBottom: '4px',
          }}>
            {tierInfo.title}
          </div>

          {/* Accuracy meter */}
          <div style={{ marginBottom: '12px' }}>
            <AccuracyMeter accuracy={recap.accuracy} />
          </div>

          {/* Ranking — the hero stat */}
          <div style={{
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '12px',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '22px',
              fontWeight: 700,
              color: recap.rank <= 3 ? 'var(--accent)' : 'var(--text-primary)',
            }}>
              {recap.rank <= 3 ? ['🥇', '🥈', '🥉'][recap.rank - 1] + ' ' : ''}
              {getOrdinal(recap.rank)} closest
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '2px',
            }}>
              out of {recap.totalPlayers} player{recap.totalPlayers !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Winner badge */}
          {recap.isWinner && (
            <div style={{
              padding: '10px 16px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent-border)',
              marginBottom: '12px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '14px',
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                ⚡ You won a share of the $5 pot!
              </div>
            </div>
          )}

          {/* Stats grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            marginBottom: '16px',
          }}>
            {[
              { label: 'Your Best', value: formatPriceWithDollar(recap.bestPrediction) },
              { label: 'BTC Price', value: formatPriceWithDollar(recap.actualPrice) },
              { label: 'Off By', value: `$${formatPrice(Math.round(recap.difference))}` },
            ].map((item) => (
              <div key={item.label} style={{
                padding: '8px 6px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '9px',
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '3px',
                }}>
                  {item.label}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          {/* Share buttons — Wordle style */}
          <div style={{
            display: 'flex',
            gap: '8px',
          }}>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShareX}
              style={{
                flex: 1,
                padding: '12px 16px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              Share on 𝕏
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleCopyCard}
              style={{
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                color: copied ? 'var(--green)' : 'var(--text-primary)',
                fontSize: '14px',
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                cursor: 'pointer',
                minWidth: '80px',
              }}
            >
              {copied ? '✓ Copied' : '📋 Copy'}
            </motion.button>
          </div>
        </div>
      </Card>

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        shareData={shareData}
        prediction={recap.bestPrediction}
        actual={recap.actualPrice}
        tier={recap.tier}
        isWinner={recap.isWinner}
      />
    </>
  )
}
