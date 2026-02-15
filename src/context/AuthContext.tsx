import { createContext, useContext, type ReactNode, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface AuthUser {
  email: string
  verified: boolean
  marketingConsent: boolean
  consentTimestamp: string | null
}

interface AuthContextValue {
  user: AuthUser | null
  signup: (email: string, marketingConsent: boolean) => void
  verify: (code: string) => boolean
  logout: () => void
}

const EMPTY_USER: AuthUser | null = null
const MOCK_CODE = '123456'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useLocalStorage<AuthUser | null>('sd_user', EMPTY_USER)

  const signup = useCallback((email: string, marketingConsent: boolean) => {
    setUser({
      email,
      verified: false,
      marketingConsent,
      consentTimestamp: marketingConsent ? new Date().toISOString() : null,
    })
  }, [setUser])

  const verify = useCallback((code: string): boolean => {
    if (code === MOCK_CODE) {
      setUser(prev => prev ? { ...prev, verified: true } : prev)
      return true
    }
    return false
  }, [setUser])

  const logout = useCallback(() => {
    setUser(EMPTY_USER)
    // Clear all game data so a fresh signup starts clean
    try {
      window.localStorage.removeItem('sd_day')
      window.localStorage.removeItem('sd_stats')
      window.localStorage.removeItem('sd_history')
    } catch {
      // ignore
    }
  }, [setUser])

  return (
    <AuthContext.Provider value={{ user, signup, verify, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
