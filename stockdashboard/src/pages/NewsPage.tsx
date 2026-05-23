export default function NewsPage() {
  const news = [
    { time: '09:45', source: 'REUTERS', headline: 'Fed holds rates steady at 5.25%, signals potential cut', impact: 'high' },
    { time: '09:32', source: 'BLOOMBERG', headline: 'AAPL reports record quarterly revenue of $124.9B', impact: 'high' },
    { time: '09:15', source: 'CNBC', headline: 'Oil prices slide 3% on OPEC+ production increase', impact: 'medium' },
    { time: '08:58', source: 'WSJ', headline: 'TSLA deliveries beat estimates, stock up pre-market', impact: 'medium' },
    { time: '08:30', source: 'FT', headline: 'European markets mixed as ECB holds rates', impact: 'low' },
    { time: '08:12', source: 'REUTERS', headline: 'NVDA announces new AI chip partnership', impact: 'high' },
  ]
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Market News Feed</div>
      <div className="space-y-1">
        {news.map((item, i) => (
          <div key={i} className="terminal-panel-dim p-2 text-xs flex items-start gap-3">
            <span className="text-[var(--text-secondary)] shrink-0 w-10">{item.time}</span>
            <span className={`text-[10px] font-bold shrink-0 ${
              item.source === 'REUTERS' ? 'text-[var(--cyan)]' :
              item.source === 'BLOOMBERG' ? 'text-[var(--orange)]' :
              'text-[var(--text-secondary)]'
            }`}>
              [{item.source}]
            </span>
            <span className="flex-1">{item.headline}</span>
            <span className={`text-[10px] shrink-0 ${
              item.impact === 'high' ? 'text-[var(--red)]' :
              item.impact === 'medium' ? 'text-[var(--yellow)]' :
              'text-[var(--text-secondary)]'
            }`}>
              {item.impact.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
