import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { formatPriceWithDollar } from '../../utils/format'
import { formatDateShort } from '../../utils/targetTime'

export default function TargetCard() {
  const { btcPrice, btcChange24h, btcLoading, targetTime } = useGame()

  const isPositive = btcChange24h >= 0
  const changeColor = isPositive ? 'var(--green)' : 'var(--red)'
  const changeSign = isPositive ? '+' : ''

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}
    >
      {/* Target time — big hero block */}
      <div style={{
        background: 'var(--accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle pattern overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          opacity: 0.85,
          marginBottom: '8px',
        }}>
          Tomorrow's Target Time
        </div>

        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '48px',
          fontWeight: 700,
          letterSpacing: '2px',
          lineHeight: 1,
          marginBottom: '8px',
        }}>
          {targetTime.formatted}
        </div>

        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          opacity: 0.85,
        }}>
          {formatDateShort(targetTime.targetDate)}
        </div>

        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255,255,255,0.2)',
          fontSize: '12px',
          opacity: 0.75,
        }}>
          What will BTC be worth at this exact moment?
        </div>
      </div>

      {/* Current BTC price — secondary info */}
      <div style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        padding: '14px 16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
            BTC/USD Now
          </div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '20px',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            {btcLoading ? '...' : formatPriceWithDollar(btcPrice)}
          </div>
        </div>
        <div style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '13px',
          fontWeight: 600,
          color: changeColor,
          padding: '4px 10px',
          background: isPositive ? 'var(--green-light)' : 'var(--red-light)',
          borderRadius: 'var(--radius-sm)',
        }}>
          {changeSign}{btcChange24h.toFixed(2)}%
        </div>
      </div>

      {/* Lock time notice */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)',
      }}>
        Predictions lock at <strong style={{ color: 'var(--text-primary)' }}>midnight GMT</strong>
      </div>
    </motion.div>
  )
}
