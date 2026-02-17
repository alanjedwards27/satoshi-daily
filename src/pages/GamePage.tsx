import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell'
import UserBar from '../components/game/UserBar'
import StatsBar from '../components/game/StatsBar'
import TargetCard from '../components/game/TargetCard'
import GuessCounter from '../components/game/GuessCounter'
import PredictionInput from '../components/game/PredictionInput'
import EmailGate from '../components/game/EmailGate'
import BonusCard from '../components/game/BonusCard'
import LockedState from '../components/game/LockedState'
import ShareCard from '../components/game/ShareCard'
import ResultCard from '../components/game/ResultCard'
import Leaderboard from '../components/game/Leaderboard'
import History from '../components/game/History'
import PastResults from '../components/game/PastResults'
import RecentPredictions from '../components/signup/RecentPredictions'
import PreviousWinners from '../components/signup/PreviousWinners'
import SponsorCard from '../components/shared/SponsorCard'
import { useGame } from '../context/GameContext'
import { useAuth } from '../context/AuthContext'
import { usePageView } from '../hooks/usePageView'

export default function GamePage() {
  usePageView('game')
  const { phase, dayData, canGuess, needsEmail, needsShare } = useGame()
  const { user } = useAuth()

  // Step 1: user must confirm they've seen the target before predicting
  // Skip confirmation if they've already made a prediction
  const [confirmed, setConfirmed] = useState(dayData.predictions.length > 0)

  const showPredictionFlow = phase === 'predicting' && confirmed

  // Is this an anonymous user who used their free guess and needs to sign up?
  const isAnonLocked = phase === 'locked' && needsEmail

  return (
    <AppShell>
      <UserBar />
      {user && <StatsBar />}
      <TargetCard />

      <AnimatePresence mode="wait">
        {/* Step 1: Confirm target — only show when predicting and not yet confirmed */}
        {phase === 'predicting' && !confirmed && (
          <motion.div
            key="confirm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setConfirmed(true)}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: 'var(--accent)',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 700,
                fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius-lg)',
                border: '2px solid var(--accent)',
                cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(247, 147, 26, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              🎯 I'm ready — make my prediction
            </motion.button>
          </motion.div>
        )}

        {/* Step 2: Prediction flow with inline gates */}
        {showPredictionFlow && (
          <motion.div
            key="predicting"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <GuessCounter />

            {/* Can make a guess right now */}
            {canGuess && <PredictionInput />}

            {/* Gate: needs email for 2nd guess */}
            {needsEmail && <EmailGate />}

            {/* Gate: needs share for 3rd guess */}
            {needsShare && <BonusCard />}
          </motion.div>
        )}

        {/* Anonymous user made their free guess — show locked prediction + email gate */}
        {isAnonLocked && (
          <motion.div
            key="anon-locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <GuessCounter />
            <LockedState />
            <EmailGate />
          </motion.div>
        )}

        {/* Fully locked — authenticated user used all guesses */}
        {phase === 'locked' && !needsEmail && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <GuessCounter />

            {/* Still need to share for 3rd guess */}
            {needsShare && <BonusCard />}

            {/* Can still make a guess (just unlocked via email or share) */}
            {canGuess && <PredictionInput />}

            {/* All guesses used — show locked state + share CTA */}
            {!canGuess && <LockedState />}
            {!canGuess && <ShareCard />}
          </motion.div>
        )}

        {phase === 'revealed' && (
          <motion.div
            key="revealed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <ResultCard />
            <Leaderboard />
          </motion.div>
        )}
      </AnimatePresence>

      <SponsorCard />

      <PastResults />
      <RecentPredictions />
      {user && <History />}
      <PreviousWinners />
    </AppShell>
  )
}
