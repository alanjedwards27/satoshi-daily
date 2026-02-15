import { useMemo } from 'react'
import Card from '../shared/Card'
import { useGame } from '../../context/GameContext'
import { useAuth } from '../../context/AuthContext'
import { generateMockLeaderboard } from '../../utils/mockLeaderboard'
import { maskEmail } from '../../utils/format'

export default function Leaderboard() {
  const { dayData, btcPrice } = useGame()
  const { user } = useAuth()

  const entries = useMemo(() => {
    const actualPrice = dayData.actualPrice || btcPrice
    const mock = generateMockLeaderboard(actualPrice)

    // Insert user if they have a prediction
    if (user && dayData.predictions.length > 0) {
      const bestPrediction = dayData.predictions.reduce((best, p) =>
        Math.abs(p - actualPrice) < Math.abs(best - actualPrice) ? p : best
      , dayData.predictions[0])

      const accuracy = Math.max(0, 1 - Math.abs(bestPrediction - actualPrice) / actualPrice)

      mock.push({
        rank: 0,
        email: maskEmail(user.email),
        accuracy,
        prediction: bestPrediction,
        isUser: true,
      })
    }

    return mock
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10)
      .map((entry, i) => ({ ...entry, rank: i + 1 }))
  }, [dayData, btcPrice, user])

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
              {entry.rank === 1 && (
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
