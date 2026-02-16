import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGame } from '../../context/GameContext'
import { formatPrice, parsePriceInput } from '../../utils/format'

const QUICK_ADJUSTS = [
  { label: '-5k', value: -5000 },
  { label: '-1k', value: -1000 },
  { label: '-500', value: -500 },
  { label: '+500', value: 500 },
  { label: '+1k', value: 1000 },
  { label: '+5k', value: 5000 },
]

export default function PredictionInput() {
  const { btcPrice, submitPrediction } = useGame()
  const [value, setValue] = useState(btcPrice)

  function handleInputChange(raw: string) {
    const parsed = parsePriceInput(raw)
    if (parsed <= 999999999) {
      setValue(parsed)
    }
  }

  function handleAdjust(amount: number) {
    setValue(prev => Math.max(0, prev + amount))
  }

  function handleSubmit() {
    if (value <= 0) return
    submitPrediction(value)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '2px solid var(--accent)',
        boxShadow: '0 0 0 4px var(--accent-border), var(--shadow-elevated)',
        padding: '24px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Top accent bar */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, var(--accent), var(--accent-hover))',
      }} />

      {/* Arrow indicator */}
      <div style={{
        textAlign: 'center',
        marginBottom: '4px',
        fontSize: '20px',
      }}>
        👇
      </div>

      {/* Heading */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
      }}>
        <div style={{
          fontSize: '18px',
          fontWeight: 700,
          color: 'var(--text-primary)',
          marginBottom: '4px',
        }}>
          Make your prediction
        </div>
        <div style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          What will BTC be worth at the target time?
        </div>
      </div>

      {/* Price input */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px',
        marginBottom: '16px',
        padding: '12px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
      }}>
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '36px',
          fontWeight: 700,
          color: 'var(--text-muted)',
        }}>
          $
        </span>
        <input
          type="text"
          inputMode="numeric"
          value={formatPrice(value)}
          onChange={e => handleInputChange(e.target.value)}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '36px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            width: '220px',
            textAlign: 'center',
          }}
        />
      </div>

      {/* Quick adjust buttons */}
      <div style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        marginBottom: '20px',
        flexWrap: 'wrap',
      }}>
        {QUICK_ADJUSTS.map((adj) => (
          <motion.button
            key={adj.label}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleAdjust(adj.value)}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '12px',
              fontWeight: 600,
              padding: '6px 12px',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--bg-secondary)',
              color: adj.value > 0 ? 'var(--green)' : 'var(--red)',
              border: '1px solid var(--border)',
              cursor: 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {adj.label}
          </motion.button>
        ))}
      </div>

      {/* CTA Button — big and bold */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        disabled={value <= 0}
        style={{
          width: '100%',
          padding: '16px 24px',
          background: value > 0 ? 'var(--accent)' : 'var(--bg-secondary)',
          color: value > 0 ? '#fff' : 'var(--text-muted)',
          fontSize: '17px',
          fontWeight: 700,
          fontFamily: 'var(--font-body)',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          cursor: value > 0 ? 'pointer' : 'not-allowed',
          boxShadow: value > 0 ? '0 4px 12px rgba(247, 147, 26, 0.3)' : 'none',
          transition: 'all 0.15s ease',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        🔒 Lock In Prediction
      </motion.button>

      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: 'var(--text-muted)',
        marginTop: '10px',
      }}>
        Within $500 of the real price? You win a share of the $5 daily pot
      </div>
    </motion.div>
  )
}
