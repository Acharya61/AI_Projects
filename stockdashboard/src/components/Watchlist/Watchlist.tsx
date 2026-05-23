import { useStore } from '../../store/store'
import { SYMBOLS } from '../../lib/constants'
import { PriceChange } from '../Common/PriceChange'

export function Watchlist() {
  const ticks = useStore(s => s.prices.ticks)
  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const setActiveSymbol = useStore(s => s.setActiveSymbol)

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide px-3 py-2 border-b border-gray-800 shrink-0">
        Watchlist
      </h3>
      <div className="grid grid-cols-3 text-xs text-[var(--text-secondary)] px-3 py-1 border-b border-gray-800 shrink-0">
        <span>Symbol</span>
        <span className="text-right">Price</span>
        <span className="text-right">Change</span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {SYMBOLS.map(({ symbol, name }) => {
          const tick = ticks[symbol]
          const isActive = symbol === activeSymbol

          return (
            <button
              key={symbol}
              onClick={() => setActiveSymbol(symbol)}
              className={`w-full grid grid-cols-3 px-3 py-1.5 text-xs hover:bg-gray-800/30 text-left ${
                isActive ? 'bg-gray-800/50 border-l-2 border-[var(--yellow)]' : ''
              }`}
            >
              <div>
                <div className="font-semibold text-sm">{symbol}</div>
                <div className="text-[10px] text-[var(--text-secondary)] truncate">{name}</div>
              </div>
              <div className="text-right self-center font-medium">
                ${tick?.price.toFixed(2) ?? '—'}
              </div>
              <div className="text-right self-center">
                {tick && <PriceChange value={tick.changePercent} percent />}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
