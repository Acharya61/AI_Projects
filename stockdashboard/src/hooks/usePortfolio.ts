import { useCallback } from 'react'
import { useStore } from '../store/store'

export function usePortfolio() {
  const cash = useStore(s => s.portfolio.cash)
  const positions = useStore(s => s.portfolio.positions)
  const trades = useStore(s => s.portfolio.trades)
  const ticks = useStore(s => s.prices.ticks)
  const buy = useStore(s => s.buy)
  const sell = useStore(s => s.sell)

  const totalEquity = Object.entries(positions).reduce((sum, [symbol, pos]) => {
    const currentPrice = ticks[symbol]?.price || 0
    return sum + currentPrice * pos.quantity
  }, cash)

  const totalUnrealizedPL = Object.entries(positions).reduce((sum, [symbol, pos]) => {
    const currentPrice = ticks[symbol]?.price || 0
    return sum + (currentPrice - pos.avgEntry) * pos.quantity
  }, 0)

  const totalRealizedPL = trades
    .filter(t => t.side === 'sell')
    .reduce((sum, t) => sum + t.total, 0) -
    trades
      .filter(t => t.side === 'buy')
      .reduce((sum, t) => sum + t.total, 0)

  const executeBuy = useCallback(
    (symbol: string, quantity: number, price: number) => buy(symbol, quantity, price),
    [buy]
  )

  const executeSell = useCallback(
    (symbol: string, quantity: number, price: number) => sell(symbol, quantity, price),
    [sell]
  )

  return {
    cash,
    positions,
    trades,
    totalEquity,
    totalUnrealizedPL,
    totalRealizedPL,
    buy: executeBuy,
    sell: executeSell,
  }
}
