import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { generateShareCard } from '../../utils/shareCard'
import {
  shareResultToX,
  shareResultToFacebook,
  shareResultViaEmail,
  copyToClipboard,
  getResultShareText,
  type ShareData,
} from '../../utils/share'
import type { AccuracyTier } from '../../utils/accuracy'

interface ShareModalProps {
  open: boolean
  onClose: () => void
  shareData: ShareData
  prediction: number
  actual: number
  tier: AccuracyTier
  isWinner: boolean
}

export default function ShareModal({ open, onClose, shareData, prediction, actual, tier, isWinner }: ShareModalProps) {
  const [cardUrl, setCardUrl] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (open) {
      setCopied(false)
      generateShareCard({
        date: shareData.date,
        targetTime: shareData.targetTime,
        prediction,
        actual,
        accuracy: shareData.accuracy,
        difference: shareData.difference,
        tier,
        streak: shareData.streak,
        isWinner,
      }).then(setCardUrl)
    }
  }, [open, shareData, prediction, actual, tier, isWinner])

  const handleCopy = useCallback(async () => {
    const text = getResultShareText(shareData)
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareData])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-elevated)',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: '1px solid var(--border)',
            }}>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                Share your result
              </div>
              <button
                onClick={onClose}
                style={{
                  fontSize: '20px',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  background: 'none',
                  border: 'none',
                  padding: '4px',
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            </div>

            {/* Card preview */}
            <div style={{ padding: '16px 20px' }}>
              {cardUrl && (
                <img
                  src={cardUrl}
                  alt="Your Satoshi Daily result"
                  style={{
                    width: '100%',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border)',
                  }}
                />
              )}
              <div style={{
                textAlign: 'center',
                fontSize: '11px',
                color: 'var(--text-muted)',
                marginTop: '8px',
              }}>
                Preview of what others will see
              </div>
            </div>

            {/* Share buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '8px',
              padding: '4px 20px 20px',
            }}>
              <ShareButton
                icon="𝕏"
                label="X"
                color="#000"
                onClick={() => shareResultToX(shareData)}
              />
              <ShareButton
                icon="f"
                label="Facebook"
                color="#1877F2"
                onClick={shareResultToFacebook}
              />
              <ShareButton
                icon="✉"
                label="Email"
                color="#5b616e"
                onClick={() => shareResultViaEmail(shareData)}
              />
              <ShareButton
                icon={copied ? '✓' : '🔗'}
                label={copied ? 'Copied!' : 'Copy'}
                color={copied ? '#05b169' : '#5b616e'}
                onClick={handleCopy}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ShareButton({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        padding: '10px 4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '20px',
        fontWeight: 700,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </button>
  )
}
