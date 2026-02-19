// Supabase Edge Function: send-announcement
// Purpose: Send marketing emails to users who opted in (marketing_consent = true)
// Auth: Requires ADMIN_SECRET header to prevent unauthorized use
// Usage: POST with { subject, html, previewText? }

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const FROM_EMAIL = 'Satoshi Daily <hello@satoshidaily.app>'
const BATCH_SIZE = 50 // Resend free tier: 100 emails/day, 2/second

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  try {
    // Verify admin secret — prevents anyone from triggering mass emails
    const adminSecret = req.headers.get('x-admin-secret')
    const expectedSecret = Deno.env.get('ADMIN_SECRET')

    if (!expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'ADMIN_SECRET not configured on server' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    if (adminSecret !== expectedSecret) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized — invalid admin secret' }),
        { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const resendKey = Deno.env.get('RESEND_API_KEY')
    if (!resendKey) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    const { subject, html, previewText, dryRun, testEmail } = await req.json()

    if (!subject || !html) {
      return new Response(
        JSON.stringify({ error: 'subject and html are required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // If testEmail is provided, only send to that one address (for previewing)
    let users: { id: string; email: string }[]

    if (testEmail) {
      users = [{ id: 'test', email: testEmail }]
    } else {
      // Fetch consented users
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, serviceKey)

      const { data: fetchedUsers, error: fetchError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('marketing_consent', true)

      if (fetchError) {
        return new Response(
          JSON.stringify({ error: 'Failed to fetch users', details: fetchError.message }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      if (!fetchedUsers || fetchedUsers.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No users with marketing consent', sent: 0 }),
          { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }

      users = fetchedUsers
    }

    // Dry run — just return the count without sending
    if (dryRun) {
      return new Response(
        JSON.stringify({
          dryRun: true,
          recipientCount: users.length,
          recipients: users.map(u => u.email),
          subject,
        }),
        { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Wrap HTML in a nice email template with unsubscribe footer
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${previewText ? `<meta name="x-apple-disable-message-reformatting"><!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]--><span style="display:none;font-size:1px;color:#ffffff;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">${previewText}</span>` : ''}
</head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:32px 20px;">
    <!-- Header -->
    <div style="text-align:center;margin-bottom:32px;">
      <h1 style="color:#f7931a;font-size:24px;margin:0;">Satoshi Daily</h1>
      <p style="color:#8b949e;font-size:13px;margin:4px 0 0;">The Daily Bitcoin Price Game</p>
    </div>

    <!-- Content -->
    <div style="background:#161b22;border:1px solid #30363d;border-radius:12px;padding:24px 20px;color:#e6edf3;">
      ${html}
    </div>

    <!-- Play CTA -->
    <div style="text-align:center;margin-top:24px;">
      <a href="https://satoshidaily.app" style="display:inline-block;padding:14px 32px;background:#f7931a;color:#fff;font-weight:700;font-size:16px;text-decoration:none;border-radius:8px;">Play Today's Round</a>
    </div>

    <!-- Footer -->
    <div style="text-align:center;margin-top:32px;padding-top:20px;border-top:1px solid #30363d;">
      <p style="color:#8b949e;font-size:11px;margin:0;">
        You're receiving this because you opted in to updates from Satoshi Daily.
      </p>
      <p style="color:#8b949e;font-size:11px;margin:8px 0 0;">
        <a href="https://satoshidaily.app" style="color:#58a6ff;text-decoration:none;">satoshidaily.app</a>
        &nbsp;·&nbsp;
        <a href="https://x.com/SatoshiDailyApp" style="color:#58a6ff;text-decoration:none;">@SatoshiDailyApp</a>
      </p>
      <p style="margin:12px 0 0;">
        <a href="${Deno.env.get('SUPABASE_URL')}/functions/v1/unsubscribe?email=%%EMAIL%%" style="color:#6e7681;font-size:10px;text-decoration:underline;">Unsubscribe</a>
      </p>
    </div>
  </div>
</body>
</html>`

    // Send emails in batches (Resend rate limit: ~2/second)
    let sent = 0
    let failed = 0
    const errors: { email: string; error: string }[] = []

    for (let i = 0; i < users.length; i += BATCH_SIZE) {
      const batch = users.slice(i, i + BATCH_SIZE)

      for (const user of batch) {
        try {
          const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: FROM_EMAIL,
              to: [user.email],
              subject,
              html: fullHtml.replace('%%EMAIL%%', encodeURIComponent(user.email)),
            }),
          })

          if (res.ok) {
            sent++
          } else {
            const errBody = await res.text()
            failed++
            errors.push({ email: user.email, error: errBody })
            console.error(`Failed to send to ${user.email}:`, errBody)
          }
        } catch (err) {
          failed++
          errors.push({ email: user.email, error: String(err) })
          console.error(`Error sending to ${user.email}:`, err)
        }

        // Rate limit: ~2 emails/second
        await delay(600)
      }
    }

    console.log(`Announcement sent: ${sent} delivered, ${failed} failed out of ${users.length} total`)

    return new Response(
      JSON.stringify({
        success: true,
        total: users.length,
        sent,
        failed,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('send-announcement error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
