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

  function formatDate(dateStr: string): string {
    const [y, m, d] = dateStr.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
  }

  return (
    <Card delay={0.4}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
        Your Predictions
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.map((entry, i) => {
          const isPending = entry.actual === null

          return (
            <div key={i} style={{
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              border: isPending ? '1px solid rgba(247, 147, 26, 0.2)' : '1px solid transparent',
            }}>
              {/* Top row: date + status */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '6px',
              }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '12px', fontWeight: 600 }}>
                  {formatDate(entry.date)}
                </div>
                {isPending ? (
                  <div style={{
                    fontSize: '10px',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    color: 'var(--accent)',
                    background: 'rgba(247, 147, 26, 0.1)',
                    padding: '2px 8px',
                    borderRadius: '999px',
                  }}>
                    ⏳ Pending
                  </div>
                ) : (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '13px',
                    fontWeight: 700,
                    color: getAccuracyColor(entry.accuracy!),
                  }}>
                    {(entry.accuracy! * 100).toFixed(1)}%
                  </div>
                )}
              </div>

              {/* Predictions */}
              <div style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                marginBottom: isPending ? '6px' : 0,
              }}>
                {entry.predictions.map((p, j) => (
                  <div key={j} style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-primary)',
                    background: 'var(--bg-card)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border)',
                  }}>
                    {formatPriceWithDollar(p)}
                  </div>
                ))}
                {!isPending && entry.actual !== null && (
                  <div style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '12px',
                    color: 'var(--text-muted)',
                    padding: '3px 0',
                  }}>
                    → {formatPriceWithDollar(entry.actual)}
                  </div>
                )}
              </div>

              {/* Target time for pending */}
              {isPending && entry.targetTime && (
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  lineHeight: '1.4',
                }}>
                  Result at <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{entry.targetTime}</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
