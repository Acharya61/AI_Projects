import { useEffect, useRef, useMemo, useState, useCallback } from 'react'
import { createChart, CandlestickSeries, HistogramSeries, LineSeries } from 'lightweight-charts'
import type { IChartApi, ISeriesApi } from 'lightweight-charts'
import { useStore } from '../../store/store'
import { formatPrice } from '../../data/currencies'
import { calcSMA, calcRSI, calcIndicators } from '../../lib/indicators'
import { aggregateOHLC, type Timeframe } from '../../lib/aggregator'

const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1H', '4H', '1D', '1W', '1M']

interface OverlayToggle {
  key: string
  label: string
  desc: string
  color: string
}

const OVERLAYS: OverlayToggle[] = [
  { key: 'sma20', label: 'SMA20', desc: '20-period Simple Moving Average', color: '#f0b90b' },
  { key: 'sma50', label: 'SMA50', desc: '50-period Simple Moving Average', color: '#9747ff' },
  { key: 'rsi', label: 'RSI', desc: '14-period Relative Strength Index', color: '#ff6b6b' },
  { key: 'volume', label: 'Vol', desc: 'Volume Histogram', color: '#00ff41' },
]

export function CandlestickChart() {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const sma20Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const sma50Ref = useRef<ISeriesApi<'Line'> | null>(null)
  const rsiSeriesRef = useRef<ISeriesApi<'Line'> | null>(null)
  const [timeframe, setTimeframe] = useState<Timeframe>('1m')
  const [overlays, setOverlays] = useState<Record<string, boolean>>({
    sma20: true, sma50: true, rsi: false, volume: true,
  })

  const toggleOverlay = useCallback((key: string) => {
    setOverlays(prev => ({ ...prev, [key]: !prev[key] }))
  }, [])

  const history = useStore(s => s.prices.history)
  const activeSymbol = useStore(s => s.prices.activeSymbol)
  const ticks = useStore(s => s.prices.ticks)

  const currency = useStore(s => s.prices.activeCurrency)
  const rawData = history[activeSymbol] || []
  const currentTick = ticks[activeSymbol]

  const data = useMemo(() => aggregateOHLC(rawData, timeframe), [rawData, timeframe])

  const sma20Data = useMemo(() => calcSMA(data, 20), [data])
  const sma50Data = useMemo(() => calcSMA(data, 50), [data])
  const rsiData = useMemo(() => calcRSI(data, 14), [data])
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
      crosshair: { mode: 0 },
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
      scaleMargins: { top: 0.80, bottom: 0 },
    })

    sma20Ref.current = chart.addSeries(LineSeries, {
      color: '#f0b90b', lineWidth: 1,
      priceLineVisible: false, lastValueVisible: false,
    })

    sma50Ref.current = chart.addSeries(LineSeries, {
      color: '#9747ff', lineWidth: 1,
      priceLineVisible: false, lastValueVisible: false,
    })

    rsiSeriesRef.current = chart.addSeries(LineSeries, {
      color: '#ff6b6b', lineWidth: 1,
      priceLineVisible: false, lastValueVisible: false,
      priceScaleId: 'rsi',
    })
    chart.priceScale('rsi').applyOptions({
      scaleMargins: { top: 0, bottom: 0.80 },
      autoScale: true,
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
      rsiSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!candleSeriesRef.current || !data.length) return

    candleSeriesRef.current.setData(
      data.map(d => ({ time: d.time as any, open: d.open, high: d.high, low: d.low, close: d.close }))
    )

    if (overlays.volume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData(
        data.map(d => ({
          time: d.time as any, value: d.volume,
          color: d.close >= d.open ? 'rgba(0, 255, 65, 0.3)' : 'rgba(255, 51, 85, 0.3)',
        }))
      )
    } else if (!overlays.volume && volumeSeriesRef.current) {
      volumeSeriesRef.current.setData([])
    }

    if (overlays.sma20 && sma20Ref.current) {
      sma20Ref.current.setData(
        data.map((d, i) => sma20Data[i] !== null ? { time: d.time as any, value: sma20Data[i]! } : null)
          .filter(Boolean) as any
      )
    } else if (!overlays.sma20 && sma20Ref.current) {
      sma20Ref.current.setData([])
    }

    if (overlays.sma50 && sma50Ref.current) {
      sma50Ref.current.setData(
        data.map((d, i) => sma50Data[i] !== null ? { time: d.time as any, value: sma50Data[i]! } : null)
          .filter(Boolean) as any
      )
    } else if (!overlays.sma50 && sma50Ref.current) {
      sma50Ref.current.setData([])
    }

    if (overlays.rsi && rsiSeriesRef.current) {
      rsiSeriesRef.current.setData(
        data.map((d, i) => rsiData[i] !== null ? { time: d.time as any, value: rsiData[i]! } : null)
          .filter(Boolean) as any
      )
    } else if (!overlays.rsi && rsiSeriesRef.current) {
      rsiSeriesRef.current.setData([])
    }

    chartRef.current?.timeScale().fitContent()
  }, [data, sma20Data, sma50Data, rsiData, overlays])

  const lastBar = data[data.length - 1]

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-dim)] shrink-0 bg-[var(--bg-tertiary)]/30">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-[var(--yellow)] glow-yellow tracking-wider">{activeSymbol}</span>
            <span className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wide">{timeframe}</span>
          </div>
          {currentTick && (
            <>
              <span className={`text-2xl font-bold tabular-nums ${currentTick.change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                {formatPrice(currentTick.price, currency)}
              </span>
              <div className="flex items-baseline gap-1">
                <span className={`text-sm font-semibold ${currentTick.change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  {currentTick.change >= 0 ? '+' : ''}{currentTick.change.toFixed(2)}
                </span>
                <span className={`text-xs ${currentTick.changePercent >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                  ({currentTick.changePercent >= 0 ? '+' : ''}{currentTick.changePercent.toFixed(2)}%)
                </span>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-[10px]">
            {OVERLAYS.map(o => (
              <button
                key={o.key}
                onClick={() => toggleOverlay(o.key)}
                title={o.desc}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                  overlays[o.key]
                    ? 'bg-[var(--bg-tertiary)] text-white'
                    : 'text-[var(--text-secondary)] hover:text-white'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: o.color }} />
                <span>{o.label}</span>
              </button>
            ))}
          </div>
          <div className="flex border border-[var(--border-dim)] overflow-hidden text-[10px] ml-1">
            {TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 font-medium ${
                  timeframe === tf
                    ? 'bg-[var(--yellow)] text-black'
                    : 'text-[var(--text-secondary)] hover:text-[var(--yellow)] hover:bg-[var(--bg-tertiary)]'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-[var(--text-secondary)] border-l border-[var(--border-dim)] pl-2 ml-1">
            {lastBar && (
              <>
                <span>O <span className="text-white/80">{lastBar.open.toFixed(2)}</span></span>
                <span>H <span className="text-white/80">{lastBar.high.toFixed(2)}</span></span>
                <span>L <span className="text-white/80">{lastBar.low.toFixed(2)}</span></span>
                <span>C <span className="text-white/80">{lastBar.close.toFixed(2)}</span></span>
                <span>V <span className="text-white/80">{(lastBar.volume / 1000000).toFixed(1) + 'M'}</span></span>
              </>
            )}
            {indicators.rsi14 !== null && (
              <span className="border-l border-[var(--border-dim)] pl-2">
                RSI <span className={indicators.rsi14 >= 70 ? 'text-[var(--red)]' : indicators.rsi14 <= 30 ? 'text-[var(--green)]' : 'text-white/80'}>{indicators.rsi14.toFixed(1)}</span>
              </span>
            )}
          </div>
        </div>
      </div>
      <div ref={containerRef} className="flex-1" />
    </div>
  )
}