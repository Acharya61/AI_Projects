const traders = [
  { rank: 1, name: 'quant_king', return_pct: 342.5, trades: 847, win_rate: 68, pnl: 342500 },
  { rank: 2, name: 'algo_trader', return_pct: 289.1, trades: 1234, win_rate: 62, pnl: 289100 },
  { rank: 3, name: 'moon_holder', return_pct: 156.8, trades: 56, win_rate: 81, pnl: 156800 },
  { rank: 4, name: 'scalp_master', return_pct: 98.4, trades: 5678, win_rate: 55, pnl: 98400 },
  { rank: 5, name: 'hodl_forever', return_pct: 45.2, trades: 23, win_rate: 74, pnl: 45200 },
  { rank: 6, name: 'bot_v3', return_pct: 12.7, trades: 1024, win_rate: 52, pnl: 12700 },
  { rank: 7, name: 'paper_hands', return_pct: -8.3, trades: 445, win_rate: 43, pnl: -8300 },
]

import { formatPrice } from '../data/currencies'

export default function LeaderboardPage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Leaderboard — Top Traders</div>
      <table className="terminal-table">
        <thead>
          <tr>
            <th className="w-10">#</th>
            <th>Trader</th>
            <th className="text-right">Return</th>
            <th className="text-right">Trades</th>
            <th className="text-right">Win Rate</th>
            <th className="text-right">P&L</th>
          </tr>
        </thead>
        <tbody>
          {traders.map(t => (
            <tr key={t.rank}>
              <td className="text-[var(--text-secondary)]">{t.rank}</td>
              <td>
                <span className={t.rank <= 3 ? 'glow-yellow text-[var(--yellow)]' : ''}>{t.name}</span>
              </td>
              <td className={`text-right ${t.return_pct >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {t.return_pct >= 0 ? '+' : ''}{t.return_pct}%
              </td>
              <td className="text-right text-[var(--text-secondary)]">{t.trades.toLocaleString()}</td>
              <td className={`text-right ${t.win_rate >= 60 ? 'text-[var(--green)]' : t.win_rate >= 50 ? 'text-[var(--yellow)]' : 'text-[var(--red)]'}`}>
                {t.win_rate}%
              </td>
              <td className={`text-right ${t.pnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {formatPrice(t.pnl, 'USD')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
