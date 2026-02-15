import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import styles from './PreviousWinners.module.css'

interface WinnerRow {
  game_date: string
  prize_tier: string
  prize_share: number | null
  tx_id: string | null
  tx_url: string | null
}

interface WinnerDay {
  date: string
  winners: { tier: string; share: string; txId: string; txUrl: string }[]
  totalWinners: number
  totalPaid: string
}

const TIER_LABELS: Record<string, string> = {
  exact: 'Exact',
  within_100: 'Within $100',
  within_500: 'Within $500',
}

const TIER_COLORS: Record<string, string> = {
  Exact: '#f7931a',
  'Within $100': '#05b169',
  'Within $500': '#1652f0',
}

export default function PreviousWinners() {
  const [days, setDays] = useState<WinnerDay[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchWinners() {
      try {
        const { data } = await supabase
          .from('winners')
          .select('game_date, prize_tier, prize_share, tx_id, tx_url')
          .order('game_date', { ascending: false })
          .limit(20)

        if (!data || data.length === 0) {
          setLoading(false)
          return
        }

        // Group by game_date
        const grouped = new Map<string, WinnerRow[]>()
        for (const w of data) {
          const existing = grouped.get(w.game_date) || []
          existing.push(w)
          grouped.set(w.game_date, existing)
        }

        const winnerDays: WinnerDay[] = Array.from(grouped.entries())
          .slice(0, 3) // Last 3 days
          .map(([dateStr, winners]) => ({
            date: new Date(dateStr + 'T00:00:00Z').toLocaleDateString('en-GB', {
              day: 'numeric', month: 'short', year: 'numeric',
            }),
            winners: winners.map(w => ({
              tier: TIER_LABELS[w.prize_tier] || w.prize_tier,
              share: w.prize_share ? `\u00A3${w.prize_share.toFixed(2)}` : 'Pending',
              txId: w.tx_id ? `${w.tx_id.slice(0, 6)}...${w.tx_id.slice(-4)}` : 'pending...',
              txUrl: w.tx_url || '#',
            })),
            totalWinners: winners.length,
            totalPaid: `\u00A3${winners.reduce((sum, w) => sum + (w.prize_share || 0), 0).toFixed(2)}`,
          }))

        setDays(winnerDays)
      } catch (err) {
        console.error('Failed to fetch winners:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWinners()
  }, [])

  // Don't render anything if still loading or no winners yet
  if (loading || days.length === 0) {
    return null
  }

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
        {days.map((day) => (
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
