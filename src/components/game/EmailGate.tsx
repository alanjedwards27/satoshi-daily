import { useState, useEffect, useRef, type FormEvent } from 'react'
import { motion } from 'framer-motion'
import Card from '../shared/Card'
import Button from '../shared/Button'
import { useAuth } from '../../context/AuthContext'

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: any) => string
      reset: (widgetId: string) => void
      remove: (widgetId: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

export default function EmailGate() {
  const { signup } = useAuth()
  const [email, setEmail] = useState('')
  const [marketing, setMarketing] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const captchaRef = useRef<HTMLDivElement>(null)
  const widgetIdRef = useRef<string | null>(null)

  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  // Load Turnstile script + render widget
  useEffect(() => {
    function renderWidget() {
      if (captchaRef.current && window.turnstile && !widgetIdRef.current) {
        widgetIdRef.current = window.turnstile.render(captchaRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => setCaptchaToken(token),
          'expired-callback': () => setCaptchaToken(null),
          theme: 'dark',
          size: 'flexible',
        })
      }
    }

    if (window.turnstile) {
      renderWidget()
      return
    }

    if (!document.getElementById('turnstile-script')) {
      window.onTurnstileLoad = renderWidget

      const script = document.createElement('script')
      script.id = 'turnstile-script'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad'
      script.async = true
      document.head.appendChild(script)
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current) } catch { /* ignore */ }
        widgetIdRef.current = null
      }
    }
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!isValid || sending) return

    if (!captchaToken) {
      setError('Please complete the verification check.')
      return
    }

    setError('')
    setSending(true)

    const result = await signup(email, marketing, captchaToken)

    if (result.error) {
      setError(result.error)
      setSending(false)
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.reset(widgetIdRef.current)
      }
      setCaptchaToken(null)
    }
    // On success, AuthContext sets user → GameContext unlocks guess 2
  }

  return (
    <Card delay={0.1} variant="accent">
      <form onSubmit={handleSubmit} style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔓</div>
        <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '4px', color: 'var(--text-primary)' }}>
          Unlock your 2nd guess
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.5' }}>
          Enter your email to get a second prediction. Your best guess counts towards the $5 daily prize pool.
        </div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: '12px' }}
        >
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
            style={{
              width: '100%',
              padding: '12px 14px',
              fontSize: '15px',
              fontFamily: 'var(--font-body)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </motion.div>

        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
          marginBottom: '12px',
          textAlign: 'left',
        }}>
          <input
            type="checkbox"
            id="gate-marketing"
            checked={marketing}
            onChange={e => setMarketing(e.target.checked)}
            style={{ marginTop: '3px', cursor: 'pointer' }}
          />
          <label htmlFor="gate-marketing" style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5', cursor: 'pointer' }}>
            Send me daily results & Bitcoin insights. Unsubscribe anytime.
          </label>
        </div>

        {/* Turnstile captcha */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div ref={captchaRef} />
        </div>

        {error && (
          <div style={{
            padding: '8px 12px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#ef4444',
            fontSize: '12px',
            marginBottom: '12px',
          }}>
            {error}
          </div>
        )}

        <Button type="submit" fullWidth disabled={!isValid || sending || !captchaToken}>
          {sending ? 'Signing up...' : '🔓 Unlock 2nd Guess'}
        </Button>

        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
          🔒 We'll never sell your data. By signing up you agree to our{' '}
          <a href="#/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms</a> and{' '}
          <a href="#/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</a>
        </div>
      </form>
    </Card>
  )
}
