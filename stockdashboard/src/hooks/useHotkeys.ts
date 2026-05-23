import { useEffect, useCallback } from 'react'
import { useStore } from '../store/store'

export function useHotkeys() {
  const setActiveSymbol = useStore(s => s.setActiveSymbol)
  const buy = useStore(s => s.buy)
  const sell = useStore(s => s.sell)
  const ticks = useStore(s => s.prices.ticks)
  const activeSymbol = useStore(s => s.prices.activeSymbol)

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      return
    }

    if (e.key === 'b' || e.key === 'B') {
      e.preventDefault()
      const tick = ticks[activeSymbol]
      if (tick) {
        buy(activeSymbol, 10, tick.price)
      }
      return
    }

    if (e.key === 's' || e.key === 'S') {
      e.preventDefault()
      const state = useStore.getState()
      const pos = state.portfolio.positions[activeSymbol]
      if (pos) {
        sell(activeSymbol, pos.quantity, ticks[activeSymbol]?.price || 0)
      }
      return
    }

    if (e.key >= '1' && e.key <= '9') {
      const idx = parseInt(e.key) - 1
      const symbols = useStore.getState().prices.symbols
      if (idx < symbols.length) {
        setActiveSymbol(symbols[idx].symbol)
      }
      return
    }
  }, [activeSymbol, ticks, buy, sell, setActiveSymbol])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])
}