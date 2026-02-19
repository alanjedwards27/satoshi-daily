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
import YesterdayRecap from '../components/game/YesterdayRecap'
import PastResults from '../components/game/PastResults'
import RecentPredictions from '../components/signup/RecentPredictions'
import PreviousWinners from '../components/signup/PreviousWinners'
import SponsorCard from '../components/shared/SponsorCard'
import { useGame } from '../context/GameContext'
import { useAuth } from '../context/AuthContext'
import { usePageView } from '../hooks/usePageView'

type Tab = 'my-results' | 'results' | 'players'

export default function GamePage() {
  usePageView('game')
  const { phase, dayData, canGuess, needsEmail, needsShare } = useGame()
  const { user } = useAuth()

  const [confirmed, setConfirmed] = useState(dayData.predictions.length > 0)
  const [activeTab, setActiveTab] = useState<Tab | null>(null)

  const showPredictionFlow = phase === 'predicting' && confirmed
  const isAnonLocked = phase === 'locked' && needsEmail

  // Build tabs based on auth state
  const tabs: { id: Tab; label: string; icon: string }[] = [
    ...(user ? [{ id: 'my-results' as Tab, label: 'My Results', icon: '📊' }] : []),
    { id: 'results', label: 'Past Results', icon: '📅' },
    { id: 'players', label: 'Players', icon: '👥' },
  ]

  return (
    <AppShell>
      <UserBar />
      {user && <StatsBar />}

      {/* Tab bar — right under header area */}
      <div style={{
        display: 'flex',
        gap: '4px',
        padding: '4px',
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(prev => prev === tab.id ? null : tab.id)}
            style={{
              flex: 1,
              padding: '10px 6px',
              background: activeTab === tab.id ? 'var(--bg-secondary)' : 'transparent',
              border: activeTab === tab.id ? '1px solid var(--border)' : '1px solid transparent',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              transition: 'all 0.15s',
            }}
          >
            <span style={{ fontSize: '12px' }}>{tab.icon}</span>
            <span style={{
              fontSize: '11px',
              fontWeight: activeTab === tab.id ? 700 : 500,
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              fontFamily: 'var(--font-body)',
            }}>
              {tab.label}
            </span>
            <span style={{
              fontSize: '9px',
              color: activeTab === tab.id ? 'var(--text-primary)' : 'var(--text-muted)',
              transition: 'transform 0.15s',
              transform: activeTab === tab.id ? 'rotate(180deg)' : 'rotate(0deg)',
              lineHeight: 1,
            }}>
              ▼
            </span>
          </button>
        ))}
      </div>

      {/* Tab content — no exit animation, just instant swap */}
      <AnimatePresence>
        {activeTab === 'my-results' && user && (
          <motion.div
            key="tab-my-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <YesterdayRecap />
          </motion.div>
        )}

        {activeTab === 'results' && (
          <motion.div
            key="tab-results"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
          >
            <PastResults />
          </motion.div>
        )}

        {activeTab === 'players' && (
          <motion.div
            key="tab-players"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <RecentPredictions />
            <PreviousWinners />
          </motion.div>
        )}
      </AnimatePresence>

      <TargetCard />

      <AnimatePresence mode="wait">
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
            {needsEmail && <EmailGate />}
            {needsShare && <BonusCard />}
          </motion.div>
        )}

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

        {phase === 'locked' && !needsEmail && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}
          >
            <GuessCounter />
            {needsShare && <BonusCard />}
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
            <Leaderboard />
          </motion.div>
        )}
      </AnimatePresence>

      <SponsorCard />
    </AppShell>
  )
}
