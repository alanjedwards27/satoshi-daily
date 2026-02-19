import { useState, useEffect } from 'react'
import Card from '../shared/Card'
import { useGame } from '../../context/GameContext'
import { useAuth } from '../../context/AuthContext'
import { maskEmail } from '../../utils/format'
import { supabase } from '../../lib/supabase'

interface LeaderboardEntry {
  rank: number
  email: string
  accuracy: number
  prediction: number
  isUser: boolean
}

export default function Leaderboard() {
  const { dayData, btcPrice } = useGame()
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  const actualPrice = dayData.actualPrice || btcPrice
  const gameDate = dayData.date || new Date().toISOString().split('T')[0]

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        // Fetch all predictions for today with the user's email from profiles
        const { data: predictions } = await supabase
          .from('predictions')
          .select('user_id, predicted_price, profiles!inner(email)')
          .eq('game_date', gameDate)

        if (!predictions || predictions.length === 0) {
          setLoading(false)
          return
        }

        // Group by user, take best prediction per user
        const userBest = new Map<string, { email: string; prediction: number; accuracy: number }>()

        for (const p of predictions) {
          const predictedPrice = Number(p.predicted_price)
          const accuracy = actualPrice > 0
            ? Math.max(0, 1 - Math.abs(predictedPrice - actualPrice) / actualPrice)
            : 0

          const existing = userBest.get(p.user_id)
          const profileData = p.profiles as unknown as { email: string }

          if (!existing || accuracy > existing.accuracy) {
            userBest.set(p.user_id, {
              email: profileData.email,
              prediction: predictedPrice,
              accuracy,
            })
          }
        }

        // Sort by accuracy descending, take top 10
        const sorted = Array.from(userBest.entries())
          .map(([userId, data]) => ({
            rank: 0,
            email: maskEmail(data.email),
            prediction: data.prediction,
            accuracy: data.accuracy,
            isUser: userId === user?.id,
          }))
          .sort((a, b) => b.accuracy - a.accuracy)
          .slice(0, 10)
          .map((entry, i) => ({ ...entry, rank: i + 1 }))

        setEntries(sorted)
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
  }, [gameDate, actualPrice, user?.id])

  if (loading) {
    return (
      <Card delay={0.3}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Today's Leaderboard
        </div>
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
          Loading leaderboard...
        </div>
      </Card>
    )
  }

  if (entries.length === 0) {
    return (
      <Card delay={0.3}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Today's Leaderboard
        </div>
        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '13px' }}>
          No predictions yet today. Be the first!
        </div>
      </Card>
    )
  }

  return (
    <Card delay={0.3}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        Today's Leaderboard
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {entries.map((entry) => (
          <div
            key={entry.rank}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: 'var(--radius-sm)',
              background: entry.isUser ? 'var(--accent-light)' : 'transparent',
              border: entry.isUser ? '1px solid var(--accent-border)' : '1px solid transparent',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 700,
                color: entry.rank === 1 ? 'var(--accent)' : 'var(--text-muted)',
                width: '20px',
              }}>
                #{entry.rank}
              </span>
              <span style={{
                fontSize: '13px',
                color: entry.isUser ? 'var(--accent)' : 'var(--text-secondary)',
                fontWeight: entry.isUser ? 600 : 400,
              }}>
                {entry.email} {entry.isUser && '(you)'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
              }}>
                {(entry.accuracy * 100).toFixed(1)}%
              </span>
              {entry.accuracy === 1 && (
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  background: 'var(--accent-light)',
                  color: 'var(--accent)',
                  borderRadius: '4px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono)',
                }}>
                  Winner
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
