import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import type { Session } from '@supabase/supabase-js'

interface AuthUser {
  id: string
  email: string
  marketingConsent: boolean
  consentTimestamp: string | null
}

type AuthStatus = 'loading' | 'unauthenticated' | 'authenticated'

interface AuthContextValue {
  user: AuthUser | null
  status: AuthStatus
  signup: (email: string, marketingConsent: boolean, captchaToken: string) => Promise<{ error?: string }>
  logout: () => void
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

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
      // Fetch profile for marketing consent
      const { data: profile } = await supabase
        .from('profiles')
        .select('marketing_consent, consent_timestamp')
        .eq('id', session.user.id)
        .single()

      setUser({
        id: session.user.id,
        email: session.user.email || '',
        marketingConsent: profile?.marketing_consent || false,
        consentTimestamp: profile?.consent_timestamp || null,
      })

      setStatus('authenticated')
    } else {
      setUser(null)
      setStatus('unauthenticated')
    }
  }

  const signup = useCallback(async (email: string, marketingConsent: boolean, captchaToken: string): Promise<{ error?: string }> => {
    try {
      // Call the create-user Edge Function
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, marketingConsent, captchaToken }),
      })

      const data = await res.json()

      if (!res.ok) {
        return { error: data.error || 'Signup failed' }
      }

      // Use the token_hash to establish a session
      const { error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: data.token_hash,
        type: 'magiclink',
      })

      if (verifyError) {
        console.error('Session verification error:', verifyError.message)
        return { error: 'Failed to sign in. Please try again.' }
      }

      // Session will be picked up by onAuthStateChange listener
      return {}
    } catch (err) {
      console.error('Signup error:', err)
      return { error: 'Network error. Please try again.' }
    }
  }, [])

  const logout = useCallback(() => {
    supabase.auth.signOut()
    setUser(null)
    setStatus('unauthenticated')
    try {
      window.localStorage.removeItem('sd_day')
      window.localStorage.removeItem('sd_stats')
      window.localStorage.removeItem('sd_history')
    } catch { /* ignore */ }
  }, [])

  return (
    <AuthContext.Provider value={{ user, status, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
