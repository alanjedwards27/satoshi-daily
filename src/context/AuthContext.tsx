import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  marketingConsent: boolean
  consentTimestamp: string | null
}

type AuthStatus = 'loading' | 'unauthenticated' | 'pending_magic_link' | 'authenticated'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  pendingEmail: string | null
  signup: (email: string, marketingConsent: boolean) => Promise<void>
  resendMagicLink: () => Promise<void>
  clearPending: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [pendingEmail, setPendingEmail] = useState<string | null>(() => {
    try {
      return window.localStorage.getItem('sd_pending_email')
    } catch {
      return null
    }
  })

  // Hydrate user from Supabase session on mount + listen for auth changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      handleSession(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSession(session)
    })

    return () => subscription.unsubscribe()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSession(session: Session | null) {
    if (session?.user) {
      try { window.localStorage.removeItem('sd_pending_email') } catch { /* ignore */ }
      setPendingEmail(null)

      // Fetch profile for marketing consent
      const { data: profile } = await supabase
        .from('profiles')
        .select('marketing_consent, consent_timestamp')
        .eq('id', session.user.id)
        .single()

      // Apply any pending marketing consent from before magic link
      const pendingConsent = window.localStorage.getItem('sd_pending_marketing')
      if (pendingConsent !== null) {
        const consent = pendingConsent === 'true'
        const timestamp = consent ? new Date().toISOString() : null
        await supabase.from('profiles').update({
          marketing_consent: consent,
          consent_timestamp: timestamp,
        }).eq('id', session.user.id)

        window.localStorage.removeItem('sd_pending_marketing')

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          marketingConsent: consent,
          consentTimestamp: timestamp,
        })
      } else {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          marketingConsent: profile?.marketing_consent || false,
          consentTimestamp: profile?.consent_timestamp || null,
        })
      }

      setStatus('authenticated')
    } else {
      setUser(null)
      const hasPending = !!window.localStorage.getItem('sd_pending_email')
      setStatus(hasPending ? 'pending_magic_link' : 'unauthenticated')
    }
  }

  const signup = useCallback(async (email: string, marketingConsent: boolean) => {
    try {
      window.localStorage.setItem('sd_pending_email', email)
      window.localStorage.setItem('sd_pending_marketing', String(marketingConsent))
    } catch { /* ignore */ }

    setPendingEmail(email)
    setStatus('pending_magic_link')

    const redirectUrl = window.location.origin + '/'

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectUrl },
    })

    if (error) {
      console.error('Magic link error:', error.message)
    }
  }, [])

  const resendMagicLink = useCallback(async () => {
    if (!pendingEmail) return
    const redirectUrl = window.location.origin + '/'
    await supabase.auth.signInWithOtp({
      email: pendingEmail,
      options: { emailRedirectTo: redirectUrl },
    })
  }, [pendingEmail])

  const clearPending = useCallback(() => {
    setPendingEmail(null)
    setStatus('unauthenticated')
    try {
      window.localStorage.removeItem('sd_pending_email')
      window.localStorage.removeItem('sd_pending_marketing')
    } catch { /* ignore */ }
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut()
    setUser(null)
    setStatus('unauthenticated')
    try {
      window.localStorage.removeItem('sd_day')
      window.localStorage.removeItem('sd_stats')
      window.localStorage.removeItem('sd_history')
      window.localStorage.removeItem('sd_pending_email')
      window.localStorage.removeItem('sd_pending_marketing')
    } catch { /* ignore */ }
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, pendingEmail, signup, resendMagicLink, clearPending, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
