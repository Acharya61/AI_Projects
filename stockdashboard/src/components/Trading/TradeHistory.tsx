import { useStore } from '../../store/store'

export function TradeHistory() {
  const trades = useStore(s => s.portfolio.trades)

  if (trades.length === 0) {
    return (
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Trade History</h3>
        <div className="text-xs text-[var(--text-secondary)] text-center py-4">No trades yet</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide px-3 py-2 border-b border-gray-800 shrink-0">
        Trade History
      </h3>
      <div className="grid grid-cols-5 text-xs text-[var(--text-secondary)] px-3 py-1 border-b border-gray-800 shrink-0">
        <span>Time</span>
        <span>Symbol</span>
        <span>Side</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Price</span>
      </div>
      <div className="flex-1 overflow-y-auto text-xs">
        {trades.map(t => (
          <div key={t.id} className="grid grid-cols-5 px-3 py-1 hover:bg-gray-800/30">
            <span className="text-[var(--text-secondary)]">{new Date(t.timestamp).toLocaleTimeString()}</span>
            <span className="font-medium">{t.symbol}</span>
            <span className={t.side === 'buy' ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
              {t.side.toUpperCase()}
            </span>
            <span className="text-right">{t.quantity}</span>
            <span className="text-right">${t.price.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
