import Card from '../shared/Card'
import { useGame } from '../../context/GameContext'
import { formatPriceWithDollar } from '../../utils/format'

export default function History() {
  const { history } = useGame()

  if (history.length === 0) return null

  function getAccuracyColor(accuracy: number): string {
    if (accuracy >= 0.97) return 'var(--green)'
    if (accuracy >= 0.93) return 'var(--accent)'
    return 'var(--red)'
  }

  return (
    <Card delay={0.4}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        Recent History
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {history.map((entry, i) => (
          <div key={i} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
          }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              {entry.date}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              color: 'var(--text-secondary)',
            }}>
              {formatPriceWithDollar(entry.prediction)} → {formatPriceWithDollar(entry.actual)}
            </div>
            <div style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 700,
              color: getAccuracyColor(entry.accuracy),
            }}>
              {(entry.accuracy * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
