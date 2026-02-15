import { useAuth } from '../../context/AuthContext'
import { maskEmail } from '../../utils/format'

export default function UserBar() {
  const { user, logout } = useAuth()
  if (!user) return null

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 14px',
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      fontSize: '13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>{maskEmail(user.email)}</span>
        <span style={{
          fontSize: '10px',
          padding: '2px 6px',
          background: 'var(--green-light)',
          color: 'var(--green)',
          borderRadius: '4px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}>
          Verified
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {import.meta.env.DEV && (
          <button
            onClick={() => {
              try {
                window.localStorage.removeItem('sd_day')
                window.localStorage.removeItem('sd_stats')
                window.localStorage.removeItem('sd_history')
              } catch { /* ignore */ }
              window.location.reload()
            }}
            style={{
              fontSize: '11px',
              color: 'var(--red)',
              cursor: 'pointer',
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: '4px',
              padding: '3px 6px',
            }}
          >
            Reset
          </button>
        )}
        <button
          onClick={logout}
          style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            background: 'none',
            border: 'none',
            padding: '4px 8px',
          }}
        >
          Log out
        </button>
      </div>
    </div>
  )
}
