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
          <span className={styles.logoText}>Satoshi Daily</span>
        </div>
        <span className={styles.tagline}>The Daily Bitcoin Price Game</span>
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
    </div>
  )
}
