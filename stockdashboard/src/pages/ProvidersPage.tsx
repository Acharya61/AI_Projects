const providers = [
  { name: 'Yahoo Finance', type: 'Free', limits: 'Unlimited delayed data', docs: 'https://finance.yahoo.com' },
  { name: 'Alpha Vantage', type: 'Free (API key)', limits: '5 calls/min, 500/day', docs: 'https://www.alphavantage.co' },
  { name: 'IEX Cloud', type: 'Free tier', limits: '50k calls/month', docs: 'https://iexcloud.io' },
  { name: 'Polygon.io', type: 'Free tier', limits: '5 calls/min', docs: 'https://polygon.io' },
  { name: 'Twelve Data', type: 'Free tier', limits: '800 calls/day', docs: 'https://twelvedata.com' },
  { name: 'Finnhub', type: 'Free tier', limits: '60 calls/min', docs: 'https://finnhub.io' },
  { name: 'OANDA', type: 'Free (demo)', limits: 'Forex data only', docs: 'https://developer.oanda.com' },
  { name: 'Binance', type: 'Free', limits: 'Crypto data, 1200 req/min', docs: 'https://binance-docs.github.io' },
]

export default function ProvidersPage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Data Providers</div>
      <table className="terminal-table">
        <thead>
          <tr>
            <th>Provider</th>
            <th>Type</th>
            <th>Rate Limits</th>
            <th>Documentation</th>
          </tr>
        </thead>
        <tbody>
          {providers.map(p => (
            <tr key={p.name}>
              <td className="font-medium">{p.name}</td>
              <td><span className="text-[var(--yellow)]">{p.type}</span></td>
              <td className="text-[var(--text-secondary)]">{p.limits}</td>
              <td><a href={p.docs} target="_blank" rel="noopener noreferrer" className="text-[var(--cyan)] text-[10px]">{p.docs}</a></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
