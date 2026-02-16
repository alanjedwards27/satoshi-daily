import { useState, type FormEvent, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getTargetTime } from '../../utils/targetTime'
import { useCountdown } from '../../hooks/useCountdown'
import Button from '../shared/Button'
import AdSlot from '../shared/AdSlot'
import GamePreview from './GamePreview'
import RecentPredictions from './RecentPredictions'
import PreviousWinners from './PreviousWinners'
import styles from './SignupForm.module.css'

const SELLING_POINTS = [
  { icon: '₿', text: '$5 daily BTC prize pool' },
  { icon: '⚡', text: 'Winnings paid via Lightning' },
  { icon: '🎯', text: '100% free to play, always' },
  { icon: '𝕏', text: 'Share on X for a bonus guess' },
]

export default function SignupForm() {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [marketing, setMarketing] = useState(false)
  const [sending, setSending] = useState(false)

  const targetTime = useMemo(() => getTargetTime(), [])
  const lockCountdown = useCountdown(targetTime.lockDate)
  const pad = (n: number) => String(n).padStart(2, '0')

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid || sending) return
    setSending(true)
    await signup(email, marketing)
    // AuthContext sets status to 'pending_magic_link' → App shows VerifyPage
  }

  function handleShare() {
    const text = encodeURIComponent('Just found @SatoshiDailyApp — a free daily Bitcoin prediction game where you can win real BTC ⚡\n\nsatoshidaily.app')
    window.open(`https://x.com/intent/tweet?text=${text}`, '_blank', 'width=550,height=420')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <motion.div
        className={styles.heading}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className={styles.btcBadge}>
          <img src="/logo.png" alt="Satoshi Daily" className={styles.btcLogo} />
        </div>
        <h1>Predict Bitcoin.<br />Win Bitcoin.</h1>
        <p>Free daily price prediction game. One guess per day. Predict within $500 of the real price and share the $5 daily prize pool — paid straight to your Lightning wallet.</p>
      </motion.div>

      {!lockCountdown.isExpired && (
        <motion.div
          className={styles.countdownBanner}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
        >
          <div className={styles.countdownLabel}>Today's game closes in</div>
          <div className={styles.countdownTimer}>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNum}>{pad(lockCountdown.hours)}</span>
              <span className={styles.countdownSub}>hrs</span>
            </div>
            <span className={styles.countdownSep}>:</span>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNum}>{pad(lockCountdown.minutes)}</span>
              <span className={styles.countdownSub}>min</span>
            </div>
            <span className={styles.countdownSep}>:</span>
            <div className={styles.countdownUnit}>
              <span className={styles.countdownNum}>{pad(lockCountdown.seconds)}</span>
              <span className={styles.countdownSub}>sec</span>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className={styles.sellingPoints}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {SELLING_POINTS.map((point, i) => (
          <div className={styles.point} key={i}>
            <div className={styles.pointIcon}>{point.icon}</div>
            <span>{point.text}</span>
          </div>
        ))}
      </motion.div>

      <motion.div
        className={styles.inputGroup}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          className={styles.emailInput}
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          autoComplete="email"
          autoFocus
        />
      </motion.div>

      <motion.div
        className={styles.checkboxGroup}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <input
          type="checkbox"
          id="marketing"
          className={styles.checkbox}
          checked={marketing}
          onChange={e => setMarketing(e.target.checked)}
        />
        <label htmlFor="marketing" className={styles.checkboxLabel}>
          Send me daily results, Bitcoin insights & sponsor offers. Unsubscribe anytime.
        </label>

        <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '4px 0 0', paddingLeft: '30px', lineHeight: 1.5 }}>
          🔒 We'll never sell your data. You'll only ever hear from us.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Button type="submit" fullWidth disabled={!isValid || sending}>
          {sending ? 'Sending magic link...' : 'Get Started Free'}
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        style={{ width: '100%' }}
      >
        <Button type="button" variant="secondary" fullWidth onClick={handleShare}>
          Share on X
        </Button>
      </motion.div>

      <motion.div
        className={styles.footer}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        By signing up you agree to our <a href="#/terms">Terms</a> and <a href="#/privacy">Privacy Policy</a>
      </motion.div>

      <GamePreview />

      <RecentPredictions />

      {/* Ad between game preview and winners — below the fold, non-intrusive */}
      <AdSlot slot="signup-mid" format="banner" label="Sponsored" />

      <PreviousWinners />
    </form>
  )
}
