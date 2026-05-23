export interface OHLCData {
  time: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TickData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  prevClose: number
}

export interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  price: number
  total: number
  timestamp: number
}

export interface Position {
  symbol: string
  quantity: number
  avgEntry: number
}

export interface OrderBookLevel {
  price: number
  size: number
  total: number
}

export interface OrderBookData {
  bids: OrderBookLevel[]
  asks: OrderBookLevel[]
  spread: number
}

export interface IndicatorValues {
  sma20: number | null
  sma50: number | null
  ema12: number | null
  ema26: number | null
  rsi14: number | null
}

export interface BacktestAction {
  type: 'buy' | 'sell' | 'close'
  quantity?: number
  reason?: string
}

export interface BacktestTrade {
  entryTime: number
  entryPrice: number
  exitTime: number
  exitPrice: number
  quantity: number
  pnl: number
  pnlPercent: number
  side: 'long' | 'short'
  reason: string
}

export interface BacktestResult {
  symbol: string
  strategyName: string
  totalReturn: number
  totalReturnPercent: number
  sharpeRatio: number
  maxDrawdown: number
  maxDrawdownPercent: number
  winRate: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  avgWin: number
  avgLoss: number
  equityCurve: { time: number; equity: number }[]
  trades: BacktestTrade[]
  startCash: number
  endCash: number
}

export interface StrategyParam {
  key: string
  label: string
  default: number
  min?: number
  max?: number
  step?: number
}

export interface StrategyDef {
  name: string
  description: string
  params: StrategyParam[]
  onBar: (barIndex: number, prices: OHLCData[], _indicators: IndicatorValues[], state: { cash: number; position: number; entryPrice: number }, params: Record<string, number>) => BacktestAction | null
}

export interface IndexData {
  name: string
  price: number
  change: number
  changePercent: number
}
