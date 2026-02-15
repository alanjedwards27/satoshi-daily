import { useCountdown } from '../../hooks/useCountdown'

interface CountdownProps {
  targetDate: Date
  label?: string
}

export default function Countdown({ targetDate, label }: CountdownProps) {
  const { hours, minutes, seconds, isExpired } = useCountdown(targetDate)

  if (isExpired) {
    return (
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
        Revealed!
      </span>
    )
  }

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div style={{ textAlign: 'center' }}>
      {label && (
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          {label}
        </div>
      )}
      <span style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '24px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        letterSpacing: '2px',
      }}>
        {pad(hours)}:{pad(minutes)}:{pad(seconds)}
      </span>
    </div>
  )
}
