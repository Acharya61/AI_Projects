import { useState, useEffect } from 'react'
import { SYMBOLS } from '../../lib/constants'

function TickerTape() {
  return (
    <div className="ticker-tape flex-1 mx-4">
      <div className="ticker-tape-inner">
        {[...Array(3)].map((_, i) => (
          SYMBOLS.map(s => (
            <span key={`${s.symbol}-${i}`} className="mx-3 text-xs">
              <span className="text-[var(--yellow)]">{s.symbol}</span>
              <span className="ml-1 text-[var(--text-secondary)]">
                ${(100 + Math.random() * 900).toFixed(2)}
              </span>
              <span className={`ml-1 ${Math.random() > 0.5 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {Math.random() > 0.5 ? '▲' : '▼'} {(Math.random() * 3).toFixed(2)}%
              </span>
            </span>
          ))
        ))}
      </div>
    </div>
  )
}

function MarketClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const h = time.getHours()
  const isOpen = h >= 9 && h < 16
  return (
    <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)] shrink-0">
      <span className="pulse-dot green" />
      <span className={isOpen ? 'text-[var(--green)]' : 'text-[var(--yellow)]'}>
        {isOpen ? 'OPEN' : 'CLOSED'}
      </span>
      <span>{time.toLocaleTimeString()}</span>
    </div>
  )
}

export function TopBar() {
  return (
    <div className="h-9 shrink-0 bg-[var(--bg-secondary)] border-b border-[var(--border-dim)] flex items-center px-4 gap-2">
      <span className="text-xs font-bold text-[var(--cyan)] blink-cursor shrink-0">LIVE</span>
      <TickerTape />
      <MarketClock />
    </div>
  )
}
