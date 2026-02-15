import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../shared/Button'
import styles from './CodeInput.module.css'

export default function CodeInput() {
  const { pendingEmail, resendMagicLink, clearPending } = useAuth()
  const [resendCooldown, setResendCooldown] = useState(30) // Start with cooldown since we just sent

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  async function handleResend() {
    setResendCooldown(30)
    await resendMagicLink()
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.heading}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div style={{
          fontSize: '48px',
          marginBottom: '16px',
          lineHeight: 1,
        }}>
          ✉️
        </div>
        <h2>Check your email</h2>
        <p>
          We sent a magic link to <span className={styles.email}>{pendingEmail}</span>
        </p>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '8px' }}>
          Click the link in your email to sign in. You can close this tab — the link will bring you right back.
        </p>
      </motion.div>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.resend}>
          {resendCooldown > 0 ? (
            <span>Resend in {resendCooldown}s</span>
          ) : (
            <>
              Didn't get the email?{' '}
              <button onClick={handleResend}>Resend magic link</button>
            </>
          )}
        </div>

        <Button type="button" variant="secondary" fullWidth onClick={clearPending}>
          Use a different email
        </Button>
      </motion.div>
    </div>
  )
}
