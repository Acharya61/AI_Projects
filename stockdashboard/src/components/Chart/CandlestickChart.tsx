import { useEffect, useRef, useMemo, useState } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import { useStore } from '../../store/store'
import { calcSMA, calcIndicators } from '../../lib/indicators'
import { aggregateOHLC, type Timeframe } from '../../lib/aggregator'

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M']

export function CandlestickChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const sma20Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>('1m')

  const history = useStore(s => s.prices.history)
  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const ticks = useStore(s => s.prices.ticks)

  const rawData = history[activeSymbol] || []
  const currentTick = ticks[activeSymbol]

  const data = useMemo(() => aggregateOHLC(rawData, timeframe), [rawData, timeframe])

  const sma20Data = useMemo(() => calcSMA(data, 20), [data])
  const sma50Data = useMemo(() => calcSMA(data, 50), [data])
  const indicators = useMemo(() => calcIndicators(data), [data])

  useEffect(() => {
    if (!containerRef.current) return

    const chart = createChart(containerRef.current, {
      layout: {
        background: { color: '#0d0d0d' },
        textColor: '#6b7280',
      },
      grid: {
        vertLines: { color: '#1a1a1a' },
        horzLines: { color: '#1a1a1a' },
      },
      timeScale: {
        borderColor: '#2a2a2a',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: '#2a2a2a',
      },
      crosshair: {
        mode: 0,
      },
      handleScroll: true,
      handleScale: true,
    })

    candleSeriesRef.current = chart.addSeries(CandlestickSeries, {
      upColor: '#00ff41',
      downColor: '#ff3355',
      borderDownColor: '#ff3355',
      borderUpColor: '#00ff41',
      wickDownColor: '#ff3355',
      wickUpColor: '#00ff41',
    })

    volumeSeriesRef.current = chart.addSeries(HistogramSeries, {
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    })

    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.85, bottom: 0 },
    })

    sma20Ref.current = chart.addSeries(LineSeries, {
      color: '#f0b90b',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    sma50Ref.current = chart.addSeries(LineSeries, {
      color: '#9747ff',
      lineWidth: 1,
      priceLineVisible: false,
      lastValueVisible: false,
    })

    chartRef.current = chart
    chart.timeScale().fitContent()

    return () => {
      chart.remove()
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
      sma20Ref.current = null
      sma50Ref.current = null
    }
  }, [])

  useEffect(() => {
    if (!candleSeriesRef.current || !data.length) return

    candleSeriesRef.current.setData(
      data.map(d => ({ time: d.time as any, open: d.open, high: d.high, low: d.low, close: d.close }))
    )

    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(
        data.map(d => ({
          time: d.time as any,
          value: d.volume,
          color: d.close >= d.open ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 51, 85, 0.3)',
        }))
      )
    }

    if (sma20Ref.current) {
      sma20Ref.current.setData(
        data.map((d, i) => sma20Data[i] !== null ? { time: d.time as any, value: sma20Data[i]! } : null)
          .filter(Boolean) as any
      )
    }

    if (sma50Ref.current) {
      sma50Ref.current.setData(
        data.map((d, i) => sma50Data[i] !== null ? { time: d.time as any, value: sma50Data[i]! } : null)
          .filter(Boolean) as any
      )
    }

    chartRef.current?.timeScale().fitContent()
  }, [data, sma20Data, sma50Data])

  const lastBar = data[data.length - 1]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border-dim)] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-[var(--yellow)] glow-yellow">{activeSymbol}</span>
          {currentTick && (
            <>
              <span className={`text-xl font-bold ${currentTick.change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                ${currentTick.price.toFixed(2)}
              </span>
              <span className={`text-sm ${currentTick.change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {currentTick.change >= 0 ? '+' : ''}{currentTick.change.toFixed(2)} ({currentTick.changePercent >= 0 ? '+' : ''}{currentTick.changePercent.toFixed(2)}%)
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-[var(--border-dim)] overflow-hidden text-xs">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 ${
                  timeframe === tf
                    ? 'bg-[var(--yellow)] text-black font-medium'
                    : 'text-[var(--text-secondary)] hover:text-[var(--yellow)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] ml-2">
            {lastBar && (
              <>
                <span>O: {lastBar.open.toFixed(2)}</span>
                <span>H: {lastBar.high.toFixed(2)}</span>
                <span>L: {lastBar.low.toFixed(2)}</span>
                <span>C: {lastBar.close.toFixed(2)}</span>
                <span>Vol: {(lastBar.volume / 1000000).toFixed(1) + 'M'}</span>
              </>
            )}
            {indicators.rsi14 !== null && (
              <span>RSI: <span className={indicators.rsi14 >= 70 ? 'text-[var(--red)]' : indicators.rsi14 <= 30 ? 'text-[var(--green)]' : ''}>{indicators.rsi14.toFixed(1)}</span></span>
            )}
          </div>
        </div>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}
