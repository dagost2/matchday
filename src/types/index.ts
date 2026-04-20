export interface Fixture {
  id: string
  round: string
  date: string
  time: string
  opponent: string
  venue: string
  isHome: boolean
  isBye: boolean
}

export interface GoalEvent {
  half: 1 | 2
  minute: number
  scorerName: string
  isOwnGoal: boolean
  forUs: boolean
}

export interface MatchResult {
  fixtureId: string
  goalsFor: number
  goalsAgainst: number
  goalScorers: GoalEvent[]
  half1SecondsPlayed: number
  half2SecondsPlayed: number
  completedAt: string
}

export interface ActiveMatch {
  fixtureId: string
  half: 1 | 2
  halfStartedAt: number | null
  secondsElapsedBeforePause: number
  isPaused: boolean
  goalsFor: number
  goalsAgainst: number
  goalScorers: GoalEvent[]
  half1SecondsPlayed: number
}

export interface Player {
  id: string
  name: string
  number?: number
}
