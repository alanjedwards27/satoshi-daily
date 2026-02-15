import { useEffect, useRef } from 'react'

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>
  }
}

type AdFormat = 'banner' | 'rectangle' | 'leaderboard'

interface AdSlotProps {
  /** Your AdSense ad-slot ID, e.g. "1234567890" */
  slot: string
  /** Visual format — controls the container's aspect ratio */
  format?: AdFormat
  /** Optional label shown above the ad (e.g. "Sponsored") */
  label?: string
}

const FORMAT_STYLES: Record<AdFormat, React.CSSProperties> = {
  banner: { minHeight: '60px', maxHeight: '100px' },
  rectangle: { minHeight: '250px' },
  leaderboard: { minHeight: '90px' },
}

/**
 * Google AdSense display ad component.
 *
 * Usage:
 *   1. Add your AdSense `<script>` tag to index.html
 *   2. Drop <AdSlot slot="YOUR_SLOT_ID" /> wherever you want an ad
 *
 * In development (no AdSense script), renders a placeholder so you
 * can see exactly where the ad will sit.
 */
export default function AdSlot({ slot, format = 'banner', label }: AdSlotProps) {
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
      pushed.current = true
    } catch {
      // AdSense script not loaded — that's fine in dev
    }
  }, [])

  const isDevMode = !window.adsbygoogle && import.meta.env.DEV

  return (
    <div
      style={{
        width: '100%',
        overflow: 'hidden',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        marginTop: '4px',
      }}
    >
      {label && (
        <div
          style={{
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            color: 'var(--text-muted)',
            textAlign: 'center',
            padding: '6px 0 0',
          }}
        >
          {label}
        </div>
      )}

      {isDevMode ? (
        /* ---------- Dev placeholder ---------- */
        <div
          style={{
            ...FORMAT_STYLES[format],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '4px',
            padding: '16px',
            background:
              'repeating-linear-gradient(45deg, var(--bg-secondary), var(--bg-secondary) 10px, transparent 10px, transparent 20px)',
          }}
        >
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
            AdSense — {format}
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', opacity: 0.6 }}>
            slot: {slot}
          </span>
        </div>
      ) : (
        /* ---------- Real AdSense unit ---------- */
        <ins
          className="adsbygoogle"
          style={{
            display: 'block',
            ...FORMAT_STYLES[format],
          }}
          data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      )}
    </div>
  )
}
