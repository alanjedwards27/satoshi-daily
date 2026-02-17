import styles from './SponsorCard.module.css'

export default function SponsorCard() {
  return (
    <div className={styles.card}>
      <div className={styles.label}>Sponsored</div>
      <a
        href="https://postonce.to/?ref=satoshidaily"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        <div className={styles.body}>
          <div className={styles.name}>PostOnce</div>
          <div className={styles.description}>
            Write once, publish everywhere. Share to X, LinkedIn, Threads &amp; more in one click.
          </div>
        </div>
        <div className={styles.cta}>Try Free →</div>
      </a>
    </div>
  )
}
