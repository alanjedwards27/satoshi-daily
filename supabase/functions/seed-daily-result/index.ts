// Supabase Edge Function: seed-daily-result
// Schedule: runs daily at 00:01 UTC via pg_cron
// Purpose: pre-create tomorrow's daily_results row with the target time

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function hashCode(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0 // Convert to 32bit integer
  }
  return hash
}

function getTargetTimeForDate(dateStr: string): { hours: number; minutes: number } {
  const seed = hashCode(dateStr + 'satoshi')
  const hours = (Math.abs(seed) % 18) + 3 // 03:00 - 20:59 UTC
  const minutes = Math.abs((seed * 31) % 60)
  return { hours, minutes }
}

Deno.serve(async (req) => {
  // Only allow POST from cron / service role
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  // Seed today + tomorrow (safety net: if yesterday's cron missed, today still gets created)
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]
  const tomorrow = new Date(now)
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const seeded: string[] = []

  for (const dateStr of [todayStr, tomorrowStr]) {
    const { hours, minutes } = getTargetTimeForDate(dateStr)

    const { error } = await supabase.from('daily_results').upsert({
      game_date: dateStr,
      target_hour: hours,
      target_minute: minutes,
    }, { onConflict: 'game_date' })

    if (error) {
      console.error(`Failed to seed ${dateStr}:`, error)
    } else {
      seeded.push(`${dateStr} @ ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')} UTC`)
    }
  }

  console.log('Seeded daily results:', seeded)

  return new Response(JSON.stringify({ success: true, seeded }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
