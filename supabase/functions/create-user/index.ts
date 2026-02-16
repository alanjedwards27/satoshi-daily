// Supabase Edge Function: create-user
// Purpose: Create auto-confirmed users with captcha verification (no email verification needed)
// Called from browser signup form

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function verifyCaptcha(token: string, secretKey: string): Promise<boolean> {
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })
    const data = await res.json()
    return data.success === true
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: CORS_HEADERS })
  }

  try {
    const { email, marketingConsent, captchaToken } = await req.json()

    if (!email || !captchaToken) {
      return new Response(
        JSON.stringify({ error: 'Email and captcha token are required' }),
        { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Verify captcha
    const turnstileSecret = Deno.env.get('TURNSTILE_SECRET_KEY')!
    const captchaValid = await verifyCaptcha(captchaToken, turnstileSecret)

    if (!captchaValid) {
      return new Response(
        JSON.stringify({ error: 'Captcha verification failed' }),
        { status: 403, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase admin client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Try to create the user first — if they already exist, createUser will fail
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: email.toLowerCase(),
      password: crypto.randomUUID(),
      email_confirm: true,
    })

    let isExisting = false

    if (createError) {
      // User already exists — this is a returning user logging back in
      if (createError.message?.includes('already been registered') ||
          createError.message?.includes('already exists') ||
          createError.status === 422) {
        isExisting = true
      } else {
        return new Response(
          JSON.stringify({ error: createError.message || 'Failed to create user' }),
          { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (!isExisting && newUser?.user) {
      // New user — wait briefly for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500))

      // Update marketing consent in profiles
      await supabase.from('profiles').update({
        marketing_consent: !!marketingConsent,
        consent_timestamp: marketingConsent ? new Date().toISOString() : null,
      }).eq('id', newUser.user.id)
    }

    // Generate a magic link token to establish a session (works for both new and existing)
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: email.toLowerCase(),
    })

    if (linkError || !linkData) {
      return new Response(
        JSON.stringify({ error: linkError?.message || 'Failed to generate session' }),
        { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
      )
    }

    // Update marketing consent for returning users (generateLink returns user data)
    if (isExisting && linkData.user?.id) {
      await supabase.from('profiles').update({
        marketing_consent: !!marketingConsent,
        consent_timestamp: marketingConsent ? new Date().toISOString() : null,
      }).eq('id', linkData.user.id)
    }

    const tokenHash = linkData.properties?.hashed_token

    return new Response(
      JSON.stringify({
        token_hash: tokenHash,
        email: email.toLowerCase(),
        existing: isExisting,
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )

  } catch (err) {
    console.error('create-user error:', err)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } }
    )
  }
})
