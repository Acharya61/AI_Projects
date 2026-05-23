import { useState, useCallback, useRef, useEffect } from 'react'
import { useAgent } from '../../hooks/useAgent'
import { useStore } from '../../store/store'
import { formatPrice, formatPnl } from '../../data/currencies'
import { agentBridge } from '../../lib/agentBridge'

const STRATEGY_OPTIONS = [
  { value: 'sma', label: 'SMA Crossover' },
  { value: 'rsi', label: 'RSI Reversal' },
  { value: 'momentum', label: 'Momentum Breakout' },
  { value: 'ensemble', label: 'Ensemble (Weighted)' },
]

export function AgentPanel() {
  const [open, setOpen] = useState(false)
  const [host, setHost] = useState('localhost:8765')
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const symbols = useStore(s => s.prices.symbols)
  const activeMarket = useStore(s => s.prices.activeMarket)
  const currency = useStore(s => s.prices.activeCurrency)

  const {
    connected, connecting, error, state, lastAction, strategyName,
    trainProgress, connect, disconnect, startAgent, stopAgent,
    resetAgent, trainAgent,
  } = useAgent()

  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]?.symbol || '')
  const [selectedStrategy, setSelectedStrategy] = useState('ensemble')
  const [fastPeriod, setFastPeriod] = useState(5)
  const [slowPeriod, setSlowPeriod] = useState(20)
  const [epsilon] = useState(0.2)
  const [learningRate] = useState(0.1)
  const [trainEpisodes] = useState(50)

  useEffect(() => {
    if (symbols.length > 0 && !symbols.some(s => s.symbol === selectedSymbol)) {
      setSelectedSymbol(symbols[0].symbol)
    }
  }, [symbols, selectedSymbol])

  const handleStart = useCallback(() => {
    startAgent({
      strategy: selectedStrategy,
      symbol: selectedSymbol,
      fastPeriod,
      slowPeriod,
      epsilon,
      learningRate,
      modelName: 'qagent_v1',
    })
  }, [selectedStrategy, selectedSymbol, fastPeriod, slowPeriod, epsilon, learningRate, startAgent])

  useEffect(() => {
    if (!connected || !open || !state.running) {
      if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null }
      return
    }

    tickRef.current = setInterval(() => {
      const store = useStore.getState()
      const tick = store.prices.ticks[selectedSymbol]
      if (!tick) return

      agentBridge.send({
        type: 'tick',
        price: tick.price,
        open: tick.open,
        high: tick.high,
        low: tick.low,
        volume: tick.volume,
        indicators: {},
      })
    }, 1000)

    return () => { if (tickRef.current) { clearInterval(tickRef.current); tickRef.current = null } }
  }, [connected, open, state.running, selectedSymbol])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`px-3 py-1.5 text-xs font-medium rounded ${
          state.running
            ? 'bg-[var(--green)]/20 text-[var(--green)]'
            : connected
              ? 'bg-[var(--bg-tertiary)] text-[var(--yellow)]'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
        }`}
      >
        {state.running ? 'Agent Active' : connected ? 'Agent Idle' : 'Agent'}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--bg-secondary)] rounded-lg w-[600px] max-h-[90vh] overflow-y-auto p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">AI Trading Agent</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-white text-xl leading-none">&times;</button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <input
                value={host}
                onChange={e => setHost(e.target.value)}
                className="flex-1 bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-xs outline-none border border-transparent focus:border-gray-500"
                placeholder="localhost:8765"
              />
              {!connected ? (
                <button
                  onClick={() => connect(`ws://${host}`)}
                  disabled={connecting}
                  className="px-3 py-1.5 rounded bg-[var(--yellow)] text-black font-semibold text-xs hover:opacity-90 disabled:opacity-40"
                >
                  {connecting ? 'Connecting...' : 'Connect'}
                </button>
              ) : (
                <button
                  onClick={disconnect}
                  className="px-3 py-1.5 rounded bg-[var(--red)]/20 text-[var(--red)] text-xs hover:bg-[var(--red)]/30"
                >
                  Disconnect
                </button>
              )}
            </div>

            {error && (
              <div className="text-xs text-[var(--red)] mb-3 bg-[var(--red)]/10 rounded px-3 py-2">{error}</div>
            )}

            {connected && (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] text-[var(--text-secondary)] bg-[var(--bg-tertiary)] px-2 py-0.5 rounded">
                    Market: {activeMarket}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 mb-4">
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] block mb-1">Symbol</label>
                    <select value={selectedSymbol} onChange={e => setSelectedSymbol(e.target.value)}
                      className="bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500">
                      {symbols.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-[var(--text-secondary)] block mb-1">Strategy</label>
                    <select value={selectedStrategy} onChange={e => setSelectedStrategy(e.target.value)}
                      className="bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500">
                      {STRATEGY_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                  </div>
                  {selectedStrategy === 'sma' && (
                    <>
                      <div>
                        <label className="text-xs text-[var(--text-secondary)] block mb-1">Fast SMA</label>
                        <input type="number" value={fastPeriod} onChange={e => setFastPeriod(Number(e.target.value))}
                          className="w-16 bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500" />
                      </div>
                      <div>
                        <label className="text-xs text-[var(--text-secondary)] block mb-1">Slow SMA</label>
                        <input type="number" value={slowPeriod} onChange={e => setSlowPeriod(Number(e.target.value))}
                          className="w-16 bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500" />
                      </div>
                    </>
                  )}
                </div>

                <div className="flex gap-2 mb-4">
                  {!state.running ? (
                    <button onClick={handleStart}
                      className="px-4 py-1.5 rounded bg-[var(--green)] text-black font-semibold text-sm hover:opacity-90">Start Agent</button>
                  ) : (
                    <button onClick={stopAgent}
                      className="px-4 py-1.5 rounded bg-[var(--red)] text-white font-semibold text-sm hover:opacity-90">Stop Agent</button>
                  )}
                  <button onClick={() => resetAgent(100000)}
                    className="px-3 py-1.5 rounded bg-[var(--bg-tertiary)] text-xs hover:bg-gray-700">Reset</button>
                  <button onClick={() => trainAgent(trainEpisodes)}
                    className="px-3 py-1.5 rounded bg-[var(--yellow)]/20 text-[var(--yellow)] text-xs hover:bg-[var(--yellow)]/30">Train ({trainEpisodes})</button>
                </div>

                {trainProgress && (
                  <div className="mb-4 bg-[var(--bg-tertiary)] rounded px-3 py-2">
                    <div className="text-xs text-[var(--yellow)]">Training... {trainProgress.episode}/{trainProgress.total}</div>
                    <div className="w-full bg-[var(--bg-primary)] h-1.5 rounded mt-1">
                      <div className="bg-[var(--yellow)] h-1.5 rounded" style={{ width: `${(trainProgress.episode / trainProgress.total) * 100}%` }} />
                    </div>
                  </div>
                )}

                <div className="bg-[var(--bg-tertiary)] rounded p-3 text-xs space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Strategy</span><span>{strategyName || '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Status</span>
                    <span className={state.running ? 'text-[var(--green)]' : ''}>{state.running ? 'Running' : 'Idle'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Cash</span><span>{formatPrice(state.cash, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Position</span><span>{state.position} shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Total P&L</span>
                    <span className={state.totalPnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{formatPnl(state.totalPnl, currency)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--text-secondary)]">Trades</span><span>{state.tradeCount}</span>
                  </div>
                  {lastAction && (
                    <div className="flex justify-between">
                      <span className="text-[var(--text-secondary)]">Last Action</span>
                      <span className={lastAction.action === 'buy' ? 'text-[var(--green)]' : lastAction.action === 'sell' ? 'text-[var(--red)]' : ''}>
                        {lastAction.action.toUpperCase()}
                        {lastAction.quantity > 0 ? ` ${lastAction.quantity}` : ''}
                        <span className="text-[var(--text-secondary)] ml-1">({lastAction.reason})</span>
                      </span>
                    </div>
                  )}
                </div>

                {state.trades.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-1">Recent Trades</h4>
                    <div className="max-h-32 overflow-y-auto text-xs">
                      {state.trades.map((t, i) => (
                        <div key={i} className="flex justify-between px-2 py-1 hover:bg-gray-800/30">
                          <span className={t.side === 'buy' ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{t.side.toUpperCase()}</span>
                          <span>{t.quantity} @ {formatPrice(t.price, currency)}</span>
                          <span className={t.pnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>{formatPnl(t.pnl, currency)}</span>
                          <span className="text-[var(--text-secondary)]">{t.reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {!connected && !connecting && !error && (
              <div className="text-center py-6 text-sm text-[var(--text-secondary)]">
                <p className="mb-2">Start the Python agent server first:</p>
                <code className="bg-[var(--bg-primary)] px-3 py-1.5 rounded text-xs">cd F:\AIProjects\TradingAgent && run.bat</code>
                <p className="mt-2 text-xs">Then click <span className="text-[var(--yellow)]">Connect</span></p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}