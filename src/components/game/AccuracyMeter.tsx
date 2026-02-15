interface AccuracyMeterProps {
  accuracy: number // 0-1
}

export default function AccuracyMeter({ accuracy }: AccuracyMeterProps) {
  const filled = Math.round(accuracy * 10)

  return (
    <div style={{
      display: 'flex',
      gap: '3px',
      justifyContent: 'center',
    }}>
      {Array.from({ length: 10 }, (_, i) => (
        <div
          key={i}
          style={{
            width: '100%',
            maxWidth: '32px',
            height: '8px',
            borderRadius: '2px',
            background: i < filled ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s',
            transitionDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  )
}
