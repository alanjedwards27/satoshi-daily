import { useState, type ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  const [showHowToPlay, setShowHowToPlay] = useState(false)

  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <span className={styles.logoText}>Satoshi Daily</span>
        </div>
        <span className={styles.tagline}>The Daily Bitcoin Price Game</span>
        <button
          onClick={() => setShowHowToPlay(true)}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '5px 12px',
            background: 'var(--accent-light)',
            border: '1px solid var(--accent-border)',
            borderRadius: 'var(--radius-full, 999px)',
            color: 'var(--accent)',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '4px',
          }}
        >
          🎯 How to Play · $5 Daily Prize
        </button>
      </div>
      <div className={styles.content}>
        {children}
      </div>
      <footer className={styles.footer}>
        <a
          href="https://x.com/SatoshiDailyApp"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.followLink}
        >
          <span className={styles.xIcon}>𝕏</span>
          Follow @SatoshiDailyApp
        </a>
      </footer>

      {/* How to Play modal */}
      {showHowToPlay && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setShowHowToPlay(false)}
        >
          {/* Backdrop */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }} />

          {/* Modal content */}
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '400px',
              maxHeight: '80vh',
              overflow: 'auto',
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border)',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
              padding: '24px 20px',
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setShowHowToPlay(false)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontSize: '16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 0,
              }}
            >
              ×
            </button>

            <div style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              How to Play
            </div>

            {/* Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              {[
                { icon: '🎯', text: 'See tomorrow\'s target time and the current BTC price' },
                { icon: '💰', text: 'Predict what BTC will be worth at that exact moment' },
                { icon: '⏳', text: 'Wait for the target time — results reveal automatically' },
                { icon: '🏆', text: 'Nail the exact price? You win a share of the $5 daily pot' },
              ].map((step, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '10px 12px',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-sm)',
                }}>
                  <span style={{ fontSize: '18px', flexShrink: 0 }}>{step.icon}</span>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.5' }}>{step.text}</span>
                </div>
              ))}
            </div>

            {/* Guess tiers */}
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Get up to 3 guesses per day
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '20px' }}>
              {[
                { label: 'Guess 1', desc: 'Free — no signup needed', icon: '🆓' },
                { label: 'Guess 2', desc: 'Enter your email', icon: '✉️' },
                { label: 'Guess 3', desc: 'Share with a friend', icon: '📣' },
              ].map(tier => (
                <div key={tier.label} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  color: 'var(--text-secondary)',
                }}>
                  <span style={{ fontSize: '14px' }}>{tier.icon}</span>
                  <span><strong style={{ color: 'var(--text-primary)' }}>{tier.label}</strong> — {tier.desc}</span>
                </div>
              ))}
            </div>

            {/* Prize pool */}
            <div style={{
              textAlign: 'center',
              padding: '14px 12px',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--accent-border)',
              marginBottom: '12px',
            }}>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '24px',
                fontWeight: 700,
                color: 'var(--accent)',
              }}>
                $5 in BTC
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Daily prize pool — split between all exact-match winners
              </div>
            </div>

            {/* Lightning info */}
            <div style={{
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span style={{ fontSize: '16px' }}>⚡</span>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                Paid via <strong style={{ color: 'var(--text-primary)' }}>Lightning Network</strong>. No rollover — unclaimed prizes are not carried forward.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
