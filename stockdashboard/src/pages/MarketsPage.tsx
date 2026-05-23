import { useStore } from '../store/store'
import { EXCHANGE_STOCKS } from '../data/markets'
import { formatPrice } from '../data/currencies'

const MARKET_TZ: Record<string, string> = {
  NYSE: 'America/New_York', NASDAQ: 'America/New_York', LSE: 'Europe/London',
  NSE: 'Asia/Kolkata', TSE: 'Asia/Tokyo', HKEX: 'Asia/Hong_Kong',
  EURONEXT: 'Europe/Paris',
}

const MARKET_OPEN: Record<string, string> = {
  NYSE: '09:30', NASDAQ: '09:30', LSE: '08:00',
  NSE: '09:15', TSE: '09:00', HKEX: '09:30',
  EURONEXT: '09:00',
}

const MARKET_CLOSE: Record<string, string> = {
  NYSE: '16:00', NASDAQ: '16:00', LSE: '16:30',
  NSE: '15:30', TSE: '15:00', HKEX: '16:00',
  EURONEXT: '17:30',
}

function getProvidersForMarket(marketName: string): { name: string; note: string }[] {
  const market = EXCHANGE_STOCKS[marketName]
  if (!market) return []

  const cc = market.currency
  const isUSD = cc === 'USD'
  const isGlobal = marketName === 'NASDAQ' || marketName === 'NYSE'

  const result: { name: string; note: string }[] = []

  if (isUSD || isGlobal) {
    result.push({ name: 'Alpha Vantage', note: '5 req/min, 15-min delay, free API key' })
  }
  result.push({ name: 'Finnhub', note: '60 req/min, global stocks + news' })
  result.push({ name: 'Yahoo Finance', note: 'Unofficial, covers all global markets' })
  result.push({ name: 'Twelve Data', note: '800 calls/day, global coverage' })

  return result
}

export default function MarketsPage() {
  const activeMarket = useStore(s => s.prices.activeMarket)
  const symbols = useStore(s => s.prices.symbols)
  const setActiveMarket = useStore(s => s.setActiveMarket)
  const activeCurrency = useStore(s => s.prices.activeCurrency)
  const ticks = useStore(s => s.prices.ticks)

  const selectedData = EXCHANGE_STOCKS[activeMarket]

  return (
    <div className="h-full flex flex-col overflow-hidden p-4">
      <div className="section-title shrink-0">Global Markets</div>
      <div className="grid grid-cols-2 gap-3 mb-4 shrink-0">
        {Object.entries(EXCHANGE_STOCKS).map(([name, ex]) => (
          <button
            key={name}
            onClick={() => setActiveMarket(name)}
            className={`terminal-panel-dim p-3 neon-hover text-left transition-all ${
              activeMarket === name
                ? 'border-[var(--yellow)] ring-1 ring-[var(--yellow)]'
                : ''
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="font-bold text-[var(--yellow)]">{ex.name}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">
                  {ex.country} · {ex.currency}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs">
                  <span className="pulse-dot green mr-1" />
                  {MARKET_OPEN[name]}–{MARKET_CLOSE[name]}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">{MARKET_TZ[name]}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedData && (
        <>
          <div className="flex items-center justify-between shrink-0 mb-2">
            <div className="section-title mb-0">{selectedData.name} — Top 10 Stocks</div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              <span className="pulse-dot green mr-1" />
              Simulated Data
            </div>
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto mb-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[var(--text-secondary)] border-b border-[var(--border-dim)] sticky top-0 bg-[var(--bg-primary)]">
                  <th className="text-left py-2 px-2">Symbol</th>
                  <th className="text-left py-2 px-2">Name</th>
                  <th className="text-right py-2 px-2">Price</th>
                  <th className="text-right py-2 px-2">Change</th>
                  <th className="text-right py-2 px-2">%</th>
                  <th className="text-right py-2 px-2">Volume</th>
                </tr>
              </thead>
              <tbody>
                {symbols.map(({ symbol, name }) => {
                  const tick = ticks[symbol]
                  return (
                    <tr key={symbol} className="border-b border-[var(--border-dim)]/50 hover:bg-[var(--bg-tertiary)]/30">
                      <td className="py-1.5 px-2 font-semibold text-white">{symbol}</td>
                      <td className="py-1.5 px-2 text-[var(--text-secondary)]">{name}</td>
                      <td className="py-1.5 px-2 text-right font-medium">{tick ? formatPrice(tick.price, activeCurrency) : '—'}</td>
                      <td className={`py-1.5 px-2 text-right ${(tick?.change ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                        {tick ? `${tick.change >= 0 ? '+' : ''}${tick.change.toFixed(2)}` : '—'}
                      </td>
                      <td className={`py-1.5 px-2 text-right ${(tick?.changePercent ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                        {tick ? `${tick.changePercent >= 0 ? '+' : ''}${tick.changePercent.toFixed(2)}%` : '—'}
                      </td>
                      <td className="py-1.5 px-2 text-right text-[var(--text-secondary)]">
                        {tick ? (tick.volume / 1000).toFixed(0) + 'K' : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="shrink-0 border-t border-[var(--border-dim)] pt-2">
            <div className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">
              Free Data Providers for {selectedData.name}
            </div>
            <div className="flex gap-2 flex-wrap text-[10px]">
              {getProvidersForMarket(activeMarket).map(p => (
                <span key={p.name} className="px-2 py-0.5 bg-[var(--bg-tertiary)] rounded text-[var(--text-secondary)]">
                  <span className="text-[var(--yellow)]">{p.name}</span> — {p.note}
                </span>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}