import { useState } from 'react'
import { useStore } from '../store/useStore'

export default function SettingsPage() {
  const players = useStore((s) => s.players)
  const addPlayer = useStore((s) => s.addPlayer)
  const removePlayer = useStore((s) => s.removePlayer)
  const [newName, setNewName] = useState('')

  function handleAdd() {
    const name = newName.trim()
    if (!name) return
    addPlayer(name)
    setNewName('')
  }

  return (
    <div className="pt-4 px-4">
      <h1 className="text-2xl font-bold text-white mb-1">Squad</h1>
      <p className="text-sm text-zinc-400 mb-6">Wallabies U9 Girls — {players.length} players</p>

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          placeholder="Add player name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          className="flex-1 bg-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none border border-zinc-700 focus:border-red-500"
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="px-5 py-3 bg-red-600 text-white font-bold rounded-xl text-sm disabled:opacity-40 active:bg-red-700"
        >
          Add
        </button>
      </div>

      <div className="space-y-2">
        {[...players].sort((a, b) => (a.number ?? 999) - (b.number ?? 999)).map((p) => (
          <div key={p.id} className="flex items-center justify-between bg-zinc-800 rounded-xl px-4 py-3">
            <div className="flex items-center gap-3">
              {p.number !== undefined && (
                <span className="text-zinc-500 text-sm font-bold w-6 text-right">{p.number}</span>
              )}
              <span className="text-white font-medium">{p.name}</span>
            </div>
            <button
              onClick={() => removePlayer(p.id)}
              className="text-zinc-500 active:text-red-400 p-1 -mr-1"
              aria-label={`Remove ${p.name}`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
