import { useState, useEffect } from 'react'
import { usePredictions } from '../../hooks/usePredictions'
import { SYMBOLS } from '../../lib/constants'

export function PredictionPanel() {
  const [open, setOpen] = useState(false)
  const { predictions, performance, requestPrediction, requestAllPredictions, requestPerformance } = usePredictions()
  const [horizonTicks, setHorizonTicks] = useState(10)
  const [horizonBars, setHorizonBars] = useState(5)
  const [selectedSymbol, setSelectedSymbol] = useState(SYMBOLS[0].symbol)

  useEffect(() => {
    if (open) {
      requestPerformance()
    }
  }, [open, requestPerformance])

  const allSymbols = SYMBOLS.map(s => s.symbol)
  const strategies = ['sma', 'rsi', 'momentum']

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 text-xs font-medium rounded bg-[var(--bg-tertiary)] hover:bg-gray-600 transition-colors"
      >
        Predictions
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-[var(--bg-secondary)] rounded-lg shadow-xl w-[800px] max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-700">
              <h2 className="text-base font-bold">Prediction Engine</h2>
              <button onClick={() => setOpen(false)} className="text-gray-400 hover:text-white text-lg">&times;</button>
            </div>

            <div className="px-5 py-3 border-b border-gray-700 flex items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <label className="text-[var(--text-secondary)]">Symbol:</label>
                <select
                  value={selectedSymbol}
                  onChange={e => setSelectedSymbol(e.target.value)}
                  className="bg-[var(--bg-tertiary)] text-white px-2 py-1 rounded text-xs"
                >
                  {allSymbols.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[var(--text-secondary)]">Ticks:</label>
                <input type="number" value={horizonTicks} min={1} max={100}
                  onChange={e => setHorizonTicks(Number(e.target.value))}
                  className="bg-[var(--bg-tertiary)] text-white px-2 py-1 rounded w-16 text-xs" />
              </div>
              <div className="flex items-center gap-2">
                <label className="text-[var(--text-secondary)]">Bars:</label>
                <input type="number" value={horizonBars} min={1} max={50}
                  onChange={e => setHorizonBars(Number(e.target.value))}
                  className="bg-[var(--bg-tertiary)] text-white px-2 py-1 rounded w-16 text-xs" />
              </div>
              <button
                onClick={() => requestPrediction(selectedSymbol, horizonTicks, horizonBars)}
                className="px-3 py-1.5 bg-[var(--yellow)] text-black font-medium rounded text-xs hover:bg-yellow-400"
              >
                Predict
              </button>
              <button
                onClick={() => requestAllPredictions(horizonTicks, horizonBars)}
                className="px-3 py-1.5 bg-[var(--green)] text-black font-medium rounded text-xs hover:opacity-90"
              >
                Predict All
              </button>
              <button
                onClick={requestPerformance}
                className="px-3 py-1.5 bg-gray-600 text-white rounded text-xs hover:bg-gray-500"
              >
                Refresh
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5">
              {predictions[selectedSymbol] && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold mb-3 text-[var(--yellow)]">
                    Predictions for {selectedSymbol}
                  </h3>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-[var(--text-secondary)] border-b border-gray-700">
                        <th className="text-left py-2">Strategy</th>
                        <th className="text-right py-2">Price (Ticks)</th>
                        <th className="text-right py-2">Price (Bars)</th>
                        <th className="text-right py-2">Expected Return</th>
                        <th className="text-right py-2">Confidence</th>
                        <th className="text-right py-2">Accuracy</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(predictions[selectedSymbol]).map(([name, pred]) => (
                        <tr key={name} className="border-b border-gray-800 hover:bg-[var(--bg-tertiary)]">
                          <td className="py-2 font-medium">{name}</td>
                          <td className="text-right py-2">${pred.predicted_price_ticks.toFixed(2)}</td>
                          <td className="text-right py-2">${pred.predicted_price_bars.toFixed(2)}</td>
                          <td className={`text-right py-2 ${pred.expected_return >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                            {(pred.expected_return * 100).toFixed(2)}%
                          </td>
                          <td className="text-right py-2">{(pred.confidence * 100).toFixed(0)}%</td>
                          <td className="text-right py-2">{(pred.accuracy * 100).toFixed(0)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div>
                <h3 className="text-sm font-bold mb-3 text-[var(--green)]">Strategy Performance</h3>
                {Object.keys(performance).length === 0 ? (
                  <p className="text-xs text-[var(--text-secondary)]">No performance data yet. Run predictions or sessions to collect data.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-[var(--text-secondary)] border-b border-gray-700">
                          <th className="text-left py-2">Strategy</th>
                          {allSymbols.map(s => (
                            <th key={s} className="text-right py-2">{s}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {strategies.map(strat => (
                          <tr key={strat} className="border-b border-gray-800">
                            <td className="py-2 font-medium">{strat}</td>
                            {allSymbols.map(sym => {
                              const perf = performance[strat]?.[sym]
                              const accuracy = perf ? perf.accuracy : null
                              const pnl = perf ? perf.total_pnl : null
                              return (
                                <td key={sym} className="text-right py-2">
                                  {accuracy !== null ? (
                                    <span className={accuracy >= 0.6 ? 'text-[var(--green)]' : accuracy >= 0.4 ? 'text-[var(--yellow)]' : 'text-[var(--red)]'}>
                                      {(accuracy * 100).toFixed(0)}%
                                      {pnl !== null && pnl !== 0 && (
                                        <span className={`ml-1 ${pnl >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                                          (${pnl.toFixed(0)})
                                        </span>
                                      )}
                                    </span>
                                  ) : (
                                    <span className="text-gray-600">--</span>
                                  )}
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
