import type { OHLCData, BacktestResult, BacktestTrade, IndicatorValues } from './types'
import { calcIndicators } from './indicators'

export function runBacktest(
  symbol: string,
  strategyName: string,
  params: Record<string, number>,
  onBar: (barIndex: number, prices: OHLCData[], indicators: IndicatorValues[], state: { cash: number; position: number; entryPrice: number }, params: Record<string, number>) => { type: 'buy' | 'sell' | 'close'; quantity?: number; reason?: string } | null,
  prices: OHLCData[],
  startCash: number = 100000,
): BacktestResult {
  let cash = startCash
  let position = 0
  let entryPrice = 0
  const trades: BacktestTrade[] = []
  const equityCurve: { time: number; equity: number }[] = []
  let openTrade: { entryTime: number; entryPrice: number; quantity: number; reason: string; side: 'long' | 'short' } | null = null
  const allIndicators: IndicatorValues[] = []

  for (let i = 0; i < prices.length; i++) {
    allIndicators.push(calcIndicators(prices.slice(0, i + 1)))

    const action = onBar(i, prices, allIndicators, { cash, position, entryPrice }, params)

    if (action) {
      const price = prices[i].close
      const quantity = action.quantity ?? 100

      if ((action.type === 'buy' || action.type === 'close') && position === 0 && cash >= price * quantity) {
        const qty = Math.min(quantity, Math.floor(cash / price))
        cash -= price * qty
        position = qty
        entryPrice = price
        openTrade = { entryTime: prices[i].time, entryPrice: price, quantity: qty, reason: action.reason || '', side: 'long' }
      }

      if ((action.type === 'sell' || action.type === 'close') && position > 0) {
        const qty = Math.min(action.quantity ?? position, position)
        const proceeds = price * qty
        const pnl = proceeds - entryPrice * qty
        const pnlPercent = ((price - entryPrice) / entryPrice) * 100
        cash += proceeds
        position -= qty

        if (openTrade) {
          trades.push({
            entryTime: openTrade.entryTime,
            entryPrice: openTrade.entryPrice,
            exitTime: prices[i].time,
            exitPrice: price,
            quantity: openTrade.quantity,
            pnl: Math.round(pnl * 100) / 100,
            pnlPercent: Math.round(pnlPercent * 100) / 100,
            side: openTrade.side,
            reason: action.reason || openTrade.reason,
          })
          openTrade = null
        }
        entryPrice = 0
      }
    }

    const equity = cash + position * prices[i].close
    equityCurve.push({ time: prices[i].time, equity: Math.round(equity * 100) / 100 })
  }

  const endCash = cash + position * (prices.length > 0 ? prices[prices.length - 1].close : 0)
  const totalReturn = endCash - startCash
  const totalReturnPercent = startCash > 0 ? (totalReturn / startCash) * 100 : 0

  const winningTrades = trades.filter(t => t.pnl > 0)
  const losingTrades = trades.filter(t => t.pnl <= 0)
  const winRate = trades.length > 0 ? (winningTrades.length / trades.length) * 100 : 0

  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((s, t) => s + t.pnl, 0) / winningTrades.length
    : 0
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0) / losingTrades.length)
    : 0

  const returns: number[] = []
  for (let i = 1; i < equityCurve.length; i++) {
    const prev = equityCurve[i - 1].equity
    if (prev > 0) returns.push((equityCurve[i].equity - prev) / prev)
  }
  const avgReturn = returns.length > 0 ? returns.reduce((s, r) => s + r, 0) / returns.length : 0
  const variance = returns.length > 0
    ? returns.reduce((s, r) => s + (r - avgReturn) ** 2, 0) / returns.length
    : 0
  const stdDev = Math.sqrt(variance)
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0

  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  let peak = equityCurve[0]?.equity ?? startCash
  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity
    const dd = peak - point.equity
    const ddPercent = peak > 0 ? (dd / peak) * 100 : 0
    if (dd > maxDrawdown) maxDrawdown = dd
    if (ddPercent > maxDrawdownPercent) maxDrawdownPercent = ddPercent
  }

  return {
    symbol,
    strategyName,
    totalReturn: Math.round(totalReturn * 100) / 100,
    totalReturnPercent: Math.round(totalReturnPercent * 100) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    maxDrawdown: Math.round(maxDrawdown * 100) / 100,
    maxDrawdownPercent: Math.round(maxDrawdownPercent * 100) / 100,
    winRate: Math.round(winRate * 100) / 100,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    equityCurve,
    trades,
    startCash,
    endCash: Math.round(endCash * 100) / 100,
  }
}
