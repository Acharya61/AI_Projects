import { useEffect, useCallback, useState } from 'react'
import type { SessionConfig, SessionStatus, SessionResult, StrategyPerformance } from '../lib/agentTypes'
import { agentBridge } from '../lib/agentBridge'

interface SessionState {
  active: boolean
  status: SessionStatus
  result: SessionResult | null
  performance: StrategyPerformance
}

export function useSession() {
  const [state, setState] = useState<SessionState>({
    active: false,
    status: { active: false },
    result: null,
    performance: {},
  })

  useEffect(() => {
    const unsub1 = agentBridge.on('session_update', (data) => {
      const status = data as unknown as SessionStatus
      setState(s => ({ ...s, status, active: status.active ?? false }))
    })

    const unsub2 = agentBridge.on('session_result', (data) => {
      const result: SessionResult = {
        totalPnl: data.total_pnl as number,
        totalTrades: data.total_trades as number,
        winningTrades: data.winning_trades as number,
        losingTrades: data.losing_trades as number,
        winRate: data.win_rate as number,
        reward: data.reward as number,
        punishment: data.punishment as number,
        retrospective: data.retrospective as string,
        strategyScores: data.strategy_scores as Record<string, number>,
        trades: (data.trades as any[])?.map(t => ({
          symbol: t.symbol,
          side: t.side,
          quantity: t.quantity,
          entryPrice: t.entry_price,
          exitPrice: t.exit_price,
          pnl: t.pnl,
        })) || [],
      }
      setState(s => ({ ...s, active: false, result }))
    })

    const unsub3 = agentBridge.on('performance_data', (data) => {
      const perf = data.data as StrategyPerformance
      if (perf) {
        setState(s => ({ ...s, performance: perf }))
      }
    })

    return () => {
      unsub1()
      unsub2()
      unsub3()
    }
  }, [])

  const startSession = useCallback((config: SessionConfig) => {
    setState(s => ({ ...s, result: null }))
    agentBridge.sessionStart({
      duration: config.duration,
      max_stocks: config.maxStocks,
      initial_cash: config.initialCash,
      horizon_ticks: config.horizonTicks ?? 10,
      horizon_bars: config.horizonBars ?? 5,
    })
  }, [])

  const stopSession = useCallback(() => {
    agentBridge.sessionStop()
  }, [])

  const refreshStatus = useCallback(() => {
    agentBridge.sessionStatus()
  }, [])

  const refreshPerformance = useCallback(() => {
    agentBridge.getPerformance()
  }, [])

  return {
    ...state,
    startSession,
    stopSession,
    refreshStatus,
    refreshPerformance,
  }
}
