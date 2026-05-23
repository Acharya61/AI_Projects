import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { TickData, Trade, Position, OrderBookData, OHLCData, IndexData, NewsItem } from '../lib/types'
import { INITIAL_CASH, HISTORY_LENGTH } from '../lib/constants'
import { EXCHANGE_STOCKS } from '../data/markets'
import {
  initializePrices,
  generateNextTick,
  generateOHLC,
  getOhlcHistory,
  appendOhlc,
  generateOrderBook,
  generateIndexData,
  setActiveSymbolsAndBasePrices,
} from '../lib/dataGenerator'
import { generateNewsItem, generateInitialNews } from '../lib/newsGenerator'

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
  symbols: { symbol: string; name: string }[]
  activeMarket: string
  activeCurrency: string
}

export interface StoreState {
  prices: PriceState
  portfolio: PortfolioState
  news: NewsItem[]
  initialized: boolean
  init: () => void
  tick: (timestamp: number) => void
  setActiveSymbol: (symbol: string) => void
  setActiveMarket: (marketName: string) => void
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
let newsTickCounter = 0

function getDefaultMarketSymbols() {
  const nasdaq = EXCHANGE_STOCKS['NASDAQ']
  return nasdaq.top10.map(s => ({ symbol: s.symbol, name: s.name }))
}

function getDefaultBasePrices() {
  const nasdaq = EXCHANGE_STOCKS['NASDAQ']
  const prices: Record<string, number> = {}
  nasdaq.top10.forEach(s => { prices[s.symbol] = s.basePrice })
  return prices
}

function getMarketStocksWithPrices(marketName: string) {
  const market = EXCHANGE_STOCKS[marketName]
  if (!market) return []
  return market.top10
}

function initDataForSymbols(symbols: { symbol: string; name: string }[], basePrices: Record<string, number>) {
  setActiveSymbolsAndBasePrices(symbols, basePrices)

  const ticks = initializePrices()
  const history: Record<string, OHLCData[]> = {}
  const orderBooks: Record<string, OrderBookData> = {}

  symbols.forEach(({ symbol }) => {
    history[symbol] = getOhlcHistory(symbol)
    orderBooks[symbol] = generateOrderBook(symbol, ticks[symbol].price)
  })

  return { ticks, history, orderBooks }
}

export const useStore = create<StoreState>((set, get) => ({
  prices: {
    ticks: {},
    history: {},
    orderBooks: {},
    indices: [],
    activeSymbol: getDefaultMarketSymbols()[0]?.symbol || 'AAPL',
    symbols: getDefaultMarketSymbols(),
    activeMarket: 'NASDAQ',
    activeCurrency: 'USD',
  },
  portfolio: createEmptyPortfolio(),
  news: [],
  initialized: false,

  init: () => {
    const symbols = getDefaultMarketSymbols()
    const basePrices = getDefaultBasePrices()
    const { ticks, history, orderBooks } = initDataForSymbols(symbols, basePrices)
    const indices = generateIndexData(0)
    const marketStocks = getMarketStocksWithPrices('NASDAQ')
    const news = generateInitialNews(30, marketStocks)

    set({
      prices: {
        ticks,
        history,
        orderBooks,
        indices,
        activeSymbol: symbols[0]?.symbol || 'AAPL',
        symbols,
        activeMarket: 'NASDAQ',
        activeCurrency: 'USD',
      },
      portfolio: createEmptyPortfolio(),
      news,
      initialized: true,
    })
  },

  tick: (timestamp: number) => {
    tickCount++
    const state = get()
    const symbols = state.prices.symbols
    const newTicks: Record<string, TickData> = {}
    const newHistory: Record<string, OHLCData[]> = {}
    const newOrderBooks: Record<string, OrderBookData> = {}

    symbols.forEach(({ symbol }) => {
      const currentTick = state.prices.ticks[symbol]
      if (!currentTick) return

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

    // Generate news every ~30 ticks
    const marketStocks = getMarketStocksWithPrices(state.prices.activeMarket)
    let news = state.news
    if (tickCount % 30 === 0 && marketStocks.length > 0) {
      newsTickCounter++
      const newItem = generateNewsItem(Math.floor(timestamp / 1000), marketStocks)
      news = [newItem, ...state.news].slice(0, 100)
    }

    set({
      prices: {
        ...state.prices,
        ticks: newTicks,
        history: newHistory,
        orderBooks: newOrderBooks,
        indices,
      },
      news,
    })
  },

  setActiveSymbol: (symbol: string) => {
    set(state => ({
      prices: { ...state.prices, activeSymbol: symbol },
    }))
  },

  setActiveMarket: (marketName: string) => {
    const market = EXCHANGE_STOCKS[marketName]
    if (!market) return

    const symbols = market.top10.map(s => ({ symbol: s.symbol, name: s.name }))
    const basePrices: Record<string, number> = {}
    market.top10.forEach(s => { basePrices[s.symbol] = s.basePrice })

    const { ticks, history, orderBooks } = initDataForSymbols(symbols, basePrices)
    const indices = generateIndexData(0)
    const news = generateInitialNews(30, market.top10)

    set({
      prices: {
        ticks,
        history,
        orderBooks,
        indices,
        activeSymbol: symbols[0]?.symbol || '',
        symbols,
        activeMarket: marketName,
        activeCurrency: market.currency,
      },
      portfolio: createEmptyPortfolio(),
      news,
    })
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