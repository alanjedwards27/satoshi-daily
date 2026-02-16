import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { maskEmail, formatPriceWithDollar } from '../../utils/format'
import styles from './RecentPredictions.module.css'

interface PredictionRow {
  email: string
  predicted_price: number
  created_at: string
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

export default function RecentPredictions() {
  const [predictions, setPredictions] = useState<PredictionRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchRecent() {
      try {
        // Fetch the most recent predictions across all dates
        const { data } = await supabase
          .from('predictions')
          .select('predicted_price, created_at, profiles!inner(email)')
          .order('created_at', { ascending: false })
          .limit(8)

        if (!data || data.length === 0) {
          setLoading(false)
          return
        }

        const rows: PredictionRow[] = data.map((p: any) => ({
          email: (p.profiles as any).email,
          predicted_price: Number(p.predicted_price),
          created_at: p.created_at,
        }))

        setPredictions(rows)
      } catch (err) {
        console.error('Failed to fetch recent predictions:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchRecent()
  }, [])

  // Don't render if still loading or no predictions
  if (loading || predictions.length === 0) {
    return null
  }

  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className={styles.header}>
        <div className={styles.headerIcon}>🔥</div>
        <div>
          <div className={styles.headerTitle}>Live Predictions</div>
          <div className={styles.headerSub}>
            {predictions.length} recent prediction{predictions.length !== 1 ? 's' : ''}
          </div>
        </div>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          LIVE
        </div>
      </div>

      <div className={styles.list}>
        {predictions.map((p, i) => (
          <div key={i} className={styles.row}>
            <div className={styles.rowLeft}>
              <span className={styles.email}>{maskEmail(p.email)}</span>
              <span className={styles.time}>{timeAgo(p.created_at)}</span>
            </div>
            <div className={styles.rowRight}>
              <span className={styles.arrow}>→</span>
              <span className={styles.price}>{formatPriceWithDollar(p.predicted_price)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        Join them — make your free prediction today
      </div>
    </motion.div>
  )
}
