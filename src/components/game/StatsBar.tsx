import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'

export default function StatsBar() {
  const { stats } = useGame()

  const items = [
    { label: 'Streak', value: stats.streak, suffix: '' },
    { label: 'Played', value: stats.played, suffix: '' },
    { label: 'Best', value: stats.bestAccuracy > 0 ? `${(stats.bestAccuracy * 100).toFixed(1)}%` : '—', suffix: '' },
    { label: 'Average', value: stats.played > 0 ? `${((stats.totalAccuracy / stats.played) * 100).toFixed(1)}%` : '—', suffix: '' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
      }}
    >
      {items.map((item) => (
        <div key={item.label} style={{
          textAlign: 'center',
          padding: '10px 4px',
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '18px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {typeof item.value === 'number' ? item.value : item.value}
          </div>
          <div style={{
            fontSize: '10px',
            color: 'var(--text-muted)',
            marginTop: '2px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            {item.label}
          </div>
        </div>
      ))}
    </motion.div>
  )
}
