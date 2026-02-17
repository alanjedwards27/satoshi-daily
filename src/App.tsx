import { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext'
import { GameProvider } from './context/GameContext'
import GamePage from './pages/GamePage'
import PrivacyPage from './pages/PrivacyPage'
import TermsPage from './pages/TermsPage'
import AppShell from './components/layout/AppShell'

function useHash() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    function onHashChange() {
      setHash(window.location.hash)
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return hash
}

function Router() {
  const { status } = useAuth()
  const hash = useHash()

  // Legal pages — accessible to everyone regardless of auth state
  if (hash === '#/privacy') return <PrivacyPage />
  if (hash === '#/terms') return <TermsPage />

  // Show loading state while checking session
  if (status === 'loading') {
    return (
      <AppShell>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          color: 'var(--text-muted)',
          fontSize: '14px',
        }}>
          Loading...
        </div>
      </AppShell>
    )
  }

  // Always show the game — auth gates are now inline (EmailGate after 1st guess)
  return (
    <GameProvider>
      <GamePage />
    </GameProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
