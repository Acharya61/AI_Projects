export interface AgentConfig {
  strategy: string
  symbol: string
  fastPeriod?: number
  slowPeriod?: number
  learningRate?: number
  epsilon?: number
  modelName?: string
}

export interface AgentState {
  symbol: string
  running: boolean
  cash: number
  position: number
  entryPrice: number
  totalPnl: number
  tradeCount: number
  trades: AgentTrade[]
  trackedSymbols?: string[]
  positions?: Record<string, { quantity: number; avgEntry: number }>
}

export interface AgentTrade {
  side: string
  quantity: number
  price: number
  pnl: number
  reason: string
}

export interface AgentAction {
  action: 'buy' | 'sell' | 'hold'
  symbol?: string
  quantity: number
  confidence: number
  reason: string
}

export interface WsMessage {
  type: string
  [key: string]: unknown
}

export interface PredictionResult {
  [strategy: string]: {
    predicted_price_ticks: number
    predicted_price_bars: number
    expected_return: number
    confidence: number
    accuracy: number
  }
}

export interface StrategyPerformance {
  [strategy: string]: {
    [symbol: string]: {
      predictions: number
      correct: number
      accuracy: number
      pnl: number
      total_pnl: number
      avg_return: number
    }
  }
}

export interface SessionConfig {
  duration: number
  maxStocks?: number
  initialCash?: number
  horizonTicks?: number
  horizonBars?: number
  preSessionTime?: number
}

export interface SessionStatus {
  active: boolean
  elapsed?: number
  remaining?: number
  activeStocks?: string[]
  positions?: Record<string, { quantity: number; avgEntry: number }>
  equity?: number
  cash?: number
  totalPnl?: number
  tradeCount?: number
}

export interface SessionResult {
  totalPnl: number
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  reward: number
  punishment: number
  retrospective: string
  strategyScores: Record<string, number>
  trades: {
    symbol: string
    side: string
    quantity: number
    entryPrice: number
    exitPrice: number
    pnl: number
  }[]
}

export interface PredictionRequest {
  symbol: string
  horizonTicks?: number
  horizonBars?: number
}
