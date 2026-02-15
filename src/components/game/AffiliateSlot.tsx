import Card from '../shared/Card'

export default function AffiliateSlot() {
  return (
    <Card delay={0.5}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
      }}>
        <div style={{
          flexShrink: 0,
          width: '40px',
          height: '40px',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '20px',
        }}>
          🔐
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>
            Protect your Bitcoin
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
            Store it offline with Ledger — the world's most trusted hardware wallet.
          </div>
        </div>
        <a
          href="#"
          style={{
            flexShrink: 0,
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--accent)',
            whiteSpace: 'nowrap',
          }}
        >
          Shop Ledger →
        </a>
      </div>
    </Card>
  )
}
