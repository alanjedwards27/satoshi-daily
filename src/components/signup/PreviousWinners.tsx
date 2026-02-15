import { motion } from 'framer-motion'
import styles from './PreviousWinners.module.css'

const MOCK_WINNERS = [
  {
    date: '14 Feb 2026',
    winners: [
      { tier: 'Exact', share: '£5.00', txId: '3a7f2b...c9e1', txUrl: 'https://mempool.space/lightning' },
    ],
    totalWinners: 1,
    totalPaid: '£5.00',
  },
  {
    date: '13 Feb 2026',
    winners: [
      { tier: 'Within $100', share: '£1.67', txId: 'e1b4d8...a2f3', txUrl: 'https://mempool.space/lightning' },
      { tier: 'Within $100', share: '£1.67', txId: 'f8c2a1...d4e7', txUrl: 'https://mempool.space/lightning' },
      { tier: 'Within $500', share: '£1.66', txId: 'd2a1f9...b7c4', txUrl: 'https://mempool.space/lightning' },
    ],
    totalWinners: 3,
    totalPaid: '£5.00',
  },
  {
    date: '12 Feb 2026',
    winners: [
      { tier: 'Within $100', share: '£2.50', txId: 'a4e7c3...f1b2', txUrl: 'https://mempool.space/lightning' },
      { tier: 'Within $500', share: '£2.50', txId: 'c9f1a8...d3e6', txUrl: 'https://mempool.space/lightning' },
    ],
    totalWinners: 2,
    totalPaid: '£5.00',
  },
]

const TIER_COLORS: Record<string, string> = {
  Exact: '#f7931a',
  'Within $100': '#05b169',
  'Within $500': '#1652f0',
}

export default function PreviousWinners() {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.55 }}
    >
      <div className={styles.header}>
        <div className={styles.headerIcon}>⚡</div>
        <div>
          <div className={styles.headerTitle}>Previous Winners</div>
          <div className={styles.headerSub}>Every payout verified on the Lightning Network</div>
        </div>
      </div>

      <div className={styles.days}>
        {MOCK_WINNERS.map((day) => (
          <div key={day.date} className={styles.day}>
            <div className={styles.dayHeader}>
              <span className={styles.dayDate}>{day.date}</span>
              <span className={styles.dayTotal}>{day.totalWinners} winner{day.totalWinners !== 1 ? 's' : ''} · {day.totalPaid}</span>
            </div>
            <div className={styles.winnerList}>
              {day.winners.map((w, i) => (
                <div key={i} className={styles.winner}>
                  <div className={styles.winnerInfo}>
                    <span
                      className={styles.tierBadge}
                      style={{ color: TIER_COLORS[w.tier] || 'var(--text-secondary)' }}
                    >
                      {w.tier}
                    </span>
                    <span className={styles.winnerPrize}>{w.share}</span>
                  </div>
                  <a
                    href={w.txUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.txLink}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className={styles.txIcon}>⚡</span>
                    <span className={styles.txId}>{w.txId}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        £5 daily pot split equally between all winners. Paid in BTC via Lightning Network within 24 hours.
      </div>
    </motion.div>
  )
}
