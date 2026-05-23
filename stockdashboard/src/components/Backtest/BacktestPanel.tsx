import { useState, useCallback } from 'react'
import { useStore } from '../../store/store'
import { STRATEGIES } from '../../lib/strategies'
import { runBacktest } from '../../lib/backtest'
import type { BacktestResult, StrategyParam } from '../../lib/types'
import { formatPrice, formatPnl } from '../../data/currencies'

function EquityCurve({ curve }: { curve: { time: number; equity: number }[] }) {
  if (curve.length < 2) return <div className="text-xs text-[var(--text-secondary)] py-4 text-center">Not enough data</div>

  const values = curve.map(p => p.equity)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const w = 500
  const h = 160
  const points = curve.map((p, i) => {
    const x = (i / (curve.length - 1)) * w
    const y = h - ((p.equity - min) / range) * h
    return `${x},${y}`
  }).join(' ')

  const startVal = values[0]
  const endVal = values[values.length - 1]
  const color = endVal >= startVal ? 'var(--green)' : 'var(--red)'

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
      <polyline fill={`color-mix(in srgb, ${color} 10%, transparent)`} points={points} stroke="none" strokeLinecap="round" strokeLinejoin="round"
        transform={`translate(0, 0) ${`M${points.split(' ')[0]}L${points.split(' ')[0]}L0,${h}Z`}`}
      />
      <polyline fill="none" stroke={color} strokeWidth="2" points={points} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MetricCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[var(--bg-tertiary)] rounded p-2.5">
      <div className="text-xs text-[var(--text-secondary)]">{label}</div>
      <div className={`text-base font-bold ${color || ''}`}>{value}</div>
    </div>
  )
}

function ResultsView({ result, currency }: { result: BacktestResult; currency: string }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-2">
        <MetricCard label="Total Return" value={formatPrice(result.totalReturn, currency)} color={result.totalReturn >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'} />
        <MetricCard label="Return %" value={`${result.totalReturnPercent >= 0 ? '+' : ''}${result.totalReturnPercent.toFixed(2)}%`} color={result.totalReturnPercent >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'} />
        <MetricCard label="Sharpe Ratio" value={result.sharpeRatio.toFixed(2)} />
        <MetricCard label="Max Drawdown" value={`${result.maxDrawdownPercent.toFixed(1)}%`} color="text-[var(--red)]" />
        <MetricCard label="Win Rate" value={`${result.winRate.toFixed(0)}%`} color={result.winRate >= 50 ? 'text-[var(--green)]' : 'text-[var(--red)]'} />
        <MetricCard label="Total Trades" value={result.totalTrades.toString()} />
        <MetricCard label="Avg Win" value={formatPrice(result.avgWin, currency)} color="text-[var(--green)]" />
        <MetricCard label="Avg Loss" value={`-${formatPrice(result.avgLoss, currency)}`} color="text-[var(--red)]" />
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Equity Curve</h4>
        <div className="bg-[var(--bg-primary)] rounded p-3">
          <EquityCurve curve={result.equityCurve} />
        </div>
      </div>

      {result.trades.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-wide mb-2">Trades ({result.trades.length})</h4>
          <div className="max-h-40 overflow-y-auto text-xs">
            <div className="grid grid-cols-6 text-[var(--text-secondary)] px-2 py-1 border-b border-gray-800 font-medium">
              <span>Entry</span>
              <span>Exit</span>
              <span className="text-right">Entry $</span>
              <span className="text-right">Exit $</span>
              <span className="text-right">P&L</span>
              <span>Reason</span>
            </div>
            {result.trades.map((t, i) => (
              <div key={i} className="grid grid-cols-6 px-2 py-1 hover:bg-gray-800/30">
                <span>{new Date(t.entryTime * 1000).toLocaleDateString()}</span>
                <span>{new Date(t.exitTime * 1000).toLocaleDateString()}</span>
                <span className="text-right">{formatPrice(t.entryPrice, currency)}</span>
                <span className="text-right">{formatPrice(t.exitPrice, currency)}</span>
                <span className={`text-right ${t.pnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {formatPnl(t.pnl, currency)}
                </span>
                <span className="truncate text-[var(--text-secondary)]">{t.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export function BacktestPanel() {
  const [open, setOpen] = useState(false)
  const [symbol, setSymbol] = useState('')
  const [strategyIdx, setStrategyIdx] = useState(0)
  const [strategyParams, setStrategyParams] = useState<Record<string, number>>({})
  const [result, setResult] = useState<BacktestResult | null>(null)
  const [running, setRunning] = useState(false)

  const symbols = useStore(s => s.prices.symbols)
  const history = useStore(s => s.prices.history)
  const currency = useStore(s => s.prices.activeCurrency)

  const resolvedSymbol = symbol || symbols[0]?.symbol || ''

  const strategy = STRATEGIES[strategyIdx]

  const handleStrategyChange = useCallback((idx: number) => {
    setStrategyIdx(idx)
    setStrategyParams({})
    setResult(null)
  }, [])

  const handleParamChange = useCallback((key: string, value: number) => {
    setStrategyParams(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleRun = useCallback(() => {
    const prices = history[resolvedSymbol]
    if (!prices || prices.length < 10) return

    setRunning(true)
    setResult(null)

    const params: Record<string, number> = {}
    for (const p of strategy.params) {
      params[p.key] = strategyParams[p.key] ?? p.default
    }

    setTimeout(() => {
      const res = runBacktest(
        symbol,
        strategy.name,
        params,
        strategy.onBar,
        prices,
      )
      setResult(res)
      setRunning(false)
    }, 50)
  }, [resolvedSymbol, strategy, strategyParams, history])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[var(--text-secondary)] hover:text-white px-3 py-1 rounded bg-[var(--bg-tertiary)]"
      >
        Backtest
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--bg-secondary)] rounded-lg w-[700px] max-h-[90vh] overflow-y-auto p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Backtest Engine</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-white text-xl leading-none">&times;</button>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1">Symbol</label>
                <select
                  value={resolvedSymbol}
                  onChange={e => setSymbol(e.target.value)}
                  className="bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500"
                >
                  {symbols.map(s => <option key={s.symbol} value={s.symbol}>{s.symbol}</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs text-[var(--text-secondary)] block mb-1">Strategy</label>
                <select
                  value={strategyIdx}
                  onChange={e => handleStrategyChange(Number(e.target.value))}
                  className="bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500"
                >
                  {STRATEGIES.map((s, i) => <option key={s.name} value={i}>{s.name}</option>)}
                </select>
              </div>

              {strategy.params.map((param: StrategyParam) => (
                <div key={param.key}>
                  <label className="text-xs text-[var(--text-secondary)] block mb-1">{param.label}</label>
                  <input
                    type="number"
                    value={strategyParams[param.key] ?? param.default}
                    onChange={e => handleParamChange(param.key, Number(e.target.value))}
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    className="w-20 bg-[var(--bg-tertiary)] text-white px-2 py-1.5 rounded text-sm outline-none border border-transparent focus:border-gray-500"
                  />
                </div>
              ))}

              <div className="flex items-end">
                <button
                  onClick={handleRun}
                  disabled={running}
                  className="px-4 py-1.5 rounded bg-[var(--yellow)] text-black font-semibold text-sm hover:opacity-90 disabled:opacity-40"
                >
                  {running ? 'Running...' : 'Run'}
                </button>
              </div>
            </div>

            <div className="text-xs text-[var(--text-secondary)] mb-4">{strategy.description}</div>

            {result && <ResultsView result={result} currency={currency} />}
            {!result && !running && (
              <div className="text-center py-8 text-sm text-[var(--text-secondary)]">
                Configure and click <span className="text-[var(--yellow)]">Run</span> to backtest
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}