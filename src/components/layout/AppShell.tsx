import type { ReactNode } from 'react'
import styles from './AppShell.module.css'

interface AppShellProps {
  children: ReactNode
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <div className={styles.header}>
        <div className={styles.btcIcon}>₿</div>
        <span className={styles.logoText}>Satoshi Daily</span>
      </div>
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}
