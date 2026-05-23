import type { OHLCData } from './types'

export type Timeframe = '1m' | '5m' | '15m' | '1H' | '4H' | '1D' | '1W' | '1M'

const TIMEFRAME_SECONDS: Record<Timeframe, number> = {
  '1m': 60,
  '5m': 300,
  '15m': 900,
  '1H': 3600,
  '4H': 14400,
  '1D': 86400,
  '1W': 604800,
  '1M': 2592000,
}

export function aggregateOHLC(data: OHLCData[], timeframe: Timeframe): OHLCData[] {
  if (timeframe === '1m' || data.length === 0) return data

  const periodSeconds = TIMEFRAME_SECONDS[timeframe]
  const groups: Map<number, OHLCData[]> = new Map()

  for (const bar of data) {
    const periodStart = Math.floor(bar.time / periodSeconds) * periodSeconds
    if (!groups.has(periodStart)) {
      groups.set(periodStart, [])
    }
    groups.get(periodStart)!.push(bar)
  }

  const result: OHLCData[] = []
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => a - b)

  for (const key of sortedKeys) {
    const bars = groups.get(key)!
    const first = bars[0]
    const last = bars[bars.length - 1]
    const high = Math.max(...bars.map(b => b.high))
    const low = Math.min(...bars.map(b => b.low))
    const volume = bars.reduce((sum, b) => sum + b.volume, 0)

    result.push({
      time: key,
      open: first.open,
      high,
      low,
      close: last.close,
      volume,
    })
  }

  return result
}

export function getTimeframeLabel(tf: Timeframe): string {
  const labels: Record<Timeframe, string> = {
    '1m': '1m',
    '5m': '5m',
    '15m': '15m',
    '1H': '1H',
    '4H': '4H',
    '1D': '1D',
    '1W': '1W',
    '1M': '1M',
  }
  return labels[tf]
}
