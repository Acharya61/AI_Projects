import { NavLink } from 'react-router-dom'
import { SYMBOLS, BASE_PRICES } from '../../lib/constants'

const links = [
  { to: '/', label: 'Dashboard', icon: '▣' },
  { to: '/trade', label: 'Trade', icon: '⇅' },
  { to: '/charts', label: 'Charts', icon: '⬡' },
  { to: '/markets', label: 'Markets', icon: '◉' },
  { to: '/news', label: 'News', icon: '◆' },
  { to: '/agent', label: 'AI Agent', icon: '◇' },
  { to: '/leaderboard', label: 'Leaderboard', icon: '⊞' },
  { to: '/profile', label: 'Profile', icon: '○' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/providers', label: 'Providers', icon: '⊡' },
]

export function Sidebar() {
  const top = SYMBOLS.slice(0, 3)
  return (
    <div className="w-44 shrink-0 bg-[var(--bg-secondary)] border-r border-[var(--border-dim)] flex flex-col overflow-hidden">
      <div className="h-10 flex items-center px-4 border-b border-[var(--border-dim)]">
        <span className="text-base font-bold text-[var(--yellow)] glow-yellow tracking-wider">STOCKDASH</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === '/'}
            className={({ isActive }) =>
              `sidebar-link${isActive ? ' active' : ''}`
            }
          >
            <span className="w-5 text-center text-xs opacity-60">{l.icon}</span>
            <span>{l.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-[var(--border-dim)] p-3 text-[10px] text-[var(--text-secondary)] space-y-1">
        {top.map(s => (
          <div key={s.symbol} className="flex justify-between">
            <span>{s.symbol}</span>
            <span className={BASE_PRICES[s.symbol] > 200 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
              ${BASE_PRICES[s.symbol].toFixed(2)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
