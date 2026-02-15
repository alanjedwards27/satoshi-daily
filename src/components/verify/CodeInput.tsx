import { useState, useRef, useCallback, type KeyboardEvent, type ClipboardEvent, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import Button from '../shared/Button'
import styles from './CodeInput.module.css'

const CODE_LENGTH = 6

export default function CodeInput() {
  const { user, verify, signup } = useAuth()
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error, setError] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const isComplete = digits.every(d => d !== '')

  // Auto-focus first input
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [resendCooldown])

  const handleChange = useCallback((index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/[^0-9]/g, '').slice(-1)
    setError(false)

    setDigits(prev => {
      const next = [...prev]
      next[index] = digit
      return next
    })

    // Auto-advance to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }, [])

  const handleKeyDown = useCallback((index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
      setDigits(prev => {
        const next = [...prev]
        next[index - 1] = ''
        return next
      })
    }
  }, [digits])

  const handlePaste = useCallback((e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return

    const newDigits = Array(CODE_LENGTH).fill('')
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i]
    }
    setDigits(newDigits)
    setError(false)

    // Focus last filled or next empty
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }, [])

  function handleVerify() {
    const code = digits.join('')
    if (code.length !== CODE_LENGTH) return

    const success = verify(code)
    if (!success) {
      setError(true)
      setDigits(Array(CODE_LENGTH).fill(''))
      inputRefs.current[0]?.focus()
    }
  }

  function handleResend() {
    setResendCooldown(30)
    // In production, this would trigger a new email
  }

  function handleBack() {
    // Go back to signup by resetting user
    if (user) {
      signup('', false)
    }
  }

  return (
    <div className={styles.container}>
      <motion.div
        className={styles.heading}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2>Verify your email</h2>
        <p>
          We sent a 6-digit code to <span className={styles.email}>{user?.email}</span>
        </p>
      </motion.div>

      <motion.div
        className={styles.boxes}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={el => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={e => handleChange(i, e.target.value)}
            onKeyDown={e => handleKeyDown(i, e)}
            onPaste={i === 0 ? handlePaste : undefined}
            className={`${styles.box} ${error ? styles.boxError : ''}`}
            autoComplete="one-time-code"
          />
        ))}
      </motion.div>

      <motion.div
        className={styles.hint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.25 }}
      >
        Demo code: 123456
      </motion.div>

      <motion.div
        className={styles.actions}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Button fullWidth disabled={!isComplete} onClick={handleVerify}>
          Verify & Play
        </Button>

        <div className={styles.resend}>
          {resendCooldown > 0 ? (
            <span>Resend code in {resendCooldown}s</span>
          ) : (
            <>
              Didn't get the code?{' '}
              <button onClick={handleResend}>Resend</button>
            </>
          )}
        </div>

        <button className={styles.backLink} onClick={handleBack}>
          Use a different email
        </button>
      </motion.div>
    </div>
  )
}
