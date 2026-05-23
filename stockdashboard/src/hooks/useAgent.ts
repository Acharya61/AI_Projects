import { useState, useEffect, useCallback, useRef } from 'react'
import { agentBridge } from '../lib/agentBridge'
import type { AgentConfig, AgentState, AgentAction } from '../lib/agentTypes'

const DEFAULT_STATE: AgentState = {
  symbol: '',
  running: false,
  cash: 100000,
  position: 0,
  entryPrice: 0,
  totalPnl: 0,
  tradeCount: 0,
  trades: [],
}

export function useAgent() {
  const [connected, setConnected] = useState(false)
  const [state, setState] = useState<AgentState>(DEFAULT_STATE)
  const [lastAction, setLastAction] = useState<AgentAction | null>(null)
  const [trainProgress, setTrainProgress] = useState<{ episode: number; total: number } | null>(null)
  const [strategyName, setStrategyName] = useState('')
  const [connecting, setConnecting] = useState(false)
  const [error, setError] = useState('')
  const tickIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const unsubStatus = agentBridge.on('status', (msg) => {
      const data = msg.agent as AgentState | undefined
      if (data) {
        setState({
          symbol: data.symbol || '',
          running: data.running || false,
          cash: data.cash ?? 100000,
          position: data.position ?? 0,
          entryPrice: data.entryPrice ?? 0,
          totalPnl: data.totalPnl ?? 0,
          tradeCount: data.tradeCount ?? 0,
          trades: data.trades || [],
        })
      }
      if (msg.strategy) setStrategyName(msg.strategy as string)
    })

    const unsubTickResult = agentBridge.on('tick_result', (msg) => {
      const actions = msg.actions as AgentAction[] | undefined
      if (actions && actions.length > 0) {
        setLastAction(actions[actions.length - 1])
      }
      const data = msg.agent as AgentState | undefined
      if (data) {
        setState({
          symbol: data.symbol || '',
          running: data.running ?? false,
          cash: data.cash ?? 100000,
          position: data.position ?? 0,
          entryPrice: data.entryPrice ?? 0,
          totalPnl: data.totalPnl ?? 0,
          tradeCount: data.tradeCount ?? 0,
          trades: data.trades || [],
        })
      }
    })

    const unsubTrainProgress = agentBridge.on('train_progress', (msg) => {
      setTrainProgress({
        episode: msg.episode as number,
        total: msg.total as number,
      })
    })

    const unsubTrainComplete = agentBridge.on('train_complete', () => {
      setTrainProgress(null)
    })

    const unsubError = agentBridge.on('error', (msg) => {
      setError(msg.message as string)
    })

    return () => {
      unsubStatus()
      unsubTickResult()
      unsubTrainProgress()
      unsubTrainComplete()
      unsubError()
    }
  }, [])

  const connect = useCallback(async (url: string = 'ws://localhost:8765') => {
    setConnecting(true)
    setError('')
    try {
      await agentBridge.connect(url)
      setConnected(true)
      agentBridge.getStatus()
    } catch {
      setError('Could not connect to agent server')
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnect = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current)
      tickIntervalRef.current = null
    }
    agentBridge.disconnect()
    setConnected(false)
    setState(DEFAULT_STATE)
    setLastAction(null)
  }, [])

  const startAgent = useCallback((config: AgentConfig) => {
    if (!agentBridge.connected) return
    agentBridge.start(config)
    setTrainProgress(null)
  }, [])

  const stopAgent = useCallback(() => {
    agentBridge.stop()
  }, [])

  const resetAgent = useCallback((cash?: number) => {
    agentBridge.reset(cash)
  }, [])

  const trainAgent = useCallback((episodes: number = 50) => {
    agentBridge.train(episodes)
  }, [])

  const sendTick = useCallback((data: { price: number; open: number; high: number; low: number; volume: number; indicators?: Record<string, number> }) => {
    agentBridge.tick(data)
  }, [])

  return {
    connected,
    connecting,
    error,
    state,
    lastAction,
    strategyName,
    trainProgress,
    connect,
    disconnect,
    startAgent,
    stopAgent,
    resetAgent,
    trainAgent,
    sendTick,
  }
}
