import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useStore } from '../../store/store'

export function StatusBar() {
  const location = useLocation()
  const ticks = useStore(s => s.prices.ticks)
  const [time, setTime] = useState(new Date())
  const [wsStatus, setWsStatus] = useState('Disconnected')

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      const bridge = (window as any).agentBridge
      if (bridge) {
        const check = () => setWsStatus(bridge.connected ? 'Connected' : 'Disconnected')
        check()
        const interval = setInterval(check, 3000)
        return () => clearInterval(interval)
      }
    } catch { /* ignore */ }
  }, [])

  const symbolsCount = Object.keys(ticks).length
  const path = location.pathname
  const isAgent = path === '/agent'

  return (
    <footer className="flex items-center h-6 px-4 bg-[var(--bg-secondary)] border-t border-[var(--border-dim)] text-[10px] text-[var(--text-secondary)] shrink-0">
      <div className="flex items-center gap-4">
        <span>
          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${
            wsStatus === 'Connected' ? 'bg-[var(--green)]' : 'bg-[var(--red)]'
          }`} />
          WS: {wsStatus}
        </span>
        <span>Symbols: {symbolsCount}</span>
        <span>{time.toLocaleTimeString()}</span>
      </div>
      <div className="ml-auto flex items-center gap-3">
        {!isAgent && <span>Hotkeys: 1-9=Symbols B=Buy S=Sell</span>}
        {isAgent && <span>AI Agent v2 | Multi-Stock | Sessions</span>}
        <span className="text-gray-600">|</span>
        <span>StockDash</span>
      </div>
    </footer>
  )
}
