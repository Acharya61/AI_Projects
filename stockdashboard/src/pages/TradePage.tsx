import { useStore } from '../store/store'
import { OrderPanel } from '../components/Trading/OrderPanel'
import { OrderBook } from '../components/Trading/OrderBook'
import { TradeHistory } from '../components/Trading/TradeHistory'
import { PortfolioSummary } from '../components/Portfolio/PortfolioSummary'

export default function TradePage() {
  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const symbols = useStore(s => s.prices.symbols)
  const setActiveSymbol = useStore(s => s.setActiveSymbol)
  const activeMarket = useStore(s => s.prices.activeMarket)

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="section-title mb-0">Trade Terminal</div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
            {activeMarket}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">Symbol</span>
          <select
            value={activeSymbol}
            onChange={e => setActiveSymbol(e.target.value)}
            className="terminal-input text-xs py-1 px-2 w-28"
          >
            {symbols.map(s => (
              <option key={s.symbol} value={s.symbol}>{s.symbol}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <OrderPanel />
        <div className="space-y-4">
          <OrderBook />
          <PortfolioSummary />
        </div>
        <TradeHistory />
      </div>
    </div>
  )
}