import { useState, useCallback, useEffect } from 'react'
import { useAgent } from '../../hooks/useAgent'
import { useStore } from '../../store/store'
import { formatPrice, formatPnl } from '../../data/currencies'
import { agentBridge } from '../../lib/agentBridge'

type Phase = 'idle' | 'scanning' | 'scanned' | 'predicting' | 'analyzing' | 'trading' | 'complete'
type SessionPhase = 'pre_session' | 'trading' | 'complete'

interface ScoredStock {
  symbol: string; score: number; confidence: number
  predicted_return: number; volatility: number; reasons: string[]
}

function PhaseBar({ phase }: { phase: Phase }) {
  const phases: { key: Phase; label: string }[] = [
    { key: 'scanning', label: 'SCAN' },
    { key: 'predicting', label: 'PREDICT' },
    { key: 'analyzing', label: 'ANALYZE' },
    { key: 'trading', label: 'TRADE' },
    { key: 'complete', label: 'DONE' },
  ]
  const currentIdx = phases.findIndex(p => p.key === phase)
  return (
    <div className="flex items-center gap-1 mb-4">
      {phases.map((p, i) => {
        const isActive = i <= currentIdx
        const isCurrent = p.key === phase
        return (
          <div key={p.key} className="flex items-center">
            <div className={`px-2 py-0.5 text-[10px] font-bold tracking-wider border ${
              isCurrent ? 'bg-[var(--yellow)] text-black border-[var(--yellow)]' :
              isActive ? 'border-[var(--border-color)] text-[var(--yellow)]' :
              'border-[var(--border-dim)] text-[var(--text-secondary)]'
            }`}>
              {p.label}
            </div>
            {i < phases.length - 1 && (
              <div className={`w-3 h-px ${i < currentIdx ? 'bg-[var(--border-color)]' : 'bg-[var(--border-dim)]'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function ScanPanel({ onScanned }: { onScanned: (stocks: ScoredStock[]) => void }) {
  const [scanned, setScanned] = useState<ScoredStock[]>([])
  const [loading, setLoading] = useState(false)
  const [count, setCount] = useState(5)
  const [error, setError] = useState('')

  const handleScan = useCallback(() => {
    if (!agentBridge.connected) {
      setError('Not connected to agent server')
      return
    }
    setError('')
    setLoading(true)
    agentBridge.send({ type: 'scan', count, horizon_ticks: 10, horizon_bars: 5 })
    setTimeout(() => setLoading(l => { if (l) setError('Scan timed out'); return false }), 10000)
  }, [count])

  useEffect(() => {
    const unsub = agentBridge.on('scan_result', (data) => {
      const scored = (data.scored as ScoredStock[]) || []
      setScanned(scored)
      setError('')
      setLoading(false)
      if (scored.length > 0) onScanned(scored)
    })
    return unsub
  }, [onScanned])

  return (
    <div className="terminal-panel-dim p-3">
      <div className="section-title">Step 1: Scan Markets</div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-[var(--text-secondary)]">Top N:</span>
        <select value={count} onChange={e => setCount(Number(e.target.value))}
          className="terminal-input w-16 text-[10px] py-1">
          {[3, 5, 10].map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <button onClick={handleScan} disabled={loading}
          className="btn-terminal primary text-[10px] py-1 px-3">
          {loading ? 'Scanning...' : 'Scan'}
        </button>
      </div>
      {error && <div className="text-[10px] text-[var(--red)] mb-2">{error}</div>}
      {scanned.length > 0 && (
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th className="text-right">Score</th>
              <th className="text-right">Confidence</th>
              <th className="text-right">Pred Return</th>
              <th className="text-right">Volatility</th>
              <th>Reasons</th>
            </tr>
          </thead>
          <tbody>
            {scanned.map(s => (
              <tr key={s.symbol}>
                <td className="font-bold text-[var(--yellow)]">{s.symbol}</td>
                <td className="text-right">{s.score.toFixed(3)}</td>
                <td className="text-right">{(s.confidence * 100).toFixed(0)}%</td>
                <td className={`text-right ${s.predicted_return >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {(s.predicted_return * 100).toFixed(2)}%
                </td>
                <td className="text-right text-[var(--text-secondary)]">{(s.volatility * 100).toFixed(1)}%</td>
                <td className="text-[10px] text-[var(--text-secondary)]">{s.reasons.join(', ') || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function PredictionPanel({ symbols: _symbols }: { symbols: string[] }) {
  const [predictions, setPredictions] = useState<Record<string, any>>({})
  const [prices, setPrices] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(false)
  const [horizon, setHorizon] = useState(10)
  const currency = useStore(s => s.prices.activeCurrency)

  const handlePredict = useCallback(() => {
    if (!agentBridge.connected) return
    setLoading(true)
    agentBridge.send({ type: 'scan', count: 10, horizon_ticks: horizon, horizon_bars: 5 })
    setTimeout(() => setLoading(false), 10000)
  }, [horizon])

  useEffect(() => {
    const unsub = agentBridge.on('scan_result', (data) => {
      setPredictions((data.predictions as Record<string, any>) || {})
      setPrices((data.current_prices as Record<string, number>) || {})
      setLoading(false)
    })
    return unsub
  }, [])

  return (
    <div className="terminal-panel-dim p-3">
      <div className="section-title">Step 2: Predict Next {horizon} Min Prices</div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] text-[var(--text-secondary)]">Horizon:</span>
        <select value={horizon} onChange={e => setHorizon(Number(e.target.value))}
          className="terminal-input w-16 text-[10px] py-1">
          {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} min</option>)}
        </select>
        <button onClick={handlePredict} disabled={loading}
          className="btn-terminal primary text-[10px] py-1 px-3">
          {loading ? 'Predicting...' : 'Predict'}
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto">
        <table className="terminal-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Strategy</th>
              <th className="text-right">Current</th>
              <th className="text-right">Predicted</th>
              <th className="text-right">Return</th>
              <th className="text-right">Conf</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(predictions).map(([sym, strats]) =>
              Object.entries(strats as Record<string, any>).map(([sname, pred]) => (
                <tr key={`${sym}-${sname}`}>
                  <td className="font-bold text-[var(--yellow)]">{sym}</td>
                  <td className="text-[10px]">{sname}</td>
                  <td className="text-right text-[var(--text-secondary)]">
                    {prices[sym] ? formatPrice(prices[sym], currency) : '—'}
                  </td>
                  <td className="text-right">
                    <span className={pred.predicted_price_ticks >= (prices[sym] || 0) ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
                      {formatPrice(pred.predicted_price_ticks, currency)}
                    </span>
                  </td>
                  <td className={`text-right ${pred.expected_return >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                    {(pred.expected_return * 100).toFixed(2)}%
                  </td>
                  <td className="text-right">{(pred.confidence * 100).toFixed(0)}%</td>
                </tr>
              ))
            )}
            {Object.keys(predictions).length === 0 && (
              <tr><td colSpan={6} className="text-center text-[var(--text-secondary)] py-4">Run Scan first to see predictions</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SessionPanel() {
  const [active, setActive] = useState(false)
  const [phase, setPhase] = useState<SessionPhase>('pre_session')
  const [duration, setDuration] = useState(600)
  const [preSessionTime, setPreSessionTime] = useState(300)
  const [maxStocks, setMaxStocks] = useState(3)
  const [initialCash, setInitialCash] = useState(100000)
  const [sessionResult, setSessionResult] = useState<any>(null)
  const [status, setStatus] = useState<any>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [preTimeLeft, setPreTimeLeft] = useState(0)
  const currency = useStore(s => s.prices.activeCurrency)

  useEffect(() => {
    const unsubUpdate = agentBridge.on('session_update', (data) => {
      setStatus({ ...data })
      if (data.phase === 'pre_session') setPhase('pre_session')
      else if (data.active) setPhase('trading')
      else setPhase('complete')
      if (data.active !== undefined) setActive(data.active as boolean)
    })
    const unsubResult = agentBridge.on('session_result', (data) => {
      setActive(false)
      setPhase('complete')
      setSessionResult(data)
    })
    return () => { unsubUpdate(); unsubResult() }
  }, [])

  useEffect(() => {
    if (!active) return
    const interval = setInterval(() => agentBridge.sessionStatus(), 2000)
    return () => clearInterval(interval)
  }, [active])

  useEffect(() => {
    if (active && phase === 'pre_session' && status.remaining !== undefined) {
      setPreTimeLeft(status.remaining)
      const timer = setInterval(() => setPreTimeLeft(p => Math.max(0, p - 1)), 1000)
      return () => clearInterval(timer)
    }
  }, [active, phase, status.remaining])

  useEffect(() => {
    if (active && phase === 'trading' && status.remaining !== undefined) {
      setTimeLeft(status.remaining)
      const timer = setInterval(() => setTimeLeft(p => Math.max(0, p - 1)), 1000)
      return () => clearInterval(timer)
    }
  }, [active, phase, status.remaining])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`

  const handleStart = () => {
    agentBridge.sessionStart({ duration, max_stocks: maxStocks, initial_cash: initialCash, pre_session_time: preSessionTime })
    setSessionResult(null)
    setPhase('pre_session')
  }
  const handleStop = () => agentBridge.sessionStop()

  return (
    <div className="terminal-panel-dim p-3">
      <div className="section-title">Step 3: Trading Session</div>

      {!active && !sessionResult && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Pre-session (prediction)</label>
              <select value={preSessionTime} onChange={e => setPreSessionTime(Number(e.target.value))}
                className="w-full terminal-input text-[10px] py-1">
                <option value={300}>5 min</option>
                <option value={600}>10 min</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Trading Duration</label>
              <select value={duration} onChange={e => setDuration(Number(e.target.value) * 60)}
                className="w-full terminal-input text-[10px] py-1">
                <option value={300}>5 min</option>
                <option value={600}>10 min</option>
                <option value={900}>15 min</option>
                <option value={1800}>30 min</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Stocks</label>
              <select value={maxStocks} onChange={e => setMaxStocks(Number(e.target.value))}
                className="w-full terminal-input text-[10px] py-1">
                {[1, 2, 3, 5].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] text-[var(--text-secondary)] block mb-1">Cash</label>
              <input type="number" value={initialCash} onChange={e => setInitialCash(Number(e.target.value))}
                className="w-full terminal-input text-[10px] py-1" />
            </div>
          </div>
          <button onClick={handleStart} className="w-full py-2 bg-[var(--green)] text-black font-bold text-xs">
            Start Session
          </button>
        </div>
      )}

      {active && phase === 'pre_session' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--yellow)] font-bold blink-cursor">PRE-SESSION: Scanning & Predicting...</span>
            <span className="text-lg font-mono font-bold">{formatTime(preTimeLeft)}</span>
          </div>
          <div className="bg-[var(--bg-tertiary)] rounded p-2 text-[10px]">
            <div className="text-[var(--text-secondary)]">Selected Stocks:</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {(status.activeStocks as string[])?.map(s => (
                <span key={s} className="px-2 py-0.5 bg-[var(--bg-secondary)] border border-[var(--border-dim)] text-[10px]">{s}</span>
              )) ?? <span className="text-gray-500">scanning...</span>}
            </div>
          </div>
          <button onClick={handleStop} className="w-full py-1.5 bg-[var(--red)] text-white text-xs">Stop</button>
        </div>
      )}

      {active && phase === 'trading' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[var(--green)] font-bold pulse-dot green">TRADING ACTIVE</span>
            <span className="text-lg font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[var(--bg-tertiary)] rounded p-2">
              <div className="text-[10px] text-[var(--text-secondary)]">Equity</div>
              <div className="text-sm font-bold">{formatPrice(status.equity ?? 0, currency)}</div>
            </div>
            <div className="bg-[var(--bg-tertiary)] rounded p-2">
              <div className="text-[10px] text-[var(--text-secondary)]">P&L</div>
              <div className={`text-sm font-bold ${(status.totalPnl ?? 0) >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {formatPnl(status.totalPnl ?? 0, currency)}
              </div>
            </div>
          </div>
          <div>
            <div className="text-[10px] text-[var(--text-secondary)] mb-1">Active Stocks</div>
            <div className="flex flex-wrap gap-1">
              {(status.activeStocks as string[])?.map(s => (
                <span key={s} className="px-2 py-0.5 bg-[var(--bg-tertiary)] text-[10px]">{s}</span>
              )) ?? <span className="text-[10px] text-gray-500">scanning...</span>}
            </div>
          </div>
          <button onClick={handleStop} className="w-full py-1.5 bg-[var(--red)] text-white text-xs">Stop</button>
        </div>
      )}

      {!active && sessionResult && (
        <div className="space-y-3">
          <div className={`text-center py-3 rounded ${sessionResult.total_pnl >= 0 ? 'bg-green-900/30' : 'bg-red-900/30'}`}>
            <div className="text-2xl font-bold">
              {formatPnl(sessionResult.total_pnl ?? 0, currency)}
            </div>
            <div className="text-[10px] text-[var(--text-secondary)]">
              {sessionResult.total_pnl >= 0 ? `Reward: +${sessionResult.reward?.toFixed(2)}` : `Punishment: -${sessionResult.punishment?.toFixed(2)}`}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[var(--bg-tertiary)] p-2 text-center">
              <div className="text-[10px] text-[var(--text-secondary)]">Trades</div>
              <div className="text-sm font-bold">{sessionResult.total_trades}</div>
            </div>
            <div className="bg-[var(--bg-tertiary)] p-2 text-center">
              <div className="text-[10px] text-[var(--text-secondary)]">Wins</div>
              <div className="text-sm font-bold text-[var(--green)]">{sessionResult.winning_trades}</div>
            </div>
            <div className="bg-[var(--bg-tertiary)] p-2 text-center">
              <div className="text-[10px] text-[var(--text-secondary)]">Win Rate</div>
              <div className="text-sm font-bold">{(sessionResult.win_rate * 100).toFixed(0)}%</div>
            </div>
          </div>
          {sessionResult.retrospective && (
            <div className="bg-[var(--bg-tertiary)] p-2 text-[10px]">{sessionResult.retrospective}</div>
          )}
          {sessionResult.strategy_scores && (
            <div>
              <div className="text-[10px] text-[var(--text-secondary)] mb-1">Strategy Scores</div>
              {Object.entries(sessionResult.strategy_scores as Record<string, number>).map(([n, s]) => (
                <div key={n} className="flex justify-between bg-[var(--bg-tertiary)] p-1.5 text-[10px] mb-1">
                  <span>{n}</span>
                  <span className={s >= 0.6 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{(s * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={handleStart} className="w-full py-2 bg-[var(--green)] text-black font-bold text-xs">New Session</button>
        </div>
      )}
    </div>
  )
}

function ConnectionPanel() {
  const { connected, connecting, error, connect, disconnect } = useAgent()
  const [host, setHost] = useState('localhost:8765')

  return (
    <div className="terminal-panel-dim p-3">
      <div className="section-title">Agent Connection</div>
      {error && <div className="text-[10px] text-[var(--red)] mb-2 bg-[var(--red)]/10 p-2">{error}</div>}
      <div className="flex items-center gap-2">
        <input value={host} onChange={e => setHost(e.target.value)}
          className="flex-1 terminal-input text-xs py-1" placeholder="localhost:8765" />
        {!connected ? (
          <button onClick={() => connect(`ws://${host}`)} disabled={connecting}
            className="btn-terminal primary text-[10px] py-1 px-3">
            {connecting ? '...' : 'Connect'}
          </button>
        ) : (
          <>
            <span className="flex items-center gap-1 text-[10px] text-[var(--green)]">
              <span className="pulse-dot green" /> Connected
            </span>
            <button onClick={disconnect} className="btn-terminal danger text-[10px] py-1 px-2">X</button>
          </>
        )}
      </div>
    </div>
  )
}

function AgentStatus() {
  const { state, lastAction, strategyName } = useAgent()
  const currency = useStore(s => s.prices.activeCurrency)
  return (
    <div className="terminal-panel-dim p-3">
      <div className="section-title">Agent Status</div>
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Strategy</span>
          <span>{strategyName || '—'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Status</span>
          <span className={state.running ? 'text-[var(--green)]' : ''}>{state.running ? 'Running' : 'Idle'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Cash</span>
          <span>{formatPrice(state.cash, currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">P&L</span>
          <span className={state.totalPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
            {formatPnl(state.totalPnl, currency)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--text-secondary)]">Trades</span>
          <span>{state.tradeCount}</span>
        </div>
        {lastAction && (
          <div className="flex justify-between">
            <span className="text-[var(--text-secondary)]">Last</span>
            <span className={lastAction.action === 'buy' ? 'text-[var(--green)]' : lastAction.action === 'sell' ? 'text-[var(--red)]' : ''}>
              {lastAction.action.toUpperCase()}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export function AgentPage() {
  const [connected, setConnected] = useState(false)
  const [phase, setPhase] = useState<Phase>('idle')
  const [scannedStocks, setScannedStocks] = useState<ScoredStock[]>([])

  useEffect(() => {
    const check = () => setConnected(agentBridge.connected)
    check()
    const interval = setInterval(check, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleScanned = useCallback((stocks: ScoredStock[]) => {
    setScannedStocks(stocks)
    setPhase('scanned')
  }, [])

  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--yellow)] glow-yellow blink-cursor">AI TRADING AGENT v2</h2>
          <span className={`text-[10px] ${connected ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
            {connected ? '● ONLINE' : '○ OFFLINE'}
          </span>
        </div>

        <PhaseBar phase={phase} />

        {!connected && (
          <div className="terminal-panel-dim p-4 mb-4 text-center text-xs text-[var(--text-secondary)]">
            <p className="mb-2">Start the Python agent server:</p>
            <code className="bg-[var(--bg-primary)] px-3 py-1.5 text-[10px] border border-[var(--border-dim)]">
              cd F:\AIProjects\TradingAgent &amp;&amp; run.bat
            </code>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4 lg:col-span-2">
            <ScanPanel onScanned={handleScanned} />
            {scannedStocks.length > 0 && (
              <PredictionPanel symbols={scannedStocks.map(s => s.symbol)} />
            )}
            <SessionPanel />
          </div>
          <div className="space-y-4">
            <ConnectionPanel />
            <AgentStatus />
            {scannedStocks.length > 0 && (
              <div className="terminal-panel-dim p-3">
                <div className="section-title">Selected Stocks</div>
                {scannedStocks.map(s => (
                  <div key={s.symbol} className="flex justify-between text-xs py-1 border-b border-[var(--border-dim)] last:border-0">
                    <span className="font-bold text-[var(--yellow)]">{s.symbol}</span>
                    <span className="text-[var(--text-secondary)]">score: {s.score.toFixed(3)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
