import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActiveMatch, GoalEvent, MatchResult, Player } from '../types'

const DEFAULT_PLAYERS: Player[] = [
  'Mietta', 'Giulia', 'Harriet', 'Sarina', 'Ella',
  'Mila', 'Ariana', 'Ava', 'Sofia', 'Zara', 'Meika',
].map((name) => ({ id: name.toLowerCase(), name }))

interface Store {
  players: Player[]
  results: Record<string, MatchResult>
  activeMatch: ActiveMatch | null

  addPlayer: (name: string) => void
  removePlayer: (id: string) => void

  startMatch: (fixtureId: string) => void
  startTimer: () => void
  pauseTimer: () => void
  addGoal: (forUs: boolean, scorerName: string, isOwnGoal: boolean) => void
  removeLastGoal: (forUs: boolean) => void
  endHalf: () => void
  startSecondHalf: () => void
  endMatch: () => void
  resetMatch: (fixtureId: string) => void

  getSecondsElapsed: () => number
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      players: DEFAULT_PLAYERS,
      results: {},
      activeMatch: null,

      addPlayer: (name) => {
        const id = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now()
        set((s) => ({ players: [...s.players, { id, name }] }))
      },

      removePlayer: (id) => {
        set((s) => ({ players: s.players.filter((p) => p.id !== id) }))
      },

      startMatch: (fixtureId) => {
        set({
          activeMatch: {
            fixtureId,
            half: 1,
            halfStartedAt: null,
            secondsElapsedBeforePause: 0,
            isPaused: true,
            goalsFor: 0,
            goalsAgainst: 0,
            goalScorers: [],
            half1SecondsPlayed: 0,
          },
        })
      },

      startTimer: () => {
        set((s) => {
          if (!s.activeMatch) return {}
          return {
            activeMatch: {
              ...s.activeMatch,
              halfStartedAt: Date.now(),
              isPaused: false,
            },
          }
        })
      },

      pauseTimer: () => {
        set((s) => {
          if (!s.activeMatch) return {}
          const elapsed = get().getSecondsElapsed()
          return {
            activeMatch: {
              ...s.activeMatch,
              secondsElapsedBeforePause: elapsed,
              halfStartedAt: null,
              isPaused: true,
            },
          }
        })
      },

      addGoal: (forUs, scorerName, isOwnGoal) => {
        set((s) => {
          if (!s.activeMatch) return {}
          const elapsed = get().getSecondsElapsed()
          const minute = Math.floor(elapsed / 60) + 1
          const event: GoalEvent = {
            half: s.activeMatch.half,
            minute,
            scorerName,
            isOwnGoal,
            forUs,
          }
          return {
            activeMatch: {
              ...s.activeMatch,
              goalsFor: forUs ? s.activeMatch.goalsFor + 1 : s.activeMatch.goalsFor,
              goalsAgainst: forUs ? s.activeMatch.goalsAgainst : s.activeMatch.goalsAgainst + 1,
              goalScorers: [...s.activeMatch.goalScorers, event],
            },
          }
        })
      },

      removeLastGoal: (forUs) => {
        set((s) => {
          if (!s.activeMatch) return {}
          const scorers = [...s.activeMatch.goalScorers]
          const half = s.activeMatch.half
          const match = scorers
            .map((g, i) => ({ g, i }))
            .filter(({ g }) => g.forUs === forUs && g.half === half)
            .pop()
          if (!match) return {}
          scorers.splice(match.i, 1)
          return {
            activeMatch: {
              ...s.activeMatch,
              goalsFor: forUs ? s.activeMatch.goalsFor - 1 : s.activeMatch.goalsFor,
              goalsAgainst: forUs ? s.activeMatch.goalsAgainst : s.activeMatch.goalsAgainst - 1,
              goalScorers: scorers,
            },
          }
        })
      },

      endHalf: () => {
        set((s) => {
          if (!s.activeMatch) return {}
          const elapsed = get().getSecondsElapsed()
          return {
            activeMatch: {
              ...s.activeMatch,
              half1SecondsPlayed: elapsed,
              secondsElapsedBeforePause: elapsed,
              halfStartedAt: null,
              isPaused: true,
            },
          }
        })
      },

      startSecondHalf: () => {
        set((s) => {
          if (!s.activeMatch) return {}
          return {
            activeMatch: {
              ...s.activeMatch,
              half: 2,
              halfStartedAt: Date.now(),
              secondsElapsedBeforePause: 0,
              isPaused: false,
            },
          }
        })
      },

      endMatch: () => {
        const am = get().activeMatch
        if (!am) return
        const elapsed = get().getSecondsElapsed()
        const result: MatchResult = {
          fixtureId: am.fixtureId,
          goalsFor: am.goalsFor,
          goalsAgainst: am.goalsAgainst,
          goalScorers: am.goalScorers,
          half1SecondsPlayed: am.half1SecondsPlayed,
          half2SecondsPlayed: elapsed,
          completedAt: new Date().toISOString(),
        }
        set((s) => ({
          activeMatch: null,
          results: { ...s.results, [am.fixtureId]: result },
        }))
      },

      resetMatch: (fixtureId) => {
        set((s) => {
          const results = { ...s.results }
          delete results[fixtureId]
          return { results, activeMatch: null }
        })
      },

      getSecondsElapsed: () => {
        const am = get().activeMatch
        if (!am) return 0
        if (am.isPaused || am.halfStartedAt === null) {
          return am.secondsElapsedBeforePause
        }
        return am.secondsElapsedBeforePause + Math.floor((Date.now() - am.halfStartedAt) / 1000)
      },
    }),
    { name: 'matchday-store' }
  )
)
