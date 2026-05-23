import type { OHLCData, TickData, OrderBookData, IndexData } from './types'
import { SYMBOLS, BASE_PRICES, INDICES, HISTORY_LENGTH, ORDER_BOOK_DEPTH } from './constants'

let priceStates: Record<string, { price: number; prevClose: number; high: number; low: number; open: number }> = {}
let ohlcHistory: Record<string, OHLCData[]> = {}
let indexStates: Record<string, { price: number }> = {}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

function normalRandom(seed: number): number {
  let u1 = seededRandom(seed)
  let u2 = seededRandom(seed + 1)
  if (u1 === 0) u1 = 0.0001
  if (u2 === 0) u2 = 0.0001
  return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
}

function generateBasePrice(symbol: string): number {
  return BASE_PRICES[symbol] || 100
}

export function initializePrices(): Record<string, TickData> {
  const ticks: Record<string, TickData> = {}
  const now = Math.floor(Date.now() / 1000)

  SYMBOLS.forEach(({ symbol }, i) => {
    const base = generateBasePrice(symbol)
    const seed = i * 1000
    const price = base + normalRandom(seed) * base * 0.02
    const change = price - base
    const changePercent = (change / base) * 100

    priceStates[symbol] = {
      price,
      prevClose: base,
      high: Math.max(price, base * 1.02),
      low: Math.min(price, base * 0.98),
      open: base + normalRandom(seed + 2) * base * 0.01,
    }

    ticks[symbol] = {
      symbol,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      volume: Math.floor(Math.random() * 5000000 + 500000),
      high: Math.round(priceStates[symbol].high * 100) / 100,
      low: Math.round(priceStates[symbol].low * 100) / 100,
      open: Math.round(priceStates[symbol].open * 100) / 100,
      prevClose: base,
    }

    ohlcHistory[symbol] = generateInitialHistory(symbol, now)
  })

  INDICES.forEach(({ name, basePrice }) => {
    indexStates[name] = { price: basePrice + (Math.random() - 0.5) * basePrice * 0.02 }
  })

  return ticks
}

function generateInitialHistory(symbol: string, now: number): OHLCData[] {
  const history: OHLCData[] = []
  const base = generateBasePrice(symbol)
  let price = base

  for (let i = HISTORY_LENGTH; i >= 0; i--) {
    const t = now - i * 60
    const volatility = base * 0.005
    const change = normalRandom(i * 7) * volatility
    const open = price
    const close = price + change
    const high = Math.max(open, close) + Math.abs(normalRandom(i * 7 + 1) * volatility * 0.5)
    const low = Math.min(open, close) - Math.abs(normalRandom(i * 7 + 2) * volatility * 0.5)
    const volume = Math.floor(Math.abs(normalRandom(i * 7 + 3)) * 2000000 + 300000)

    history.push({
      time: t,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    })

    price = close
  }

  return history
}

let tickCounter = 0

export function generateNextTick(symbol: string, _currentTick: TickData): TickData {
  tickCounter++
  const state = priceStates[symbol]
  const volatility = state.price * 0.002
  const drift = 0.0001
  const seed = tickCounter * 13 + symbol.charCodeAt(0) * 100
  const changePercent = drift + normalRandom(seed) * volatility / state.price
  const newPrice = state.price * (1 + changePercent)

  state.high = Math.max(state.high, newPrice)
  state.low = Math.min(state.low, newPrice)

  const volume = Math.floor(Math.abs(normalRandom(seed + 10)) * 200000 + 10000)

  state.price = newPrice

  return {
    symbol,
    price: Math.round(newPrice * 100) / 100,
    change: Math.round((newPrice - state.prevClose) * 100) / 100,
    changePercent: Math.round(((newPrice - state.prevClose) / state.prevClose) * 10000) / 100,
    volume,
    high: Math.round(state.high * 100) / 100,
    low: Math.round(state.low * 100) / 100,
    open: Math.round(state.open * 100) / 100,
    prevClose: state.prevClose,
  }
}

export function generateOHLC(symbol: string, timestamp: number): OHLCData {
  const state = priceStates[symbol]
  const volatility = state.price * 0.003
  const seed = tickCounter * 17
  const open = state.price
  const close = open + normalRandom(seed) * volatility
  const high = Math.max(open, close) + Math.abs(normalRandom(seed + 1)) * volatility * 0.3
  const low = Math.min(open, close) - Math.abs(normalRandom(seed + 2)) * volatility * 0.3
  const volume = Math.floor(Math.abs(normalRandom(seed + 3)) * 500000 + 50000)

  return {
    time: Math.floor(timestamp / 1000),
    open: Math.round(open * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    close: Math.round(close * 100) / 100,
    volume,
  }
}

export function getOhlcHistory(symbol: string): OHLCData[] {
  return ohlcHistory[symbol] || []
}

export function appendOhlc(symbol: string, ohlc: OHLCData): void {
  if (!ohlcHistory[symbol]) {
    ohlcHistory[symbol] = []
  }
  ohlcHistory[symbol].push(ohlc)
  if (ohlcHistory[symbol].length > HISTORY_LENGTH + 30) {
    ohlcHistory[symbol] = ohlcHistory[symbol].slice(-HISTORY_LENGTH)
  }
}

export function generateOrderBook(_symbol: string, midPrice: number): OrderBookData {
  const bids: { price: number; size: number; total: number }[] = []
  const asks: { price: number; size: number; total: number }[] = []
  const spread = midPrice * 0.0005
  let bidTotal = 0
  let askTotal = 0

  for (let i = 0; i < ORDER_BOOK_DEPTH; i++) {
    const bidPrice = midPrice - spread * (i + 1) - (Math.random() * spread * 0.5)
    const bidSize = Math.floor(Math.random() * 5000 + 500)
    bidTotal += bidSize
    bids.push({
      price: Math.round(bidPrice * 100) / 100,
      size: bidSize,
      total: bidTotal,
    })

    const askPrice = midPrice + spread * (i + 1) + (Math.random() * spread * 0.5)
    const askSize = Math.floor(Math.random() * 5000 + 500)
    askTotal += askSize
    asks.push({
      price: Math.round(askPrice * 100) / 100,
      size: askSize,
      total: askTotal,
    })
  }

  return {
    bids,
    asks,
    spread: Math.round((asks[0].price - bids[0].price) * 100) / 100,
  }
}

export function generateIndexData(seed: number): IndexData[] {
  return INDICES.map(({ name, basePrice }, i) => {
    const state = indexStates[name]
    const volatility = basePrice * 0.001
    const change = normalRandom(seed + i * 100) * volatility
    state.price = state.price + change

    return {
      name,
      price: Math.round(state.price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round((change / state.price) * 10000) / 100,
    }
  })
}
