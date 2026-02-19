import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { useCountdown } from '../../hooks/useCountdown'
import { formatPriceWithDollar } from '../../utils/format'
import { formatDateShort } from '../../utils/targetTime'

export default function TargetCard() {
  const { btcPrice, btcChange24h, btcLoading, targetTime } = useGame()
  const lockCountdown = useCountdown(targetTime.lockDate)
  const pad = (n: number) => String(n).padStart(2, '0')

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
      {/* Target time — dark hero block with orange accents */}
      <div style={{
        background: '#0d0d0d',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 20px',
        textAlign: 'center',
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(247, 147, 26, 0.15)',
      }}>
        {/* Subtle gradient overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at top, rgba(247, 147, 26, 0.06) 0%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          fontSize: '12px',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '2px',
          color: 'rgba(255, 255, 255, 0.5)',
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
          color: 'var(--accent)',
        }}>
          {targetTime.formatted}
        </div>

        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: 'rgba(255, 255, 255, 0.6)',
        }}>
          {formatDateShort(targetTime.targetDate)}
        </div>

        <div style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          fontSize: '12px',
          color: 'rgba(255, 255, 255, 0.4)',
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

      {/* Lock time notice with countdown */}
      <div style={{
        textAlign: 'center',
        fontSize: '12px',
        color: 'var(--text-muted)',
      }}>
        Predictions lock at <strong style={{ color: 'var(--text-primary)' }}>midnight UTC</strong>
        {!lockCountdown.isExpired && (
          <span>
            {' · '}
            <span style={{
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              color: 'var(--accent)',
            }}>
              {pad(lockCountdown.hours)}:{pad(lockCountdown.minutes)}:{pad(lockCountdown.seconds)}
            </span>
            {' left'}
          </span>
        )}
      </div>
    </motion.div>
  )
}
