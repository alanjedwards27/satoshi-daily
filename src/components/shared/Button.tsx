import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost'
  fullWidth?: boolean
}

const baseStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '15px',
  padding: '14px 24px',
  borderRadius: 'var(--radius-md)',
  transition: 'all 0.15s ease',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
}

const variants: Record<string, React.CSSProperties> = {
  primary: {
    background: 'var(--accent)',
    color: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
  },
  secondary: {
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    border: '1px solid var(--border)',
    boxShadow: 'var(--shadow-sm)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--text-secondary)',
    padding: '8px 12px',
  },
}

const disabledStyle: React.CSSProperties = {
  opacity: 0.4,
  cursor: 'not-allowed',
}

export default function Button({ children, variant = 'primary', fullWidth, disabled, style, ...props }: ButtonProps) {
  return (
    <button
      style={{
        ...baseStyle,
        ...variants[variant],
        ...(fullWidth ? { width: '100%' } : {}),
        ...(disabled ? disabledStyle : {}),
        ...style,
      }}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
