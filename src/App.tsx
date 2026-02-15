import { AuthProvider, useAuth } from './context/AuthContext'
import { GameProvider } from './context/GameContext'
import SignupPage from './pages/SignupPage'
import VerifyPage from './pages/VerifyPage'
import GamePage from './pages/GamePage'

function Router() {
  const { user } = useAuth()

  if (!user || !user.email) return <SignupPage />
  if (!user.verified) return <VerifyPage />

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
