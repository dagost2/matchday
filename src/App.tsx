import { HashRouter, Routes, Route, NavLink } from 'react-router-dom'
import HomePage from './pages/HomePage'
import MatchPage from './pages/MatchPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <div className="flex flex-col h-full max-w-lg mx-auto">
        <div className="flex-1 overflow-y-auto pb-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/match/:id" element={<MatchPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </div>
        <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-700 flex max-w-lg mx-auto">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm font-medium transition-colors ${
                isActive ? 'text-red-500' : 'text-zinc-400'
              }`
            }
          >
            ⚽ Fixture
          </NavLink>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex-1 py-3 text-center text-sm font-medium transition-colors ${
                isActive ? 'text-red-500' : 'text-zinc-400'
              }`
            }
          >
            👥 Squad
          </NavLink>
        </nav>
      </div>
    </HashRouter>
  )
}
