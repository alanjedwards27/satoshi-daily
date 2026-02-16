import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AppShell from '../components/layout/AppShell'
import UserBar from '../components/game/UserBar'
import StatsBar from '../components/game/StatsBar'
import PrizeTiers from '../components/game/PrizeTiers'
import TargetCard from '../components/game/TargetCard'
import GuessCounter from '../components/game/GuessCounter'
import PredictionInput from '../components/game/PredictionInput'
import BonusCard from '../components/game/BonusCard'
import LockedState from '../components/game/LockedState'
import ShareCard from '../components/game/ShareCard'
import ResultCard from '../components/game/ResultCard'
import Leaderboard from '../components/game/Leaderboard'
import History from '../components/game/History'
import AdSlot from '../components/shared/AdSlot'
import { useGame } from '../context/GameContext'
import { usePageView } from '../hooks/usePageView'

export default function GamePage() {
  usePageView('game')
  const { phase, dayData } = useGame()
  const maxGuesses = dayData.bonusUnlocked ? 2 : 1
  const canGuess = dayData.predictions.length < maxGuesses
  const showBonus = dayData.predictions.length === 1 && !dayData.bonusUnlocked

  // Step 1: user must confirm they've seen the target before predicting
  // Skip confirmation if they've already made a prediction (returning for bonus guess)
  const [confirmed, setConfirmed] = useState(dayData.predictions.length > 0)

  const showPredictionFlow = phase === 'predicting' && confirmed

  return (
    <AppShell>
      <UserBar />
      <StatsBar />
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

        {/* Step 2: Prediction input */}
        {showPredictionFlow && (
          <motion.div
            key="predicting"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <GuessCounter />
            {canGuess && <PredictionInput />}
            {showBonus && <BonusCard />}
          </motion.div>
        )}

        {phase === 'locked' && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <GuessCounter />
            {showBonus && <BonusCard />}
            {canGuess && <PredictionInput />}
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
            {/* Ad between result and leaderboard — high-engagement moment */}
            <AdSlot slot="result-top" format="rectangle" label="Sponsored" />
            <Leaderboard />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ad between game area and secondary content */}
      <AdSlot slot="mid-page" format="banner" label="Sponsored" />

      <PrizeTiers />
      <History />

      {/* Bottom ad — always visible regardless of game phase */}
      <AdSlot slot="bottom" format="rectangle" label="Sponsored" />

      <div style={{ height: '32px' }} />
    </AppShell>
  )
}
