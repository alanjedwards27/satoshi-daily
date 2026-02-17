import Card from '../shared/Card'

export default function PrizeTiers() {
  return (
    <Card delay={0.15}>
      <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 600 }}>
        Daily Prize
      </div>

      {/* Prize pool hero */}
      <div style={{
        textAlign: 'center',
        padding: '16px 12px',
        background: 'var(--accent-light)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--accent-border)',
        marginBottom: '12px',
      }}>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '28px',
          fontWeight: 700,
          color: 'var(--accent)',
        }}>
          $5 in BTC
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Daily prize pool — split between all winners
        </div>
      </div>

      {/* How to win */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px', fontSize: '13px' }}>
          How to win
        </div>
        Predict the <strong style={{ color: 'var(--accent)' }}>exact BTC price</strong> (to the nearest dollar) at the target time. Get it right and you split the $5 daily prize pool. No close enough — you either nail it or you don't.
      </div>

      {/* The challenge */}
      <div style={{
        padding: '12px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '12px',
        color: 'var(--text-secondary)',
        lineHeight: '1.5',
        marginBottom: '12px',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: '20px', display: 'block', marginBottom: '6px' }}>🎯</span>
        <strong style={{ color: 'var(--text-primary)' }}>Can you predict the exact price?</strong>
        <br />
        Most days, nobody wins. When someone does, it's legendary.
      </div>

      {/* Lightning footer */}
      <div style={{
        padding: '10px 12px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span style={{ fontSize: '16px' }}>⚡</span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
          Paid via <strong style={{ color: 'var(--text-primary)' }}>Lightning Network</strong>. $5 daily pot split equally between all winners. No rollover — unclaimed prizes are not carried forward.
        </span>
      </div>
    </Card>
  )
}
