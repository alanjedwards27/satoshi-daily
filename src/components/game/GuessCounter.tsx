import { useGame } from '../../context/GameContext'
import { useAuth } from '../../context/AuthContext'

export default function GuessCounter() {
  const { dayData, maxGuesses } = useGame()
  const { user } = useAuth()
  const used = dayData.predictions.length

  // Show all 3 potential slots, but dim the locked ones
  const totalSlots = 3

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
    }}>
      {Array.from({ length: totalSlots }, (_, i) => {
        const isUsed = i < used
        const isUnlocked = i < maxGuesses
        const isLocked = !isUnlocked && !isUsed

        return (
          <div
            key={i}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: isUsed
                ? 'var(--accent)'
                : isLocked
                  ? 'var(--bg-secondary)'
                  : 'var(--border)',
              border: isLocked ? '1px dashed var(--border)' : '1px solid transparent',
              transition: 'all 0.3s',
              boxSizing: 'border-box',
            }}
            title={
              i === 0 ? 'Free guess'
                : i === 1 ? (user ? 'Email unlocked' : 'Sign up to unlock')
                  : (dayData.bonusUnlocked ? 'Share unlocked' : 'Share to unlock')
            }
          />
        )
      })}
      <span style={{
        fontSize: '12px',
        color: 'var(--text-muted)',
        marginLeft: '4px',
      }}>
        {used} of {maxGuesses} guess{maxGuesses > 1 ? 'es' : ''}
        {maxGuesses < 3 && (
          <span style={{ color: 'var(--text-muted)', opacity: 0.6 }}>
            {' '}({3 - maxGuesses} locked)
          </span>
        )}
      </span>
    </div>
  )
}
