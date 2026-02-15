import { useGame } from '../../context/GameContext'

export default function GuessCounter() {
  const { dayData } = useGame()
  const maxGuesses = dayData.bonusUnlocked ? 2 : 1
  const used = dayData.predictions.length

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      {Array.from({ length: maxGuesses }, (_, i) => (
        <div
          key={i}
          style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            background: i < used ? 'var(--accent)' : 'var(--border)',
            transition: 'background 0.3s',
          }}
        />
      ))}
      <span style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginLeft: '4px',
      }}>
        {used} of {maxGuesses} guess{maxGuesses > 1 ? 'es' : ''}
      </span>
    </div>
  )
}
