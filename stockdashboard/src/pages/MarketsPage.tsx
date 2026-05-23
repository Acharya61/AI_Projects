import { MarketOverview } from '../components/Market/MarketOverview'
import { Watchlist } from '../components/Watchlist/Watchlist'

const exchanges = [
  { name: 'NYSE', country: 'US', currency: 'USD', tz: 'America/New_York', open: '09:30', close: '16:00' },
  { name: 'NASDAQ', country: 'US', currency: 'USD', tz: 'America/New_York', open: '09:30', close: '16:00' },
  { name: 'LSE', country: 'UK', currency: 'GBP', tz: 'Europe/London', open: '08:00', close: '16:30' },
  { name: 'NSE', country: 'India', currency: 'INR', tz: 'Asia/Kolkata', open: '09:15', close: '15:30' },
  { name: 'TSE', country: 'Japan', currency: 'JPY', tz: 'Asia/Tokyo', open: '09:00', close: '15:00' },
  { name: 'HKEX', country: 'HK', currency: 'HKD', tz: 'Asia/Hong_Kong', open: '09:30', close: '16:00' },
  { name: 'EURONEXT', country: 'EU', currency: 'EUR', tz: 'Europe/Paris', open: '09:00', close: '17:30' },
]

export default function MarketsPage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Global Markets</div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {exchanges.map(ex => (
          <div key={ex.name} className="terminal-panel-dim p-3 neon-hover">
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
                  {ex.open}–{ex.close}
                </div>
                <div className="text-[10px] text-[var(--text-secondary)]">{ex.tz}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="section-title">Market Watch</div>
      <MarketOverview />
      <div className="mt-4">
        <Watchlist />
      </div>
    </div>
  )
}
