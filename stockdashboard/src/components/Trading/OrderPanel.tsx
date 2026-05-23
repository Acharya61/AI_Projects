import { useState } from 'react'
import { useStore } from '../../store/store'

export function OrderPanel() {
  const [side, setSide] = useState<'buy' | 'sell'>('buy')
  const [quantity, setQuantity] = useState('10')
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market')
  const [limitPrice, setLimitPrice] = useState('')

  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const currentTick = useStore(s => s.prices.ticks[activeSymbol])
  const buy = useStore(s => s.buy)
  const sell = useStore(s => s.sell)
  const cash = useStore(s => s.portfolio.cash)
  const position = useStore(s => s.portfolio.positions[activeSymbol])

  const price = orderType === 'market' ? (currentTick?.price || 0) : parseFloat(limitPrice) || 0
  const qty = parseInt(quantity) || 0
  const total = qty * price
  const canTrade = qty > 0 && price > 0

  const handleSubmit = () => {
    if (!canTrade) return
    const success = side === 'buy' ? buy(activeSymbol, qty, price) : sell(activeSymbol, qty, price)
    if (success) setQuantity('10')
  }

  return (
    <div className="p-3 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide">Order Panel</h3>

      <div className="flex rounded overflow-hidden text-sm font-medium">
        <button
          className={`flex-1 py-1.5 text-center transition-colors ${side === 'buy' ? 'bg-[var(--green)] text-black' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
          onClick={() => setSide('buy')}
        >
          Buy
        </button>
        <button
          className={`flex-1 py-1.5 text-center transition-colors ${side === 'sell' ? 'bg-[var(--red)] text-white' : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
          onClick={() => setSide('sell')}
        >
          Sell
        </button>
      </div>

      <div className="flex gap-2 text-xs">
        <button
          className={`px-3 py-1 rounded ${orderType === 'market' ? 'bg-[var(--bg-tertiary)] text-white' : 'text-[var(--text-secondary)]'}`}
          onClick={() => setOrderType('market')}
        >
          Market
        </button>
        <button
          className={`px-3 py-1 rounded ${orderType === 'limit' ? 'bg-[var(--bg-tertiary)] text-white' : 'text-[var(--text-secondary)]'}`}
          onClick={() => setOrderType('limit')}
        >
          Limit
        </button>
      </div>

      <div>
        <label className="text-xs text-[var(--text-secondary)] block mb-1">Quantity</label>
        <input
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="w-full bg-[var(--bg-tertiary)] text-white px-3 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500"
          min="1"
        />
      </div>

      {orderType === 'limit' && (
        <div>
          <label className="text-xs text-[var(--text-secondary)] block mb-1">Limit Price</label>
          <input
            type="number"
            value={limitPrice}
            onChange={e => setLimitPrice(e.target.value)}
            className="w-full bg-[var(--bg-tertiary)] text-white px-3 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500"
            step="0.01"
            min="0.01"
          />
        </div>
      )}

      {currentTick && (
        <div className="text-xs text-[var(--text-secondary)] space-y-1">
          <div className="flex justify-between">
            <span>Price</span>
            <span className="text-white">${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Total</span>
            <span className="text-white">${total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Available</span>
            <span className="text-white">${cash.toFixed(2)}</span>
          </div>
          {position && (
            <div className="flex justify-between">
              <span>Holding</span>
              <span className="text-white">{position.quantity} shares</span>
            </div>
          )}
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={!canTrade}
        className={`w-full py-2 rounded font-semibold text-sm transition-colors ${
          side === 'buy'
            ? 'bg-[var(--green)] text-black hover:opacity-90 disabled:opacity-40'
            : 'bg-[var(--red)] text-white hover:opacity-90 disabled:opacity-40'
        }`}
      >
        {side === 'buy' ? 'Buy' : 'Sell'} {qty} {activeSymbol}
      </button>
    </div>
  )
}
