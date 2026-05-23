import { usePortfolio } from '../../hooks/usePortfolio'
import { useStore } from '../../store/store'
import { formatPrice, formatPnl } from '../../data/currencies'

export function PortfolioSummary() {
  const { cash, totalEquity, totalUnrealizedPL, totalRealizedPL, positions } = usePortfolio()
  const currency = useStore(s => s.prices.activeCurrency)

  return (
    <div className="p-3">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Portfolio</h3>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <div className="text-[var(--text-secondary)]">Total Equity</div>
          <div className="text-base font-bold">{formatPrice(totalEquity, currency)}</div>
        </div>
        <div>
          <div className="text-[var(--text-secondary)]">Cash</div>
          <div className="text-base font-bold">{formatPrice(cash, currency)}</div>
        </div>
        <div>
          <div className="text-[var(--text-secondary)]">Unrealized P&L</div>
          <div className={`text-base font-bold ${totalUnrealizedPL >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {formatPnl(totalUnrealizedPL, currency)}
          </div>
        </div>
        <div>
          <div className="text-[var(--text-secondary)]">Realized P&L</div>
          <div className={`text-base font-bold ${totalRealizedPL >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {formatPnl(totalRealizedPL, currency)}
          </div>
        </div>
      </div>
      {Object.keys(positions).length > 0 && (
        <div className="mt-2 border-t border-gray-800 pt-2">
          <div className="text-[var(--text-secondary)] text-xs mb-1">Positions ({Object.keys(positions).length})</div>
          {Object.entries(positions).map(([symbol, pos]) => (
            <div key={symbol} className="text-xs flex justify-between py-0.5">
              <span className="font-medium">{symbol}</span>
              <span>{pos.quantity} shrs @ {formatPrice(pos.avgEntry, currency)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}