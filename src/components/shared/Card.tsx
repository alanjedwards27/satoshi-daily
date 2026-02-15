import type { ReactNode, CSSProperties } from 'react'
import { motion } from 'framer-motion'

interface CardProps {
  children: ReactNode
  delay?: number
  variant?: 'default' | 'green' | 'accent'
  className?: string
  style?: CSSProperties
}

const variantStyles: Record<string, CSSProperties> = {
  default: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    border: '1px solid var(--border)',
  },
  green: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderLeft: '3px solid var(--green)',
    borderTop: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
  accent: {
    background: 'var(--bg-card)',
    boxShadow: 'var(--shadow-card)',
    borderLeft: '3px solid var(--accent)',
    borderTop: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    borderBottom: '1px solid var(--border)',
  },
}

export default function Card({ children, delay = 0, variant = 'default', className, style }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      style={{
        borderRadius: 'var(--radius-lg)',
        padding: 'var(--space-xl)',
        ...variantStyles[variant],
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
