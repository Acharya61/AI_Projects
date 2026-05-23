import Dexie, { type EntityTable } from 'dexie'

export interface DBOHLC {
  id?: number
  time: number
  symbol: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface DBTrade {
  id?: number
  tradeId: string
  symbol: string
  side: string
  quantity: number
  price: number
  total: number
  timestamp: number
}

export interface DBSnapshot {
  id?: number
  time: number
  cash: number
  equity: number
  positions: string
}

export interface DBIndicator {
  id?: number
  time: number
  symbol: string
  sma20: number | null
  sma50: number | null
  ema12: number | null
  ema26: number | null
  rsi14: number | null
}

const db = new Dexie('StockDashDB') as Dexie & {
  ticks: EntityTable<DBOHLC, 'id'>
  trades: EntityTable<DBTrade, 'id'>
  snapshots: EntityTable<DBSnapshot, 'id'>
  indicators: EntityTable<DBIndicator, 'id'>
}

db.version(1).stores({
  ticks: '++id, [time+symbol], symbol, time',
  trades: '++id, tradeId, symbol, timestamp',
  snapshots: '++id, time',
  indicators: '++id, [time+symbol], symbol, time',
})

export async function logOHLC(ohlc: DBOHLC): Promise<void> {
  await db.ticks.add(ohlc)
}

export async function logTrades(trades: DBTrade[]): Promise<void> {
  await db.trades.bulkAdd(trades, { allKeys: false })
}

export async function logTrade(trade: DBTrade): Promise<void> {
  await db.trades.add(trade)
}

export async function logSnapshot(snapshot: DBSnapshot): Promise<void> {
  await db.snapshots.add(snapshot)
}

export async function logIndicators(indicators: DBIndicator[]): Promise<void> {
  await db.indicators.bulkAdd(indicators, { allKeys: false })
}

export async function getTableCounts(): Promise<Record<string, number>> {
  return {
    ticks: await db.ticks.count(),
    trades: await db.trades.count(),
    snapshots: await db.snapshots.count(),
    indicators: await db.indicators.count(),
  }
}

export async function getDateRange(): Promise<Record<string, { from: string; to: string } | null>> {
  const firstTick = await db.ticks.orderBy('time').first()
  const lastTick = await db.ticks.orderBy('time').last()
  const firstTrade = await db.trades.orderBy('timestamp').first()
  const lastTrade = await db.trades.orderBy('timestamp').last()

  return {
    ticks: firstTick && lastTick
      ? { from: new Date(firstTick.time * 1000).toLocaleDateString(), to: new Date(lastTick.time * 1000).toLocaleDateString() }
      : null,
    trades: firstTrade && lastTrade
      ? { from: new Date(firstTrade.timestamp).toLocaleDateString(), to: new Date(lastTrade.timestamp).toLocaleDateString() }
      : null,
  }
}

export async function exportTableAsCSV(tableName: string): Promise<Blob> {
  const table = db.table(tableName)
  const rows = await table.toArray()
  if (!rows.length) return new Blob([''], { type: 'text/csv' })

  const keys = Object.keys(rows[0] as object).filter(k => k !== 'id')
  const header = keys.join(',')
  const csvRows = rows.map(row => {
    const values = keys.map(k => {
      const v = (row as any)[k]
      return typeof v === 'string' && v.includes(',') ? `"${v}"` : v
    })
    return values.join(',')
  })

  return new Blob([header + '\n' + csvRows.join('\n')], { type: 'text/csv' })
}

export async function getAllTicks(): Promise<DBOHLC[]> {
  return db.ticks.orderBy('time').toArray()
}

export async function getAllTrades(): Promise<DBTrade[]> {
  return db.trades.orderBy('timestamp').toArray()
}

export async function clearAll(): Promise<void> {
  await Promise.all([
    db.ticks.clear(),
    db.trades.clear(),
    db.snapshots.clear(),
    db.indicators.clear(),
  ])
}

export default db
