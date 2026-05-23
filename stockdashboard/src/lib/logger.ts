import type { StoreApi } from 'zustand/vanilla'
import type { StoreState } from '../store/store'
import { logOHLC, logTrade, logSnapshot, logIndicators } from './database'
import { calcIndicators } from './indicators'
import { SYMBOLS } from './constants'

let snapshotInterval: ReturnType<typeof setInterval> | null = null
let lastLoggedTime: Record<string, number> = {}

function getLastBarKey(symbol: string, bars: { time: number }[]): string {
  const last = bars[bars.length - 1]
  return last ? `${symbol}-${last.time}` : ''
}

export function startLogger(store: StoreApi<StoreState>) {
  const unsub = store.subscribe((state, prevState) => {
    const history = state.prices.history
    const prevHistory = prevState.prices.history

    SYMBOLS.forEach(({ symbol }) => {
      const bars = history[symbol]
      const prevBars = prevHistory[symbol]
      if (!bars || !prevBars) return

      const newKey = getLastBarKey(symbol, bars)
      const oldKey = getLastBarKey(symbol, prevBars)
      if (newKey === oldKey) return

      const lastLogged = lastLoggedTime[symbol] || 0
      const newBar = bars[bars.length - 1]
      if (!newBar || newBar.time <= lastLogged) return
      lastLoggedTime[symbol] = newBar.time

      logOHLC({
        time: newBar.time,
        symbol,
        open: newBar.open,
        high: newBar.high,
        low: newBar.low,
        close: newBar.close,
        volume: newBar.volume,
      })

      if (bars.length >= 26) {
        const ind = calcIndicators(bars)
        logIndicators([
          {
            time: newBar.time,
            symbol,
            ...ind,
          },
        ])
      }
    })

    const trades = state.portfolio.trades
    const prevTrades = prevState.portfolio.trades
    if (trades.length > prevTrades.length) {
      const newTrade = trades[0]
      if (newTrade && newTrade.id !== prevTrades[0]?.id) {
        logTrade({
          tradeId: newTrade.id,
          symbol: newTrade.symbol,
          side: newTrade.side,
          quantity: newTrade.quantity,
          price: newTrade.price,
          total: newTrade.total,
          timestamp: newTrade.timestamp,
        })
      }
    }
  })

  snapshotInterval = setInterval(() => {
    const state = store.getState()
    const positions = state.portfolio.positions
    const equity = Object.entries(positions).reduce((sum, [symbol, pos]) => {
      const price = state.prices.ticks[symbol]?.price || 0
      return sum + price * pos.quantity
    }, state.portfolio.cash)

    logSnapshot({
      time: Date.now(),
      cash: state.portfolio.cash,
      equity: Math.round(equity * 100) / 100,
      positions: JSON.stringify(positions),
    })
  }, 10000)

  return () => {
    unsub()
    if (snapshotInterval) clearInterval(snapshotInterval)
  }
}
