import { motion } from 'framer-motion'
import styles from './GamePreview.module.css'

export default function GamePreview() {
  return (
    <motion.div
      className={styles.wrapper}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className={styles.label}>Sneak peek</div>

      <div className={styles.preview}>
        {/* Fake stats bar */}
        <div className={styles.statsRow}>
          {[
            { label: 'Streak', value: '7' },
            { label: 'Played', value: '23' },
            { label: 'Best', value: '99.2%' },
            { label: 'Average', value: '94.1%' },
          ].map((s) => (
            <div key={s.label} className={styles.statBox}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Fake target card */}
        <div className={styles.card}>
          <div className={styles.cardAccent} />
          <div className={styles.cardInner}>
            <div className={styles.cardRow}>
              <div>
                <div className={styles.cardLabel}>BTC/USD</div>
                <div className={styles.cardPrice}>$97,482</div>
                <div className={styles.cardChange}>+2.31% 24h</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className={styles.cardLabel}>Target Time</div>
                <div className={styles.cardTime}>14:30 UTC</div>
                <div className={styles.cardDate}>16 Feb 2026</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fake prediction input */}
        <div className={styles.card}>
          <div className={styles.cardInner}>
            <div className={styles.cardLabel} style={{ textAlign: 'center', marginBottom: '8px' }}>Your Prediction</div>
            <div className={styles.fakePriceInput}>$97,500</div>
            <div className={styles.fakeAdjustRow}>
              {['-5k', '-1k', '-500', '+500', '+1k', '+5k'].map((adj) => (
                <div key={adj} className={styles.fakeAdjustBtn}>{adj}</div>
              ))}
            </div>
            <div className={styles.fakeButton}>Lock In Prediction</div>
          </div>
        </div>

        {/* Gradient fade overlay */}
        <div className={styles.fadeOverlay} />

        {/* CTA overlay */}
        <div className={styles.ctaOverlay}>
          <div className={styles.lockIcon}>🔒</div>
          <div className={styles.ctaText}>Sign up free to start playing</div>
        </div>
      </div>
    </motion.div>
  )
}
