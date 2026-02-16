import { useCallback, useState } from 'react'
import Card from '../shared/Card'
import { useGame } from '../../context/GameContext'
import { shareToX, shareToFacebook, shareViaEmail, copyToClipboard } from '../../utils/share'

const BASE_URL = 'https://satoshidaily.app'

export default function ShareCard() {
  const { targetTime } = useGame()
  const [copied, setCopied] = useState(false)

  const shareText = `I just made my daily Bitcoin prediction on @SatoshiDailyApp 🎯\n\nTarget time: ${targetTime.formatted} tomorrow\n\nCan you beat me?\n${BASE_URL}`

  const handleX = useCallback(() => {
    shareToX(shareText)
  }, [shareText])

  const handleFacebook = useCallback(() => {
    shareToFacebook()
  }, [])

  const handleEmail = useCallback(() => {
    shareViaEmail('Check out Satoshi Daily — free Bitcoin prediction game', shareText)
  }, [shareText])

  const handleCopy = useCallback(async () => {
    const ok = await copyToClipboard(shareText)
    if (ok) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [shareText])

  return (
    <Card delay={0.15}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📣</div>
        <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>
          Challenge your mates
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Share Satoshi Daily and see who gets closest.
        </div>

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
