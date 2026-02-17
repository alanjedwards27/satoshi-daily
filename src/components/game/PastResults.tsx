import { useState, useEffect } from 'react'
import Card from '../shared/Card'
import { supabase } from '../../lib/supabase'
import { formatPriceWithDollar, formatPrice } from '../../utils/format'

interface PastDay {
  gameDate: string
  actualPrice: number
  totalPlayers: number
  closestGuess: number
  closestDiff: number
  winnerCount: number
}

export default function PastResults() {
  const [days, setDays] = useState<PastDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchPastResults() {
      try {
        // Fetch last 5 resolved daily results (where actual_price exists)
        const { data: results } = await supabase
          .from('daily_results')
          .select('game_date, actual_price')
          .not('actual_price', 'is', null)
          .order('game_date', { ascending: false })
          .limit(5)

        if (!results || results.length === 0) {
          setLoading(false)
          return
        }

        const gameDates = results.map(r => r.game_date)

        // Fetch all predictions for those dates
        const { data: predictions } = await supabase
          .from('predictions')
          .select('game_date, user_id, predicted_price')
          .in('game_date', gameDates)

        // Fetch winner counts
        const { data: winners } = await supabase
          .from('winners')
          .select('game_date')
          .in('game_date', gameDates)

        // Count winners per date
        const winnerCounts = new Map<string, number>()
        if (winners) {
          for (const w of winners) {
            winnerCounts.set(w.game_date, (winnerCounts.get(w.game_date) || 0) + 1)
          }
        }

        // Process each day
        const pastDays: PastDay[] = results.map(result => {
          const actual = Number(result.actual_price)
          const dayPredictions = predictions?.filter(p => p.game_date === result.game_date) || []

          // Find closest guess per user (best prediction)
          const userBest = new Map<string, { price: number; diff: number }>()
          for (const p of dayPredictions) {
            const price = Number(p.predicted_price)
            const diff = Math.abs(price - actual)
            const existing = userBest.get(p.user_id)
            if (!existing || diff < existing.diff) {
              userBest.set(p.user_id, { price, diff })
            }
          }

          // Find the overall closest
          let closestGuess = 0
          let closestDiff = Infinity
          for (const [, data] of userBest) {
            if (data.diff < closestDiff) {
              closestDiff = data.diff
              closestGuess = data.price
            }
          }

          return {
            gameDate: result.game_date,
            actualPrice: actual,
            totalPlayers: userBest.size,
            closestGuess,
            closestDiff: closestDiff === Infinity ? 0 : closestDiff,
            winnerCount: winnerCounts.get(result.game_date) || 0,
          }
        })

        setDays(pastDays)
      } catch (err) {
        console.error('Failed to fetch past results:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPastResults()
  }, [])

  if (loading) {
    return (
      <Card delay={0.45}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>
          Past Results
        </div>
        <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Loading...
        </div>
      </Card>
    )
  }

  if (days.length === 0) return null

  function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  return (
    <Card delay={0.45}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>
        Past Results
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {days.map((day) => (
          <div key={day.gameDate} style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
          }}>
            {/* Date + winner badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '8px',
            }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {formatDate(day.gameDate)}
              </div>
              {day.winnerCount > 0 ? (
                <div style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  color: 'var(--accent)',
                  background: 'rgba(247, 147, 26, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                }}>
                  🏆 {day.winnerCount} Winner{day.winnerCount > 1 ? 's' : ''}
                </div>
              ) : (
                <div style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}>
                  No winner
                </div>
              )}
            </div>

            {/* Stats grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '6px',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  BTC Price
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                }}>
                  {formatPriceWithDollar(day.actualPrice)}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Closest
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: day.closestDiff === 0 ? 'var(--accent)' : 'var(--text-primary)',
                }}>
                  {day.totalPlayers > 0 ? formatPriceWithDollar(day.closestGuess) : '—'}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  Off By
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: day.closestDiff === 0 ? 'var(--green, #05b169)' : day.closestDiff <= 100 ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                  {day.totalPlayers > 0 ? `$${formatPrice(day.closestDiff)}` : '—'}
                </div>
              </div>
            </div>

            {/* Player count */}
            <div style={{
              fontSize: '10px',
              color: 'var(--text-muted)',
              textAlign: 'center',
              marginTop: '6px',
            }}>
              {day.totalPlayers} player{day.totalPlayers !== 1 ? 's' : ''} predicted
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
