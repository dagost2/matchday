import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { fixtures } from '../data/fixture'
import { useStore } from '../store/useStore'
import type { Fixture } from '../types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })
}

function ByeCard({ fixture }: { fixture: Fixture }) {
  return (
    <div className="mx-4 mb-3 rounded-xl bg-zinc-800/50 border border-zinc-700/50 p-4 opacity-50">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">{fixture.round}</span>
        <span className="text-xs text-zinc-500">{formatDate(fixture.date)}</span>
      </div>
      <p className="mt-1 text-zinc-500 font-medium">Bye week</p>
    </div>
  )
}

export default function HomePage() {
  const navigate = useNavigate()
  const results = useStore((s) => s.results)
  const activeMatch = useStore((s) => s.activeMatch)
  const resetMatch = useStore((s) => s.resetMatch)

  const [confirmResetId, setConfirmResetId] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]
  const nextFixture = fixtures.find((f) => !f.isBye && f.date >= today && !results[f.id])

  return (
    <div className="pt-4 pb-2">
      <div className="px-4 mb-5">
        <h1 className="text-2xl font-bold text-white">Wallabies</h1>
        <p className="text-sm text-zinc-400 mt-0.5">Essendon Royals U9 Girls</p>
      </div>

      {fixtures.map((fixture) => {
        if (fixture.isBye) return <ByeCard key={fixture.id} fixture={fixture} />

        const result = results[fixture.id]
        const isActive = activeMatch?.fixtureId === fixture.id
        const isNext = nextFixture?.id === fixture.id

        let statusBadge = null
        let cardBg = 'bg-zinc-800 border-zinc-700'

        if (result) {
          const won = result.goalsFor > result.goalsAgainst
          const drew = result.goalsFor === result.goalsAgainst
          cardBg = won ? 'bg-zinc-800 border-green-800' : drew ? 'bg-zinc-800 border-zinc-500' : 'bg-zinc-800 border-red-900'
          statusBadge = (
            <span className={`text-lg font-bold tabular-nums ${won ? 'text-green-400' : drew ? 'text-zinc-300' : 'text-red-400'}`}>
              {result.goalsFor} – {result.goalsAgainst}
            </span>
          )
        } else if (isActive) {
          cardBg = 'bg-zinc-800 border-red-600'
          statusBadge = <span className="text-xs font-semibold text-red-400 animate-pulse uppercase tracking-wider">Live</span>
        } else if (isNext) {
          cardBg = 'bg-zinc-800 border-red-700'
          statusBadge = <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Next</span>
        }

        return (
          <div
            key={fixture.id}
            onClick={() => navigate(`/match/${fixture.id}`)}
            className={`mx-4 mb-3 rounded-xl border p-4 cursor-pointer active:opacity-70 transition-opacity ${cardBg}`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">{fixture.round}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${fixture.isHome ? 'bg-red-900/50 text-red-300' : 'bg-zinc-700 text-zinc-300'}`}>
                    {fixture.isHome ? 'H' : 'A'}
                  </span>
                </div>
                <p className="text-white font-semibold text-base leading-tight truncate">{fixture.opponent}</p>
                <p className="text-zinc-400 text-xs mt-1 truncate">{fixture.venue}</p>
                <p className="text-zinc-500 text-xs mt-0.5">
                  {formatDate(fixture.date)}{fixture.time ? ` · ${fixture.time}` : ''}
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                {statusBadge}
                {result && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setConfirmResetId(fixture.id) }}
                    className="p-1.5 text-zinc-500 hover:text-zinc-300 active:text-white transition-colors"
                    aria-label="Reset result"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
                {!statusBadge && (
                  <svg className="w-4 h-4 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                )}
              </div>
            </div>
          </div>
        )
      })}
      <div className="h-4" />

      {confirmResetId && (() => {
        const f = fixtures.find((x) => x.id === confirmResetId)!
        const r = results[confirmResetId]
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
            <div className="bg-zinc-900 rounded-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-white mb-2">Clear result?</h3>
              <p className="text-zinc-400 text-sm mb-6">
                This will delete the recorded result ({r.goalsFor}–{r.goalsAgainst}) for {f.round} vs {f.opponent}.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmResetId(null)}
                  className="flex-1 py-3 border border-zinc-600 text-zinc-300 rounded-xl font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { resetMatch(confirmResetId); setConfirmResetId(null) }}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
