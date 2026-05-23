import { useEffect } from 'react'
import { useStore } from '../store/store'
import { TICK_INTERVAL_MS } from '../lib/constants'

export function useStockData() {
  const initialized = useStore(s => s.initialized)
  const init = useStore(s => s.init)
  const tick = useStore(s => s.tick)
  const ticks = useStore(s => s.prices.ticks)
  const activeSymbol = useStore(s => s.prices.activeSymbol)

  useEffect(() => {
    init()
  }, [init])

  useEffect(() => {
    if (!initialized) return
    const interval = setInterval(() => tick(Date.now()), TICK_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [initialized, tick])

  return { ticks, activeSymbol, initialized }
}
