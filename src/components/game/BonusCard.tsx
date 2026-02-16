import { useCallback, useRef, useState, useEffect } from 'react'
import Card from '../shared/Card'
import { useGame } from '../../context/GameContext'
import { shareToX, shareToFacebook, shareViaEmail, copyToClipboard } from '../../utils/share'

const BASE_URL = 'satoshidaily.app'
const FULL_URL = 'https://satoshidaily.app'

export default function BonusCard() {
  const { targetTime, unlockBonus } = useGame()
  const [waiting, setWaiting] = useState(false)
  const [copied, setCopied] = useState(false)
  const shareTimeRef = useRef<number>(0)
  const leftPageRef = useRef(false)
  const platformRef = useRef<string>('unknown')

  const shareText = `I just made my daily Bitcoin prediction on @SatoshiDailyApp 🎯\n\nTarget time: ${targetTime.formatted} tomorrow\n\nCan you beat me?\n${BASE_URL}`

  function startWaiting(platform: string) {
    shareTimeRef.current = Date.now()
    leftPageRef.current = false
    platformRef.current = platform
    setWaiting(true)
  }

  const handleX = useCallback(() => {
    shareToX(shareText)
    startWaiting('x')
  }, [shareText])

  const handleFacebook = useCallback(() => {
    shareToFacebook()
    startWaiting('facebook')
  }, [])

  const emailText = `I just made my daily Bitcoin prediction on Satoshi Daily 🎯\n\nTarget time: ${targetTime.formatted} tomorrow\n\nCan you beat me?\n${FULL_URL}`

  const handleEmail = useCallback(() => {
    shareViaEmail('Check out Satoshi Daily — free Bitcoin prediction game', emailText)
    startWaiting('email')
  }, [emailText])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(shareText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      startWaiting('copy')
    }
  }, [shareText])

  // Listen for the user leaving and returning to the page
  useEffect(() => {
    if (!waiting) return

    function handleVisibility() {
      if (document.hidden) {
        leftPageRef.current = true
      } else if (leftPageRef.current) {
        const elapsed = Date.now() - shareTimeRef.current
        if (elapsed >= 10000) {
          unlockBonus(platformRef.current)
          setWaiting(false)
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [waiting, unlockBonus])

  // Fallback: if they've been waiting 30s+ and left the page, just unlock
  useEffect(() => {
    if (!waiting) return

    const fallback = setTimeout(() => {
      if (leftPageRef.current) {
        unlockBonus(platformRef.current)
        setWaiting(false)
      }
    }, 30000)

    return () => clearTimeout(fallback)
  }, [waiting, unlockBonus])

  return (
    <Card delay={0.1} variant="accent">
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🎁</div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
          Want a second guess?
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Share Satoshi Daily to unlock a bonus prediction. Your best guess counts.
        </div>

        {waiting ? (
          <div style={{
            padding: '12px',
            background: 'var(--bg-secondary)',
            borderRadius: 'var(--radius-md)',
            fontSize: '13px',
            color: 'var(--text-muted)',
            lineHeight: '1.5',
          }}>
            Share it, then come back here to unlock your bonus guess…
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '8px',
          }}>
            <ShareBtn icon="𝕏" label="X" color="#000" onClick={handleX} />
            <ShareBtn icon="f" label="Facebook" color="#1877F2" onClick={handleFacebook} />
            <ShareBtn icon="✉" label="Email" color="#5b616e" onClick={handleEmail} />
            <ShareBtn
              icon={copied ? '✓' : '🔗'}
              label={copied ? 'Copied!' : 'Copy'}
              color={copied ? '#05b169' : '#5b616e'}
              onClick={handleCopy}
            />
          </div>
        )}
      </div>
    </Card>
  )
}

function ShareBtn({ icon, label, color, onClick }: { icon: string; label: string; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        padding: '8px 4px',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
      }}
    >
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        background: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '18px',
        fontWeight: 700,
      }}>
        {icon}
      </div>
      <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>{label}</span>
    </button>
  )
}
