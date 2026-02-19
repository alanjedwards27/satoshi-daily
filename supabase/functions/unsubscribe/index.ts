// Supabase Edge Function: unsubscribe
// Purpose: One-click email unsubscribe — sets marketing_consent = false
// Usage: GET /unsubscribe?email=user@example.com

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const email = url.searchParams.get('email')

  if (!email) {
    return new Response(htmlPage('Missing email', 'No email address was provided.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    const { error } = await supabase
      .from('profiles')
      .update({
        marketing_consent: false,
        consent_timestamp: new Date().toISOString(),
      })
      .eq('email', email.toLowerCase())

    if (error) {
      console.error('Unsubscribe error:', error)
      return new Response(htmlPage('Something went wrong', 'Please try again or contact us on X @SatoshiDailyApp.'), {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      })
    }

    return new Response(htmlPage('Unsubscribed', "You've been removed from our mailing list. You can still play at satoshidaily.app anytime."), {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  } catch (err) {
    console.error('Unsubscribe error:', err)
    return new Response(htmlPage('Something went wrong', 'Please try again later.'), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }
})

function htmlPage(title: string, message: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Satoshi Daily</title>
</head>
<body style="margin:0;padding:0;background-color:#0d1117;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="text-align:center;padding:40px 20px;max-width:400px;">
    <h1 style="color:#f7931a;font-size:24px;margin:0 0 8px;">Satoshi Daily</h1>
    <h2 style="color:#e6edf3;font-size:18px;margin:0 0 16px;">${title}</h2>
    <p style="color:#8b949e;font-size:14px;line-height:1.6;margin:0 0 24px;">${message}</p>
    <a href="https://satoshidaily.app" style="display:inline-block;padding:12px 24px;background:#f7931a;color:#fff;font-weight:700;font-size:14px;text-decoration:none;border-radius:8px;">Back to Satoshi Daily</a>
  </div>
</body>
</html>`
}
