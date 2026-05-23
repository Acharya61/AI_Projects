import { useStore } from '../../store/store'
import { useOrderBook } from '../../hooks/useOrderBook'
import { formatPrice } from '../../data/currencies'

export function OrderBook() {
  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const currency = useStore(s => s.prices.activeCurrency)
  const orderBook = useOrderBook(activeSymbol)

  if (!orderBook) return null

  const maxBidTotal = orderBook.bids.length > 0 ? orderBook.bids[orderBook.bids.length - 1].total : 1
  const maxAskTotal = orderBook.asks.length > 0 ? orderBook.asks[orderBook.asks.length - 1].total : 1
  const maxTotal = Math.max(maxBidTotal, maxAskTotal)

  return (
    <div className="flex flex-col h-full">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide px-3 py-2 border-b border-gray-800 shrink-0">
        Order Book
      </h3>
      <div className="grid grid-cols-3 text-xs text-[var(--text-secondary)] px-3 py-1 border-b border-gray-800 shrink-0">
        <span>Price</span>
        <span className="text-right">Size</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex flex-col text-xs flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto flex flex-col-reverse">
          {[...orderBook.asks].reverse().map((level, i) => (
            <div key={`ask-${i}`} className="grid grid-cols-3 px-3 py-0.5 relative hover:bg-gray-800/30">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[var(--red)]/10"
                style={{ width: `${(level.total / maxTotal) * 100}%` }}
              />
              <span className="text-[var(--red)] relative z-10">{level.price.toFixed(2)}</span>
              <span className="text-right relative z-10">{level.size.toLocaleString()}</span>
              <span className="text-right relative z-10">{level.total.toLocaleString()}</span>
            </div>
          ))}
        </div>

        {orderBook && (
          <div className="px-3 py-1 text-center text-sm font-bold border-y border-gray-800 shrink-0">
            <span className="text-[var(--green)]">{orderBook.bids[0]?.price.toFixed(2)}</span>
            <span className="text-[var(--text-secondary)] mx-2">—</span>
            <span className="text-[var(--red)]">{orderBook.asks[0]?.price.toFixed(2)}</span>
            <span className="text-[var(--text-secondary)] text-xs ml-2">Spread: {formatPrice(orderBook.spread, currency)}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {orderBook.bids.map((level, i) => (
            <div key={`bid-${i}`} className="grid grid-cols-3 px-3 py-0.5 relative hover:bg-gray-800/30">
              <div
                className="absolute right-0 top-0 bottom-0 bg-[var(--green)]/10"
                style={{ width: `${(level.total / maxTotal) * 100}%` }}
              />
              <span className="text-[var(--green)] relative z-10">{level.price.toFixed(2)}</span>
              <span className="text-right relative z-10">{level.size.toLocaleString()}</span>
              <span className="text-right relative z-10">{level.total.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
