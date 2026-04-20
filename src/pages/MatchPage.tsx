import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { fixtures } from '../data/fixture'
import { useStore } from '../store/useStore'
import GoalScorerModal from '../components/GoalScorerModal'
import MatchSummary from '../components/MatchSummary'

const HALF_DURATION = 20 * 60

function fmtTimer(seconds: number) {
  const capped = Math.max(0, seconds)
  const m = Math.floor(capped / 60)
  const s = capped % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long' })
}

export default function MatchPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const fixture = fixtures.find((f) => f.id === id)

  const activeMatch = useStore((s) => s.activeMatch)
  const result = useStore((s) => id ? s.results[id] : undefined)
  const startMatch = useStore((s) => s.startMatch)
  const startTimer = useStore((s) => s.startTimer)
  const pauseTimer = useStore((s) => s.pauseTimer)
  const addGoal = useStore((s) => s.addGoal)
  const endHalf = useStore((s) => s.endHalf)
  const startSecondHalf = useStore((s) => s.startSecondHalf)
  const endMatch = useStore((s) => s.endMatch)
  const resetMatch = useStore((s) => s.resetMatch)
  const getSecondsElapsed = useStore((s) => s.getSecondsElapsed)

  const [displaySeconds, setDisplaySeconds] = useState(0)
  const [showScorerModal, setShowScorerModal] = useState(false)
  const [showEndConfirm, setShowEndConfirm] = useState(false)
  const [showHalfTime, setShowHalfTime] = useState(false)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const isActiveForThisMatch = activeMatch?.fixtureId === id

  useEffect(() => {
    function tick() {
      setDisplaySeconds(getSecondsElapsed())
    }
    tick()
    intervalRef.current = setInterval(tick, 500)
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [getSecondsElapsed, isActiveForThisMatch])

  if (!fixture) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-400">
        Match not found
      </div>
    )
  }

  if (result && !isActiveForThisMatch) {
    return (
      <div className="pt-4">
        <div className="flex items-center gap-3 px-4 mb-5">
          <button onClick={() => navigate('/')} className="text-zinc-400 p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">{fixture.round}</p>
            <h1 className="text-xl font-bold text-white">vs {fixture.opponent}</h1>
          </div>
        </div>
        <MatchSummary
          result={result}
          opponent={fixture.opponent}
          onEdit={() => {
            resetMatch(fixture.id)
            startMatch(fixture.id)
          }}
        />
      </div>
    )
  }

  if (!isActiveForThisMatch) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 pt-4 mb-5">
          <button onClick={() => navigate('/')} className="text-zinc-400 p-1 -ml-1">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-zinc-400 uppercase tracking-wider">{fixture.round}</p>
            <h1 className="text-xl font-bold text-white">vs {fixture.opponent}</h1>
          </div>
        </div>

        <div className="px-4 flex-1">
          <div className="bg-zinc-800 rounded-2xl p-5 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className={`text-xs px-2 py-0.5 rounded font-semibold ${fixture.isHome ? 'bg-red-900/60 text-red-300' : 'bg-zinc-700 text-zinc-300'}`}>
                {fixture.isHome ? 'Home' : 'Away'}
              </span>
            </div>
            <p className="text-zinc-300 text-sm">{formatDate(fixture.date)}</p>
            {fixture.time && <p className="text-white font-semibold text-lg">{fixture.time}</p>}
            <p className="text-zinc-400 text-sm mt-2">{fixture.venue}</p>
          </div>

          <button
            onClick={() => { startMatch(fixture.id); startTimer() }}
            className="w-full py-5 bg-red-600 text-white font-bold text-xl rounded-2xl active:bg-red-700 transition-colors"
          >
            Start 1st Half ▶
          </button>
        </div>
      </div>
    )
  }

  const am = activeMatch!
  const isOvertime = displaySeconds > HALF_DURATION
  const timerColor = isOvertime ? 'text-amber-400' : 'text-white'

  if (showHalfTime) {
    const h1Goals = am.goalScorers.filter((g) => g.half === 1 && g.forUs)
    return (
      <div className="flex flex-col h-full px-4 pt-6">
        <h2 className="text-2xl font-bold text-white text-center mb-2">Half Time</h2>
        <div className="flex justify-center items-center gap-6 my-6">
          <div className="text-center">
            <p className="text-xs text-zinc-400 mb-1">Wallabies</p>
            <p className="text-6xl font-bold text-white">{am.goalsFor}</p>
          </div>
          <p className="text-3xl text-zinc-500 font-light">–</p>
          <div className="text-center">
            <p className="text-xs text-zinc-400 mb-1">{fixture.opponent}</p>
            <p className="text-6xl font-bold text-white">{am.goalsAgainst}</p>
          </div>
        </div>

        {h1Goals.length > 0 && (
          <div className="bg-zinc-800 rounded-xl p-4 mb-6">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">1st Half Scorers</p>
            {h1Goals.map((g, i) => (
              <p key={i} className="text-sm text-zinc-300">{g.scorerName} {g.minute}'</p>
            ))}
          </div>
        )}

        <button
          onClick={() => { setShowHalfTime(false); startSecondHalf() }}
          className="w-full py-5 bg-red-600 text-white font-bold text-xl rounded-2xl active:bg-red-700 mt-auto mb-4"
        >
          Start 2nd Half ▶
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full select-none">
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button onClick={() => navigate('/')} className="text-zinc-400 p-1 -ml-1">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="text-center">
          <p className="text-xs text-zinc-400">{fixture.round} · {am.half === 1 ? '1st Half' : '2nd Half'}</p>
          <p className="text-sm font-semibold text-zinc-300">vs {fixture.opponent}</p>
        </div>
        <button
          onClick={() => am.isPaused ? startTimer() : pauseTimer()}
          className="text-zinc-400 p-1"
        >
          {am.isPaused ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          )}
        </button>
      </div>

      <div className={`text-center py-3 ${timerColor}`}>
        <p className="text-6xl font-mono font-bold tracking-tight">{fmtTimer(displaySeconds)}</p>
        {isOvertime && <p className="text-xs text-amber-400 mt-1">Injury time</p>}
        {am.isPaused && !isOvertime && <p className="text-xs text-zinc-500 mt-1">Paused</p>}
      </div>

      <div className="flex items-stretch gap-4 px-4 flex-1 pb-4">
        <div className="flex flex-col flex-1 gap-3">
          <p className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">Wallabies</p>
          <p className="text-center text-7xl font-bold text-white tabular-nums leading-none">{am.goalsFor}</p>
          <button
            onClick={() => setShowScorerModal(true)}
            className="flex-1 bg-red-600 text-white text-5xl font-bold rounded-2xl flex items-center justify-center active:bg-red-700 transition-colors min-h-[100px]"
          >
            +
          </button>
        </div>

        <div className="w-px bg-zinc-700 self-stretch my-2" />

        <div className="flex flex-col flex-1 gap-3">
          <p className="text-center text-xs font-semibold text-zinc-400 uppercase tracking-wider">{fixture.opponent}</p>
          <p className="text-center text-7xl font-bold text-white tabular-nums leading-none">{am.goalsAgainst}</p>
          <button
            onClick={() => addGoal(false, 'Unknown', false)}
            className="flex-1 bg-zinc-700 text-white text-5xl font-bold rounded-2xl flex items-center justify-center active:bg-zinc-600 transition-colors min-h-[100px]"
          >
            +
          </button>
        </div>
      </div>

      <div className="px-4 pb-6 space-y-3">
        {am.goalScorers.filter((g) => g.half === am.half && g.forUs).length > 0 && (
          <div className="bg-zinc-800/70 rounded-xl px-3 py-2">
            {am.goalScorers
              .filter((g) => g.half === am.half && g.forUs)
              .map((g, i) => (
                <p key={i} className="text-xs text-zinc-400">{g.isOwnGoal ? '(OG) ' : ''}{g.scorerName} {g.minute}'</p>
              ))}
          </div>
        )}

        {am.half === 1 ? (
          <button
            onClick={() => { endHalf(); setShowHalfTime(true) }}
            className="w-full py-4 bg-zinc-700 text-white font-bold rounded-2xl text-base active:bg-zinc-600"
          >
            End 1st Half
          </button>
        ) : (
          <button
            onClick={() => setShowEndConfirm(true)}
            className="w-full py-4 bg-zinc-700 text-white font-bold rounded-2xl text-base active:bg-zinc-600"
          >
            End Match
          </button>
        )}
      </div>

      {showScorerModal && (
        <GoalScorerModal
          onConfirm={(name, isOwnGoal) => {
            addGoal(true, name, isOwnGoal)
            setShowScorerModal(false)
          }}
          onCancel={() => setShowScorerModal(false)}
        />
      )}

      {showEndConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-white mb-2">End Match?</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Final score: Wallabies {am.goalsFor} – {am.goalsAgainst} {fixture.opponent}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndConfirm(false)}
                className="flex-1 py-3 border border-zinc-600 text-zinc-300 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowEndConfirm(false); endMatch(); navigate('/') }}
                className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
