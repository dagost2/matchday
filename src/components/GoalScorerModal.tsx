import { useState } from 'react'
import { useStore } from '../store/useStore'

interface Props {
  onConfirm: (name: string, isOwnGoal: boolean) => void
  onCancel: () => void
}

export default function GoalScorerModal({ onConfirm, onCancel }: Props) {
  const players = useStore((s) => s.players)
  const [selected, setSelected] = useState<string | null>(null)
  const [isOwnGoal, setIsOwnGoal] = useState(false)
  const [customName, setCustomName] = useState('')
  const [showCustom, setShowCustom] = useState(false)

  function confirm() {
    const name = showCustom ? customName.trim() : selected
    if (!name) return
    onConfirm(name, isOwnGoal)
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60" onClick={onCancel}>
      <div
        className="bg-zinc-900 rounded-t-2xl p-4 pb-8 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-zinc-600 rounded-full mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-3">Who scored?</h2>

        <div className="overflow-y-auto flex-1 mb-4">
          <div className="grid grid-cols-2 gap-2">
            {[...players].sort((a, b) => (a.number ?? 999) - (b.number ?? 999)).map((p) => (
              <button
                key={p.id}
                onClick={() => { setSelected(p.name); setShowCustom(false) }}
                className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors text-left flex items-center gap-2 ${
                  selected === p.name && !showCustom
                    ? 'bg-red-600 text-white'
                    : 'bg-zinc-800 text-zinc-200'
                }`}
              >
                {p.number !== undefined && (
                  <span className={`text-xs font-bold w-6 text-right shrink-0 ${selected === p.name && !showCustom ? 'text-red-200' : 'text-zinc-500'}`}>
                    {p.number}
                  </span>
                )}
                {p.name}
              </button>
            ))}
            <button
              onClick={() => { setShowCustom(true); setSelected(null) }}
              className={`py-3 px-4 rounded-xl text-sm font-semibold transition-colors text-left ${
                showCustom ? 'bg-red-600 text-white' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Other…
            </button>
          </div>

          {showCustom && (
            <input
              type="text"
              autoFocus
              placeholder="Player name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="mt-3 w-full bg-zinc-800 text-white rounded-xl px-4 py-3 text-sm outline-none border border-zinc-600 focus:border-red-500"
            />
          )}
        </div>

        <label className="flex items-center gap-3 mb-4 cursor-pointer">
          <div
            onClick={() => setIsOwnGoal(!isOwnGoal)}
            className={`w-11 h-6 rounded-full transition-colors relative ${isOwnGoal ? 'bg-red-600' : 'bg-zinc-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isOwnGoal ? 'translate-x-5.5 left-0.5' : 'left-0.5'}`} />
          </div>
          <span className="text-sm text-zinc-300">Own goal</span>
        </label>

        <button
          onClick={confirm}
          disabled={!selected && !(showCustom && customName.trim())}
          className="w-full py-4 bg-red-600 text-white font-bold rounded-2xl text-base disabled:opacity-40 disabled:cursor-not-allowed active:bg-red-700 transition-colors"
        >
          Record Goal
        </button>
        <button
          onClick={onCancel}
          className="w-full py-3 text-zinc-400 font-medium text-sm mt-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
