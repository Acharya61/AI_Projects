import { useState, useEffect } from 'react'
import { useSession } from '../../hooks/useSession'
import { useStore } from '../../store/store'
import { formatPrice, formatPnl } from '../../data/currencies'

export function SessionPanel() {
  const [open, setOpen] = useState(false)
  const currency = useStore(s => s.prices.activeCurrency)
  const {
    active,
    status,
    result,
    startSession,
    stopSession,
    refreshStatus,
    refreshPerformance,
  } = useSession()

  const [duration, setDuration] = useState(600)
  const [maxStocks, setMaxStocks] = useState(3)
  const [initialCash, setInitialCash] = useState(100000)
  const [timeLeft, setTimeLeft] = useState(0)

  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      if (active) {
        refreshStatus()
      }
      refreshPerformance()
    }, 2000)
    return () => clearInterval(interval)
  }, [open, active, refreshStatus, refreshPerformance])

  useEffect(() => {
    if (active && status.remaining !== undefined) {
      setTimeLeft(status.remaining)
      const timer = setInterval(() => {
        setTimeLeft(prev => Math.max(0, prev - 1))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [active, status.remaining])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = Math.floor(seconds % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleStart = () => {
    startSession({ duration, maxStocks, initialCash })
  }

  const handleStop = () => {
    stopSession()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
          active
            ? 'bg-[var(--green)] text-black animate-pulse'
            : 'bg-[var(--bg-tertiary)] hover:bg-gray-600'
        }`}
      >
        {active ? 'Session Live' : 'Session'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-[700px] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <h2 className="text-base font-bold">Trading Session</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {!active && !result && (
                <div className="space-y-4">
                  <h3 className="text-sm text-[var(--text-secondary)]">Configure and start a trading session</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] block mb-1">Duration (min)</label>
                      <select value={duration} onChange={e => setDuration(Number(e.target.value) * 60)}
                        className="w-full bg-[var(--bg-tertiary)] text-white px-3 py-2 rounded text-sm">
                        <option value={300}>5 min</option>
                        <option value={600}>10 min</option>
                        <option value={900}>15 min</option>
                        <option value={1800}>30 min</option>
                        <option value={3600}>1 hour</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] block mb-1">Max Stocks</label>
                      <select value={maxStocks} onChange={e => setMaxStocks(Number(e.target.value))}
                        className="w-full bg-[var(--bg-tertiary)] text-white px-3 py-2 rounded text-sm">
                        {[1, 2, 3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-[var(--text-secondary)] block mb-1">Initial Cash</label>
                      <input type="number" value={initialCash} onChange={e => setInitialCash(Number(e.target.value))}
                        className="w-full bg-[var(--bg-tertiary)] text-white px-3 py-2 rounded text-sm" />
                    </div>
                  </div>
                  <button onClick={handleStart}
                    className="w-full py-3 bg-[var(--green)] text-black font-bold rounded hover:opacity-90 text-sm">
                    Start Session
                  </button>
                </div>
              )}

              {active && status && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-[var(--green)]">Session Active</h3>
                    <span className="text-2xl font-mono font-bold">{formatTime(timeLeft)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[var(--bg-tertiary)] rounded p-3">
                      <div className="text-xs text-[var(--text-secondary)]">Equity</div>
                      <div className="text-lg font-bold">{formatPrice(status.equity ?? 0, currency)}</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded p-3">
                      <div className="text-xs text-[var(--text-secondary)]">Total P&L</div>
                      <div className={`text-lg font-bold ${(status.totalPnl ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                        {formatPnl(status.totalPnl ?? 0, currency)}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded p-3">
                      <div className="text-xs text-[var(--text-secondary)]">Cash</div>
                      <div className="text-lg font-bold">{formatPrice(status.cash ?? 0, currency)}</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded p-3">
                      <div className="text-xs text-[var(--text-secondary)]">Trades</div>
                      <div className="text-lg font-bold">{status.tradeCount ?? 0}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-[var(--text-secondary)] mb-2">Active Stocks</h4>
                    <div className="flex flex-wrap gap-2">
                      {status.activeStocks?.map(s => (
                        <span key={s} className="px-3 py-1 bg-[var(--bg-tertiary)] rounded text-xs font-medium">{s}</span>
                      )) ?? <span className="text-xs text-gray-500">Scanning...</span>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-[var(--text-secondary)] mb-2">Positions</h4>
                    {status.positions && Object.keys(status.positions).length > 0 ? (
                      <div className="space-y-2">
                        {Object.entries(status.positions).map(([sym, pos]) => (
                          <div key={sym} className="bg-[var(--bg-tertiary)] rounded px-3 py-2 flex justify-between text-xs">
                            <span className="font-medium">{sym}</span>
                            <span>{pos.quantity} shares @ {formatPrice(pos.avgEntry, currency)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No open positions</p>
                    )}
                  </div>

                  <button onClick={handleStop}
                    className="w-full py-3 bg-[var(--red)] text-white font-bold rounded hover:opacity-90 text-sm">
                    Stop Session
                  </button>
                </div>
              )}

              {!active && result && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold">Session Complete</h3>

                  <div className={`text-center py-6 rounded ${result.totalPnl >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
                    <div className="text-3xl font-bold mb-1">
                      {formatPnl(result.totalPnl, currency)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)]">
                      {result.totalPnl >= 0
                        ? `Reward: +${result.reward.toFixed(2)}`
                        : `Punishment: -${result.punishment.toFixed(2)}`
                      }
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[var(--bg-tertiary)] rounded p-2 text-center">
                      <div className="text-xs text-[var(--text-secondary)]">Trades</div>
                      <div className="text-sm font-bold">{result.totalTrades}</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded p-2 text-center">
                      <div className="text-xs text-[var(--text-secondary)]">Wins</div>
                      <div className="text-sm font-bold text-[var(--green)]">{result.winningTrades}</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded p-2 text-center">
                      <div className="text-xs text-[var(--text-secondary)]">Losses</div>
                      <div className="text-sm font-bold text-[var(--red)]">{result.losingTrades}</div>
                    </div>
                    <div className="bg-[var(--bg-tertiary)] rounded p-2 text-center">
                      <div className="text-xs text-[var(--text-secondary)]">Win Rate</div>
                      <div className="text-sm font-bold">{(result.winRate * 100).toFixed(0)}%</div>
                    </div>
                  </div>

                  <div className="bg-[var(--bg-tertiary)] rounded p-3">
                    <div className="text-xs text-[var(--text-secondary)] mb-1">Retrospective</div>
                    <p className="text-sm">{result.retrospective}</p>
                  </div>

                  <div>
                    <h4 className="text-xs text-[var(--text-secondary)] mb-2">Strategy Scores</h4>
                    <div className="space-y-2">
                      {Object.entries(result.strategyScores).map(([name, score]) => (
                        <div key={name} className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded px-3 py-2">
                          <span className="text-xs font-medium">{name}</span>
                          <span className={`text-xs font-bold ${score >= 0.6 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                            {(score * 100).toFixed(0)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs text-[var(--text-secondary)] mb-2">Trade Breakdown</h4>
                    {result.trades.length > 0 ? (
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {result.trades.map((t, i) => (
                          <div key={i} className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded px-3 py-1.5 text-xs">
                            <span className="font-medium w-12">{t.symbol}</span>
                            <span className={t.side === 'sell' ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{t.side}</span>
                            <span>{t.quantity} @ {formatPrice(t.entryPrice, currency)} &rarr; {formatPrice(t.exitPrice, currency)}</span>
                            <span className={t.pnl >= 0 ? 'text-[var(--green)] font-bold' : 'text-[var(--red)] font-bold'}>
                              {formatPnl(t.pnl, currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500">No trades executed</p>
                    )}
                  </div>

                  <button onClick={handleStart}
                    className="w-full py-3 bg-[var(--green)] text-black font-bold rounded hover:opacity-90 text-sm">
                    Start New Session
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
