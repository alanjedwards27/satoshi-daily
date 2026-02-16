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
        Predict within <strong style={{ color: 'var(--text-primary)' }}>$500</strong> of the actual BTC price at the target time and you're a winner. The closer you are, the better your ranking — but all qualifying predictions share the prize pool equally.
      </div>

      {/* Win tiers - now just showing what accuracy means */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
        {[
          { emoji: '🏆', label: 'Exact (within $1)', desc: 'Legendary accuracy' },
          { emoji: '🎯', label: 'Within $100', desc: 'Incredible call' },
          { emoji: '💰', label: 'Within $500', desc: 'You\'re a winner' },
        ].map((tier) => (
          <div key={tier.label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 10px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '12px',
          }}>
            <span>{tier.emoji}</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tier.label}</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto' }}>{tier.desc}</span>
          </div>
        ))}
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
