// Supabase Edge Function: record-daily-result
// Schedule: runs every minute via pg_cron
// Purpose: check if any target time has passed, record BTC price, compute winners
// Price oracle: median of 3 sources (Coinbase, CoinGecko, Binance) for fairness

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WIN_THRESHOLD = 500
const DAILY_PRIZE_POOL = 5.00 // $5
const ADMIN_EMAIL = 'alan@satoshidaily.app' // Change to your email

// --- Price Oracle: Median of 3 sources ---

async function fetchCoinbase(): Promise<number | null> {
  try {
    const res = await fetch('https://api.coinbase.com/v2/prices/BTC-USD/spot')
    if (!res.ok) return null
    const json = await res.json()
    return parseFloat(json.data.amount)
  } catch {
    return null
  }
}

async function fetchCoinGecko(): Promise<number | null> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd')
    if (!res.ok) return null
    const json = await res.json()
    return json.bitcoin?.usd ?? null
  } catch {
    return null
  }
}

async function fetchBinance(): Promise<number | null> {
  try {
    const res = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
    if (!res.ok) return null
    const json = await res.json()
    return parseFloat(json.price)
  } catch {
    return null
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2
  }
  return sorted[mid]
}

async function fetchBtcPriceMedian(): Promise<number> {
  const [coinbase, coingecko, binance] = await Promise.all([
    fetchCoinbase(),
    fetchCoinGecko(),
    fetchBinance(),
  ])

  const prices = [coinbase, coingecko, binance].filter((p): p is number => p !== null)
  console.log('Price sources:', { coinbase, coingecko, binance, valid: prices.length })

  if (prices.length === 0) {
    throw new Error('All 3 price sources failed')
  }

  if (prices.length === 1) {
    // Only one source responded — use it but log a warning
    console.warn('Only 1 price source available, using single value:', prices[0])
    return Math.round(prices[0])
  }

  // 2 or 3 sources: take the median (with 2, median = average)
  return Math.round(median(prices))
}

// --- Admin Email Notification via Resend ---

interface DaySummary {
  gameDate: string
  btcPrice: number
  totalPredictions: number
  winnerCount: number
  totalPayout: number
  closestDiff: number | null
  winnerDetails: { email: string; predicted: number; diff: number; tier: string; share: number }[]
}

async function sendAdminEmail(summary: DaySummary) {
  const resendKey = Deno.env.get('RESEND_API_KEY')
  if (!resendKey) {
    console.warn('RESEND_API_KEY not set — skipping admin email')
    return
  }

  const winnerRows = summary.winnerDetails.length > 0
    ? summary.winnerDetails
        .map(w => `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${w.email}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">$${w.predicted.toLocaleString()}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">$${w.diff.toLocaleString()}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">${w.tier}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #eee">$${w.share.toFixed(2)}</td>
        </tr>`)
        .join('')
    : '<tr><td colspan="5" style="padding:12px;text-align:center;color:#999">No winners today</td></tr>'

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#f7931a">🎯 Satoshi Daily — ${summary.gameDate}</h2>

      <div style="background:#f8f9fa;padding:16px;border-radius:8px;margin:16px 0">
        <p style="margin:4px 0"><strong>BTC Price:</strong> $${summary.btcPrice.toLocaleString()}</p>
        <p style="margin:4px 0"><strong>Total Predictions:</strong> ${summary.totalPredictions}</p>
        <p style="margin:4px 0"><strong>Winners:</strong> ${summary.winnerCount}</p>
        <p style="margin:4px 0"><strong>Total Payout:</strong> $${summary.totalPayout.toFixed(2)}</p>
        ${summary.closestDiff !== null ? `<p style="margin:4px 0"><strong>Closest Prediction:</strong> $${summary.closestDiff} off</p>` : ''}
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <thead>
          <tr style="background:#f7931a;color:#fff">
            <th style="padding:8px 12px;text-align:left">Email</th>
            <th style="padding:8px 12px;text-align:left">Predicted</th>
            <th style="padding:8px 12px;text-align:left">Off By</th>
            <th style="padding:8px 12px;text-align:left">Tier</th>
            <th style="padding:8px 12px;text-align:left">Prize</th>
          </tr>
        </thead>
        <tbody>${winnerRows}</tbody>
      </table>

      <p style="color:#999;font-size:12px;margin-top:24px">Sent automatically by Satoshi Daily</p>
    </div>
  `

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Satoshi Daily <noreply@satoshidaily.app>',
        to: [ADMIN_EMAIL],
        subject: `🎯 ${summary.gameDate}: $${summary.btcPrice.toLocaleString()} — ${summary.winnerCount} winner(s)`,
        html,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Resend email failed:', err)
    } else {
      console.log('Admin email sent for', summary.gameDate)
    }
  } catch (err) {
    console.error('Failed to send admin email:', err)
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const now = new Date()
  const currentHour = now.getUTCHours()
  const currentMinute = now.getUTCMinutes()
  const todayStr = now.toISOString().split('T')[0]

  // Find any daily_results where target time has passed but actual_price is NULL
  const { data: pendingResults } = await supabase
    .from('daily_results')
    .select('game_date, target_hour, target_minute')
    .is('actual_price', null)
    .lte('game_date', todayStr)

  if (!pendingResults || pendingResults.length === 0) {
    return new Response(JSON.stringify({ message: 'No pending results' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Filter to only those where target time has actually passed
  const ready = pendingResults.filter(r => {
    if (r.game_date < todayStr) return true // Past days always ready
    // Same day: check if current time >= target time
    return currentHour > r.target_hour || (currentHour === r.target_hour && currentMinute >= r.target_minute)
  })

  if (ready.length === 0) {
    return new Response(JSON.stringify({ message: 'No results ready yet' }), {
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Fetch BTC price — median of 3 sources for fairness
  let btcPrice: number
  try {
    btcPrice = await fetchBtcPriceMedian()
  } catch (err) {
    console.error('Failed to fetch BTC price from all sources:', err)
    return new Response(JSON.stringify({ error: 'All price sources failed' }), { status: 500 })
  }

  const results: string[] = []

  for (const result of ready) {
    // Record the actual price
    const { error: updateError } = await supabase
      .from('daily_results')
      .update({ actual_price: btcPrice, recorded_at: now.toISOString() })
      .eq('game_date', result.game_date)

    if (updateError) {
      console.error(`Failed to update daily result for ${result.game_date}:`, updateError)
      continue
    }

    // Fetch all predictions for this game date
    const { data: predictions } = await supabase
      .from('predictions')
      .select('id, user_id, predicted_price')
      .eq('game_date', result.game_date)

    if (!predictions || predictions.length === 0) {
      results.push(`${result.game_date}: price recorded ($${btcPrice}), no predictions`)
      continue
    }

    // Find the best prediction per user
    const userBest = new Map<string, { id: number; predicted_price: number; diff: number; accuracy: number }>()

    for (const p of predictions) {
      const price = Number(p.predicted_price)
      const diff = Math.abs(price - btcPrice)
      const accuracy = Math.max(0, 1 - diff / btcPrice)

      const existing = userBest.get(p.user_id)
      if (!existing || diff < existing.diff) {
        userBest.set(p.user_id, { id: p.id, predicted_price: price, diff, accuracy })
      }
    }

    // Filter to winners (within $500)
    const winners = Array.from(userBest.entries())
      .filter(([, data]) => data.diff <= WIN_THRESHOLD)
      .map(([userId, data]) => ({
        user_id: userId,
        prediction_id: data.id,
        predicted_price: data.predicted_price,
        difference: data.diff,
        accuracy: data.accuracy,
      }))

    if (winners.length > 0) {
      const prizeShare = Number((DAILY_PRIZE_POOL / winners.length).toFixed(2))

      // Insert winners
      const winnerRows = winners.map(w => ({
        game_date: result.game_date,
        user_id: w.user_id,
        prediction_id: w.prediction_id,
        predicted_price: w.predicted_price,
        actual_price: btcPrice,
        difference: w.difference,
        accuracy: w.accuracy,
        prize_tier: w.difference <= 1 ? 'exact' : w.difference <= 100 ? 'within_100' : 'within_500',
        prize_share: prizeShare,
      }))

      const { error: winnersError } = await supabase.from('winners').insert(winnerRows)
      if (winnersError) {
        console.error(`Failed to insert winners for ${result.game_date}:`, winnersError)
      }
    }

    // Update streaks for all users who played this day
    const playerIds = [...new Set(predictions.map(p => p.user_id))]
    for (const playerId of playerIds) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_played_date, current_streak')
        .eq('id', playerId)
        .single()

      if (profile) {
        const yesterday = new Date(result.game_date)
        yesterday.setUTCDate(yesterday.getUTCDate() - 1)
        const yesterdayStr = yesterday.toISOString().split('T')[0]

        const newStreak = profile.last_played_date === yesterdayStr
          ? (profile.current_streak || 0) + 1
          : 1

        await supabase.from('profiles').update({
          current_streak: newStreak,
          last_played_date: result.game_date,
        }).eq('id', playerId)
      }
    }

    // Send admin email notification
    // Fetch winner emails from profiles for the summary
    const winnerDetails: DaySummary['winnerDetails'] = []
    if (winners.length > 0) {
      const winnerUserIds = winners.map(w => w.user_id)
      const { data: winnerProfiles } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', winnerUserIds)

      const emailMap = new Map(winnerProfiles?.map(p => [p.id, p.email]) ?? [])

      for (const w of winners) {
        const tier = w.difference <= 1 ? 'exact' : w.difference <= 100 ? 'within_100' : 'within_500'
        winnerDetails.push({
          email: emailMap.get(w.user_id) ?? 'unknown',
          predicted: w.predicted_price,
          diff: w.difference,
          tier,
          share: Number((DAILY_PRIZE_POOL / winners.length).toFixed(2)),
        })
      }
    }

    await sendAdminEmail({
      gameDate: result.game_date,
      btcPrice,
      totalPredictions: predictions.length,
      winnerCount: winners.length,
      totalPayout: winners.length > 0 ? DAILY_PRIZE_POOL : 0,
      closestDiff: winners.length > 0 ? Math.min(...winners.map(w => w.difference)) : null,
      winnerDetails,
    })

    results.push(`${result.game_date}: $${btcPrice}, ${winners.length} winner(s)`)
  }

  console.log('Processed results:', results)

  return new Response(JSON.stringify({ success: true, processed: results }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
