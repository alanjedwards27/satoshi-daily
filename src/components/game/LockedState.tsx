import Card from '../shared/Card'
import Countdown from '../shared/Countdown'
import { useGame } from '../../context/GameContext'
import { formatPriceWithDollar } from '../../utils/format'

export default function LockedState() {
  const { dayData, targetTime, forceReveal } = useGame()

  return (
    <Card delay={0.1} variant="green">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '13px', color: 'var(--green)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
          Prediction Locked
        </div>

        {/* Prediction pills */}
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
          {dayData.predictions.map((p, i) => (
            <div key={i} style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '16px',
              fontWeight: 700,
              padding: '8px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              color: 'var(--text-primary)',
            }}>
              {formatPriceWithDollar(p)}
            </div>
          ))}
        </div>

        {/* Countdown */}
        <Countdown targetDate={targetTime.targetDate} label="Results reveal in" />

        {/* Debug: force reveal button */}
        <button
          onClick={forceReveal}
          style={{
            marginTop: '16px',
            fontSize: '11px',
            color: 'var(--text-muted)',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 12px',
            cursor: 'pointer',
          }}
        >
          Debug: Reveal Now
        </button>
      </div>
    </Card>
  )
}
