import { useEffect, useCallback } from 'react'
import { create } from 'zustand'
import type { PredictionResult, StrategyPerformance } from '../lib/agentTypes'
import { agentBridge } from '../lib/agentBridge'

interface PredictionStore {
  predictions: Record<string, PredictionResult>
  performance: StrategyPerformance
  lastSymbol: string
  setPredictions: (symbol: string, preds: PredictionResult) => void
  setPerformance: (perf: StrategyPerformance) => void
  setLastSymbol: (symbol: string) => void
}

const usePredictionStore = create<PredictionStore>((set) => ({
  predictions: {},
  performance: {},
  lastSymbol: '',
  setPredictions: (symbol, preds) =>
    set(s => ({ predictions: { ...s.predictions, [symbol]: preds }, lastSymbol: symbol })),
  setPerformance: (perf) => set({ performance: perf }),
  setLastSymbol: (symbol) => set({ lastSymbol: symbol }),
}))

export function usePredictions() {
  const store = usePredictionStore()

  useEffect(() => {
    const unsub1 = agentBridge.on('prediction_result', (data) => {
      const symbol = data.symbol as string
      const predictions = data.predictions as PredictionResult
      if (symbol && predictions) {
        store.setPredictions(symbol, predictions)
      }
    })

    const unsub2 = agentBridge.on('performance_data', (data) => {
      const perf = data.data as StrategyPerformance
      if (perf) {
        store.setPerformance(perf)
      }
    })

    return () => {
      unsub1()
      unsub2()
    }
  }, [])

  const requestPrediction = useCallback((symbol: string, horizonTicks = 10, horizonBars = 5) => {
    agentBridge.predict(symbol, horizonTicks, horizonBars)
  }, [])

  const requestAllPredictions = useCallback((horizonTicks = 10, horizonBars = 5) => {
    agentBridge.predictAll(horizonTicks, horizonBars)
  }, [])

  const requestPerformance = useCallback(() => {
    agentBridge.getPerformance()
  }, [])

  return {
    predictions: store.predictions,
    performance: store.performance,
    lastSymbol: store.lastSymbol,
    requestPrediction,
    requestAllPredictions,
    requestPerformance,
  }
}
