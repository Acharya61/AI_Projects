import { useStore } from '../../store/store'
import { SYMBOLS } from '../../lib/constants'

export function MarketOverview() {
  const ticks = useStore(s => s.prices.ticks)

  const sorted = [...SYMBOLS]
    .map(s => ({ ...s, tick: ticks[s.symbol] }))
    .filter(s => s.tick)
    .sort((a, b) => Math.abs(b.tick!.changePercent) - Math.abs(a.tick!.changePercent))

  const gainers = sorted.filter(s => s.tick!.changePercent >= 0).slice(0, 3)
  const losers = sorted.filter(s => s.tick!.changePercent < 0).slice(0, 3)

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Market Movers</h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <div className="text-xs text-[var(--green)] font-medium mb-1">Top Gainers</div>
          {gainers.map(g => (
            <div key={g.symbol} className="flex justify-between text-xs py-0.5">
              <span className="font-medium">{g.symbol}</span>
              <span className="text-[var(--green)]">+{g.tick!.changePercent.toFixed(2)}%</span>
            </div>
          ))}
          {gainers.length === 0 && <div className="text-xs text-[var(--text-secondary)]">—</div>}
        </div>
        <div>
          <div className="text-xs text-[var(--red)] font-medium mb-1">Top Losers</div>
          {losers.map(l => (
            <div key={l.symbol} className="flex justify-between text-xs py-0.5">
              <span className="font-medium">{l.symbol}</span>
              <span className="text-[var(--red)]">{l.tick!.changePercent.toFixed(2)}%</span>
            </div>
          ))}
          {losers.length === 0 && <div className="text-xs text-[var(--text-secondary)]">—</div>}
        </div>
      </div>
    </div>
  )
}
