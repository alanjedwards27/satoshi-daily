import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <img src="/logo.png" alt="Satoshi Daily" className={styles.logoImg} />
          <span className={styles.logoText}>Satoshi Daily</span>
        </div>
        <span className={styles.tagline}>The Daily Bitcoin Price Game</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
