import type { GoalEvent, MatchResult } from '../types'

function fmtTime(seconds: number) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface Props {
  result: MatchResult
  opponent: string
  onEdit: () => void
}

function GoalList({ goals, label }: { goals: GoalEvent[]; label: string }) {
  if (goals.length === 0) return null
  return (
    <div className="mb-3">
      <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">{label}</p>
      {goals.map((g, i) => (
        <p key={i} className="text-sm text-zinc-300 leading-relaxed">
          {g.isOwnGoal ? '(OG) ' : ''}{g.scorerName} <span className="text-zinc-500">{g.minute}'</span>
        </p>
      ))}
    </div>
  )
}

export default function MatchSummary({ result, opponent, onEdit }: Props) {
  const ourGoals = result.goalScorers.filter((g) => g.forUs)
  const won = result.goalsFor > result.goalsAgainst
  const drew = result.goalsFor === result.goalsAgainst

  const outcomeColor = won ? 'text-green-400' : drew ? 'text-zinc-300' : 'text-red-400'
  const outcomeLabel = won ? 'Win' : drew ? 'Draw' : 'Loss'

  return (
    <div className="px-4">
      <div className="bg-zinc-800 rounded-2xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-center flex-1">
            <p className="text-xs text-zinc-400 mb-1">Wallabies</p>
            <p className="text-5xl font-bold text-white tabular-nums">{result.goalsFor}</p>
          </div>
          <div className="px-4">
            <p className={`text-lg font-bold ${outcomeColor}`}>{outcomeLabel}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs text-zinc-400 mb-1">{opponent}</p>
            <p className="text-5xl font-bold text-white tabular-nums">{result.goalsAgainst}</p>
          </div>
        </div>

        <div className="border-t border-zinc-700 pt-3 space-y-1">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>1st half: {fmtTime(result.half1SecondsPlayed)}</span>
            <span>2nd half: {fmtTime(result.half2SecondsPlayed)}</span>
          </div>
        </div>
      </div>

      {ourGoals.length > 0 && (
        <div className="bg-zinc-800 rounded-2xl p-4 mb-4">
          <p className="text-sm font-semibold text-zinc-300 mb-3">Goal Scorers</p>
          <GoalList goals={ourGoals.filter((g) => g.half === 1)} label="1st Half" />
          <GoalList goals={ourGoals.filter((g) => g.half === 2)} label="2nd Half" />
        </div>
      )}

      <button
        onClick={onEdit}
        className="w-full py-3 border border-zinc-600 text-zinc-300 font-medium rounded-2xl text-sm"
      >
        Edit Result
      </button>
    </div>
  )
}
