import type { StrategyDef } from './types'
import { calcSMA, calcRSI } from './indicators'

export const STRATEGIES: StrategyDef[] = [
  {
    name: 'SMA Crossover',
    description: 'Buy when fast SMA crosses above slow SMA, sell when it crosses below',
    params: [
      { key: 'fastPeriod', label: 'Fast SMA', default: 20, min: 5, max: 50, step: 1 },
      { key: 'slowPeriod', label: 'Slow SMA', default: 50, min: 20, max: 200, step: 1 },
    ],
    onBar: (barIndex, prices, _indicators, state, params) => {
      const fastPeriod = Math.round(params.fastPeriod ?? 20)
      const slowPeriod = Math.round(params.slowPeriod ?? 50)

      if (barIndex < slowPeriod) return null
      const fast = calcSMA(prices.slice(0, barIndex + 1), fastPeriod)
      const slow = calcSMA(prices.slice(0, barIndex + 1), slowPeriod)

      const prevFast = fast[barIndex - 1]
      const currFast = fast[barIndex]
      const prevSlow = slow[barIndex - 1]
      const currSlow = slow[barIndex]
      if (prevFast === null || currFast === null || prevSlow === null || currSlow === null) return null

      if (state.position === 0 && prevFast <= prevSlow && currFast > currSlow) {
        return { type: 'buy', quantity: 100, reason: 'Golden cross' }
      }
      if (state.position > 0 && prevFast >= prevSlow && currFast < currSlow) {
        return { type: 'sell', quantity: state.position, reason: 'Death cross' }
      }
      return null
    },
  },
  {
    name: 'RSI Reversal',
    description: 'Buy when RSI oversold (<30), sell when overbought (>70)',
    params: [
      { key: 'period', label: 'RSI Period', default: 14, min: 5, max: 30, step: 1 },
      { key: 'oversold', label: 'Oversold Level', default: 30, min: 10, max: 45, step: 1 },
      { key: 'overbought', label: 'Overbought Level', default: 70, min: 55, max: 90, step: 1 },
    ],
    onBar: (barIndex, prices, _indicators, state, params) => {
      const period = Math.round(params.period ?? 14)
      const oversold = params.oversold ?? 30
      const overbought = params.overbought ?? 70

      if (barIndex < period) return null
      const rsiValues = calcRSI(prices.slice(0, barIndex + 1), period)
      const currRSI = rsiValues[barIndex]
      const prevRSI = rsiValues[barIndex - 1]
      if (currRSI === null || prevRSI === null) return null

      if (state.position === 0 && prevRSI <= oversold && currRSI > oversold) {
        return { type: 'buy', quantity: 100, reason: 'RSI oversold bounce' }
      }
      if (state.position > 0 && prevRSI >= overbought && currRSI < overbought) {
        return { type: 'sell', quantity: state.position, reason: 'RSI overbought' }
      }
      return null
    },
  },
  {
    name: 'Momentum Breakout',
    description: 'Buy when price breaks above recent high, sell when it drops below recent low',
    params: [
      { key: 'lookback', label: 'Lookback Period', default: 20, min: 5, max: 100, step: 1 },
    ],
    onBar: (barIndex, prices, _indicators, state, params) => {
      const lookback = Math.round(params.lookback ?? 20)
      if (barIndex < lookback) return null

      const recent = prices.slice(barIndex - lookback, barIndex)
      const resistance = Math.max(...recent.map(p => p.high))
      const support = Math.min(...recent.map(p => p.low))
      const curr = prices[barIndex]

      if (state.position === 0 && curr.close > resistance) {
        return { type: 'buy', quantity: 100, reason: 'Breakout above resistance' }
      }
      if (state.position > 0 && curr.close < support) {
        return { type: 'sell', quantity: state.position, reason: 'Breakdown below support' }
      }
      return null
    },
  },
  {
    name: 'Buy & Hold',
    description: 'Buy on first bar, hold until end',
    params: [],
    onBar: (barIndex, _prices, _indicators, state, _params) => {
      if (barIndex === 0 && state.position === 0) {
        return { type: 'buy', quantity: 100, reason: 'Initial buy' }
      }
      return null
    },
  },
]
