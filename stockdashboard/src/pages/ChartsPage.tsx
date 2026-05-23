import { useStore } from '../store/store'
import { CandlestickChart } from '../components/Chart/CandlestickChart'

export default function ChartsPage() {
  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const symbols = useStore(s => s.prices.symbols)
  const setActiveSymbol = useStore(s => s.setActiveSymbol)

  return (
    <div className="flex flex-col p-4" style={{ height: 'calc(100vh - 64px)' }}>
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="section-title mb-0">Advanced Charts</div>
        <div className="flex items-center gap-2">
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
      <div className="flex-1 min-h-0">
        <CandlestickChart />
      </div>
    </div>
  )
}