import type { OHLCData, IndicatorValues } from './types'

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}

function average(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0
}

export function calcSMA(data: OHLCData[], period: number): (number | null)[] {
  return data.map((_, i) => {
    if (i < period - 1) return null
    const slice = data.slice(i - period + 1, i + 1)
    return Math.round(average(slice.map(d => d.close)) * 100) / 100
  })
}

export function calcEMA(data: OHLCData[], period: number): (number | null)[] {
  const result: (number | null)[] = [null]
  if (data.length < period) return result

  let ema = average(data.slice(0, period).map(d => d.close))
  result.push(Math.round(ema * 100) / 100)

  const multiplier = 2 / (period + 1)
  for (let i = period; i < data.length; i++) {
    ema = (data[i].close - ema) * multiplier + ema
    result.push(Math.round(ema * 100) / 100)
  }

  while (result.length < data.length) result.unshift(null)
  return result.slice(0, data.length)
}

export function calcRSI(data: OHLCData[], period: number = 14): (number | null)[] {
  const result: (number | null)[] = [null]

  if (data.length < period + 1) return result

  const changes: number[] = []
  for (let i = 1; i < data.length; i++) {
    changes.push(data[i].close - data[i - 1].close)
  }

  let gains = changes.slice(0, period).map(c => c > 0 ? c : 0)
  let losses = changes.slice(0, period).map(c => c < 0 ? -c : 0)
  let avgGain = average(gains)
  let avgLoss = average(losses)

  for (let i = period; i < changes.length; i++) {
    const gain = changes[i] > 0 ? changes[i] : 0
    const loss = changes[i] < 0 ? -changes[i] : 0
    avgGain = (avgGain * (period - 1) + gain) / period
    avgLoss = (avgLoss * (period - 1) + loss) / period

    if (avgLoss === 0) {
      result.push(100)
    } else {
      const rs = avgGain / avgLoss
      result.push(Math.round((100 - 100 / (1 + rs)) * 100) / 100)
    }
  }

  while (result.length < data.length) result.unshift(null)
  return result.slice(0, data.length)
}

export function calcIndicators(data: OHLCData[]): IndicatorValues {
  const len = data.length
  const lastIndex = len - 1

  const sma20 = lastIndex >= 19 ? calcSMA(data, 20)[lastIndex] : null
  const sma50 = lastIndex >= 49 ? calcSMA(data, 50)[lastIndex] : null
  const ema12 = calcEMA(data, 12)[lastIndex] ?? null
  const ema26 = calcEMA(data, 26)[lastIndex] ?? null
  const rsi14 = calcRSI(data, 14)[lastIndex] ?? null

  return { sma20, sma50, ema12, ema26, rsi14 }
}
