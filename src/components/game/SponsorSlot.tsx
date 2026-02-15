export default function SponsorSlot() {
  return (
    <div style={{
      textAlign: 'center',
      padding: '16px',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border)',
      marginTop: '4px',
    }}>
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
        Your brand here — reach thousands of daily Bitcoin enthusiasts.
      </div>
      <a href="#" style={{ fontSize: '12px', fontWeight: 600, color: 'var(--accent)' }}>
        Become a sponsor →
      </a>
    </div>
  )
}
