import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { TickData, Trade, Position, OrderBookData, OHLCData, IndexData } from '../lib/types'
import { SYMBOLS, INITIAL_CASH, HISTORY_LENGTH } from '../lib/constants'
import {
  initializePrices,
  generateNextTick,
  generateOHLC,
  getOhlcHistory,
  appendOhlc,
  generateOrderBook,
  generateIndexData,
} from '../lib/dataGenerator'

interface PortfolioState {
  cash: number
  positions: Record<string, Position>
  trades: Trade[]
}

interface PriceState {
  ticks: Record<string, TickData>
  history: Record<string, OHLCData[]>
  orderBooks: Record<string, OrderBookData>
  indices: IndexData[]
  activeSymbol: string
}

export interface StoreState {
  prices: PriceState
  portfolio: PortfolioState
  initialized: boolean
  init: () => void
  tick: (timestamp: number) => void
  setActiveSymbol: (symbol: string) => void
  buy: (symbol: string, quantity: number, price: number) => boolean
  sell: (symbol: string, quantity: number, price: number) => boolean
}

function createEmptyPortfolio(): PortfolioState {
  return {
    cash: INITIAL_CASH,
    positions: {},
    trades: [],
  }
}

let tickCount = 0

export const useStore = create<StoreState>((set, get) => ({
  prices: {
    ticks: {},
    history: {},
    orderBooks: {},
    indices: [],
    activeSymbol: SYMBOLS[0].symbol,
  },
  portfolio: createEmptyPortfolio(),
  initialized: false,

  init: () => {
    const ticks = initializePrices()
    const history: Record<string, OHLCData[]> = {}
    const orderBooks: Record<string, OrderBookData> = {}

    SYMBOLS.forEach(({ symbol }) => {
      history[symbol] = getOhlcHistory(symbol)
      orderBooks[symbol] = generateOrderBook(symbol, ticks[symbol].price)
    })

    const indices = generateIndexData(0)

    set({
      prices: {
        ticks,
        history,
        orderBooks,
        indices,
        activeSymbol: SYMBOLS[0].symbol,
      },
      portfolio: createEmptyPortfolio(),
      initialized: true,
    })
  },

  tick: (timestamp: number) => {
    tickCount++
    const state = get()
    const newTicks: Record<string, TickData> = {}
    const newHistory: Record<string, OHLCData[]> = {}
    const newOrderBooks: Record<string, OrderBookData> = {}

    SYMBOLS.forEach(({ symbol }) => {
      const currentTick = state.prices.ticks[symbol]
      const newTick = generateNextTick(symbol, currentTick)
      newTicks[symbol] = newTick

      newHistory[symbol] = [...(state.prices.history[symbol] || getOhlcHistory(symbol))]

      if (tickCount % 5 === 0) {
        const ohlc = generateOHLC(symbol, timestamp)
        newHistory[symbol].push(ohlc)
        if (newHistory[symbol].length > HISTORY_LENGTH + 30) {
          newHistory[symbol] = newHistory[symbol].slice(-HISTORY_LENGTH)
        }
        appendOhlc(symbol, ohlc)
      }

      newOrderBooks[symbol] = generateOrderBook(symbol, newTick.price)
    })

    const indices = generateIndexData(tickCount)

    set({
      prices: {
        ...state.prices,
        ticks: newTicks,
        history: newHistory,
        orderBooks: newOrderBooks,
        indices,
      },
    })
  },

  setActiveSymbol: (symbol: string) => {
    set(state => ({
      prices: { ...state.prices, activeSymbol: symbol },
    }))
  },

  buy: (symbol: string, quantity: number, price: number) => {
    const state = get()
    const cost = quantity * price

    if (cost > state.portfolio.cash) return false

    const existing = state.portfolio.positions[symbol]
    const newQty = existing ? existing.quantity + quantity : quantity
    const newAvg = existing
      ? Math.round(((existing.avgEntry * existing.quantity + cost) / newQty) * 100) / 100
      : price

    const trade: Trade = {
      id: uuidv4(),
      symbol,
      side: 'buy',
      quantity,
      price,
      total: cost,
      timestamp: Date.now(),
    }

    set(s => ({
      portfolio: {
        cash: Math.round((s.portfolio.cash - cost) * 100) / 100,
        positions: {
          ...s.portfolio.positions,
          [symbol]: { symbol, quantity: newQty, avgEntry: newAvg },
        },
        trades: [trade, ...s.portfolio.trades].slice(0, 50),
      },
    }))

    return true
  },

  sell: (symbol: string, quantity: number, price: number) => {
    const state = get()
    const position = state.portfolio.positions[symbol]

    if (!position || position.quantity < quantity) return false

    const proceeds = quantity * price
    const newQty = position.quantity - quantity

    const trade: Trade = {
      id: uuidv4(),
      symbol,
      side: 'sell',
      quantity,
      price,
      total: proceeds,
      timestamp: Date.now(),
    }

    set(s => {
      const newPositions = { ...s.portfolio.positions }
      if (newQty === 0) {
        delete newPositions[symbol]
      } else {
        newPositions[symbol] = { ...newPositions[symbol], quantity: newQty }
      }

      return {
        portfolio: {
          cash: Math.round((s.portfolio.cash + proceeds) * 100) / 100,
          positions: newPositions,
          trades: [trade, ...s.portfolio.trades].slice(0, 50),
        },
      }
    })

    return true
  },
}))
