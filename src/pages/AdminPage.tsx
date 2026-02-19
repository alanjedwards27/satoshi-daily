import { useState, useEffect } from 'react'
import AppShell from '../components/layout/AppShell'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { getTargetTime } from '../utils/targetTime'
import { formatPriceWithDollar } from '../utils/format'
import { shareToX, copyToClipboard } from '../utils/share'

const ADMIN_EMAIL = 'alanjedwards27@gmail.com'

interface Stats {
  totalViews: number
  todayViews: number
  totalPredictions: number
  todayPredictions: number
  totalProfiles: number
}

interface YesterdayData {
  actualPrice: number
  targetTime: string
  playerCount: number
  closestPrice: number
  closestDiff: number
  dateLabel: string
}

export default function AdminPage() {
  const { user, status } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [yesterday, setYesterday] = useState<YesterdayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState<number | null>(null)

  const isAdmin = user?.email === ADMIN_EMAIL

  useEffect(() => {
    if (!isAdmin) return
    fetchData()
  }, [isAdmin])

  async function fetchData() {
    setLoading(true)
    const todayStr = new Date().toISOString().split('T')[0]

    // Yesterday's date
    const y = new Date()
    y.setUTCDate(y.getUTCDate() - 1)
    const yesterdayStr = y.toISOString().split('T')[0]

    // Run all queries in parallel
    const [
      viewsTotal,
      viewsToday,
      predsTotal,
      predsToday,
      profilesTotal,
      yesterdayResult,
      yesterdayPreds,
    ] = await Promise.all([
      supabase.from('page_views').select('*', { count: 'exact', head: true }),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', todayStr),
      supabase.from('predictions').select('*', { count: 'exact', head: true }),
      supabase.from('predictions').select('*', { count: 'exact', head: true }).eq('game_date', todayStr),
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('daily_results').select('actual_price, target_hour, target_minute').eq('game_date', yesterdayStr).maybeSingle(),
      supabase.from('predictions').select('user_id, predicted_price').eq('game_date', yesterdayStr),
    ])

    setStats({
      totalViews: viewsTotal.count ?? 0,
      todayViews: viewsToday.count ?? 0,
      totalPredictions: predsTotal.count ?? 0,
      todayPredictions: predsToday.count ?? 0,
      totalProfiles: profilesTotal.count ?? 0,
    })

    // Process yesterday's data
    if (yesterdayResult.data?.actual_price && yesterdayPreds.data) {
      const actual = Number(yesterdayResult.data.actual_price)
      const h = yesterdayResult.data.target_hour
      const m = yesterdayResult.data.target_minute
      const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} UTC`

      // Best prediction per user
      const userBest = new Map<string, number>()
      for (const p of yesterdayPreds.data) {
        const price = Number(p.predicted_price)
        const existing = userBest.get(p.user_id)
        if (existing === undefined || Math.abs(price - actual) < Math.abs(existing - actual)) {
          userBest.set(p.user_id, price)
        }
      }

      const allBest = Array.from(userBest.values())
      const closest = allBest.reduce((best, p) =>
        Math.abs(p - actual) < Math.abs(best - actual) ? p : best
      , allBest[0])

      const dateLabel = y.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })

      setYesterday({
        actualPrice: actual,
        targetTime: timeStr,
        playerCount: userBest.size,
        closestPrice: closest,
        closestDiff: Math.abs(closest - actual),
        dateLabel,
      })
    }

    setLoading(false)
  }

  // Auth states
  if (status === 'loading') {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </AppShell>
    )
  }

  if (!isAdmin) {
    return (
      <AppShell>
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Not authorized
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
            Admin access only
          </div>
          <a href="#/" style={{ color: 'var(--accent)', fontSize: '13px', fontWeight: 600 }}>
            Back to game
          </a>
        </div>
      </AppShell>
    )
  }

  // Build tweets
  const targetTime = getTargetTime()
  const now = new Date()
  const midnight = new Date(now)
  midnight.setUTCDate(midnight.getUTCDate() + 1)
  midnight.setUTCHours(0, 0, 0, 0)
  const hoursLeft = Math.max(0, Math.floor((midnight.getTime() - now.getTime()) / (1000 * 60 * 60)))

  const tweet1 = `🎯 New Satoshi Daily game is LIVE!\n\nCan you predict BTC's price at ${targetTime.formatted} tomorrow?\n\n3 free guesses. Closest wins.\n\nPlay now → satoshidaily.app\n\n#Bitcoin #BTC`

  const tweet2 = yesterday
    ? `📊 Satoshi Daily — ${yesterday.dateLabel} Results\n\nBTC hit ${formatPriceWithDollar(yesterday.actualPrice)} at ${yesterday.targetTime}\n👥 ${yesterday.playerCount} players competed\n🏆 Closest: ${formatPriceWithDollar(yesterday.closestPrice)} ($${Math.round(yesterday.closestDiff).toLocaleString()} off!)\n\nToday's game is live. Can you beat that?\n\nsatoshidaily.app\n#Bitcoin #SatoshiDaily`
    : null

  const tweet3 = `⏰ Predictions lock at midnight UTC!\n\n${hoursLeft}h left to predict tomorrow's BTC price.\n\n${stats?.todayPredictions ?? 0} predictions so far — will yours be the closest?\n\nPlay free → satoshidaily.app\n\n#Bitcoin #BTC`

  async function handleCopy(text: string, index: number) {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopied(index)
      setTimeout(() => setCopied(null), 2000)
    }
  }

  return (
    <AppShell>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <a href="#/" style={{ color: 'var(--text-muted)', fontSize: '13px', textDecoration: 'none' }}>
          ← Back
        </a>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {user?.email}
        </span>
      </div>

      <h1 style={{
        fontSize: '20px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        marginBottom: '20px',
        fontFamily: 'var(--font-body)',
      }}>
        Admin Dashboard
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
          Loading stats...
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            marginBottom: '28px',
          }}>
            <StatBox label="Site Visits" value={stats!.totalViews} sub={`${stats!.todayViews} today`} />
            <StatBox label="Predictions" value={stats!.totalPredictions} sub={`${stats!.todayPredictions} today`} />
            <StatBox label="Profiles" value={stats!.totalProfiles} />
          </div>

          {/* Tweet Cards */}
          <h2 style={{
            fontSize: '14px',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '12px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
          }}>
            Daily Tweets
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <TweetCard
              label="🌅 New Game"
              timing="Post in the morning"
              text={tweet1}
              onPost={() => shareToX(tweet1)}
              onCopy={() => handleCopy(tweet1, 1)}
              isCopied={copied === 1}
            />

            {tweet2 ? (
              <TweetCard
                label="📊 Results"
                timing="Post after results are in"
                text={tweet2}
                onPost={() => shareToX(tweet2)}
                onCopy={() => handleCopy(tweet2, 2)}
                isCopied={copied === 2}
              />
            ) : (
              <div style={{
                padding: '16px',
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border)',
                textAlign: 'center',
                color: 'var(--text-muted)',
                fontSize: '13px',
              }}>
                📊 Results tweet — no results from yesterday yet
              </div>
            )}

            <TweetCard
              label="⏰ Closing Soon"
              timing="Post in the evening"
              text={tweet3}
              onPost={() => shareToX(tweet3)}
              onCopy={() => handleCopy(tweet3, 3)}
              isCopied={copied === 3}
            />
          </div>
        </>
      )}
    </AppShell>
  )
}

// --- Sub-components ---

function StatBox({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      padding: '14px 10px',
      textAlign: 'center',
    }}>
      <div style={{
        fontFamily: 'var(--font-mono)',
        fontSize: '22px',
        fontWeight: 700,
        color: 'var(--text-primary)',
        lineHeight: 1.2,
      }}>
        {value.toLocaleString()}
      </div>
      <div style={{
        fontSize: '10px',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginTop: '4px',
        fontWeight: 600,
      }}>
        {label}
      </div>
      {sub && (
        <div style={{
          fontSize: '11px',
          color: 'var(--accent)',
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          marginTop: '4px',
        }}>
          {sub}
        </div>
      )}
    </div>
  )
}

function TweetCard({
  label,
  timing,
  text,
  onPost,
  onCopy,
  isCopied,
}: {
  label: string
  timing: string
  text: string
  onPost: () => void
  onCopy: () => void
  isCopied: boolean
}) {
  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border)',
      padding: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
          {label}
        </span>
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {timing}
        </span>
      </div>

      {/* Tweet preview */}
      <div style={{
        padding: '12px',
        background: 'var(--bg-secondary)',
        borderRadius: 'var(--radius-sm)',
        fontSize: '13px',
        lineHeight: 1.6,
        color: 'var(--text-primary)',
        whiteSpace: 'pre-wrap',
        marginTop: '8px',
        marginBottom: '12px',
        fontFamily: 'var(--font-body)',
      }}>
        {text}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          onClick={onPost}
          style={{
            flex: 1,
            padding: '10px 16px',
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <span style={{ fontSize: '14px' }}>𝕏</span> Post to X
        </button>
        <button
          onClick={onCopy}
          style={{
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-body)',
            minWidth: '80px',
          }}
        >
          {isCopied ? '✓ Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}
