export interface Exchange {
  mic: string
  name: string
  country: string
  countryCode: string
  currency: string
  timezone: string
  open: string
  close: string
  type: 'stock' | 'futures' | 'forex' | 'crypto'
}

export const exchanges: Exchange[] = [
  { mic: 'XNYS', name: 'New York Stock Exchange', country: 'United States', countryCode: 'US', currency: 'USD', timezone: 'America/New_York', open: '09:30', close: '16:00', type: 'stock' },
  { mic: 'XNAS', name: 'NASDAQ', country: 'United States', countryCode: 'US', currency: 'USD', timezone: 'America/New_York', open: '09:30', close: '16:00', type: 'stock' },
  { mic: 'XLON', name: 'London Stock Exchange', country: 'United Kingdom', countryCode: 'GB', currency: 'GBP', timezone: 'Europe/London', open: '08:00', close: '16:30', type: 'stock' },
  { mic: 'XTKS', name: 'Tokyo Stock Exchange', country: 'Japan', countryCode: 'JP', currency: 'JPY', timezone: 'Asia/Tokyo', open: '09:00', close: '15:00', type: 'stock' },
  { mic: 'XHKG', name: 'Hong Kong Exchange', country: 'Hong Kong', countryCode: 'HK', currency: 'HKD', timezone: 'Asia/Hong_Kong', open: '09:30', close: '16:00', type: 'stock' },
  { mic: 'XNSE', name: 'National Stock Exchange of India', country: 'India', countryCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', open: '09:15', close: '15:30', type: 'stock' },
  { mic: 'XBOM', name: 'BSE', country: 'India', countryCode: 'IN', currency: 'INR', timezone: 'Asia/Kolkata', open: '09:15', close: '15:30', type: 'stock' },
  { mic: 'XPAR', name: 'Euronext Paris', country: 'France', countryCode: 'FR', currency: 'EUR', timezone: 'Europe/Paris', open: '09:00', close: '17:30', type: 'stock' },
  { mic: 'XETR', name: 'Deutsche Börse', country: 'Germany', countryCode: 'DE', currency: 'EUR', timezone: 'Europe/Berlin', open: '09:00', close: '17:30', type: 'stock' },
  { mic: 'XSHE', name: 'Shenzhen Stock Exchange', country: 'China', countryCode: 'CN', currency: 'CNY', timezone: 'Asia/Shanghai', open: '09:30', close: '15:00', type: 'stock' },
  { mic: 'XSWX', name: 'SIX Swiss Exchange', country: 'Switzerland', countryCode: 'CH', currency: 'CHF', timezone: 'Europe/Zurich', open: '09:00', close: '17:30', type: 'stock' },
  { mic: 'XTSX', name: 'Toronto Stock Exchange', country: 'Canada', countryCode: 'CA', currency: 'CAD', timezone: 'America/Toronto', open: '09:30', close: '16:00', type: 'stock' },
  { mic: 'CME', name: 'Chicago Mercantile Exchange', country: 'United States', countryCode: 'US', currency: 'USD', timezone: 'America/Chicago', open: '17:00', close: '16:00', type: 'futures' },
  { mic: 'ICE', name: 'Intercontinental Exchange', country: 'United States', countryCode: 'US', currency: 'USD', timezone: 'America/New_York', open: '19:00', close: '17:00', type: 'futures' },
  { mic: 'FX', name: 'Forex Market', country: 'Global', countryCode: 'XX', currency: 'USD', timezone: 'UTC', open: '00:00', close: '24:00', type: 'forex' },
  { mic: 'BINANCE', name: 'Binance', country: 'Global', countryCode: 'XX', currency: 'USDT', timezone: 'UTC', open: '00:00', close: '24:00', type: 'crypto' },
  { mic: 'COINBASE', name: 'Coinbase', country: 'Global', countryCode: 'XX', currency: 'USD', timezone: 'UTC', open: '00:00', close: '24:00', type: 'crypto' },
]

export type MarketType = 'stock' | 'futures' | 'forex' | 'crypto'

export function getExchangesByType(type: MarketType): Exchange[] {
  return exchanges.filter(e => e.type === type)
}

export function getExchangesByCountry(countryCode: string): Exchange[] {
  return exchanges.filter(e => e.countryCode === countryCode)
}

export function isExchangeOpen(exchange: Exchange): boolean {
  const now = new Date()
  const tz = exchange.timezone
  const options = { timeZone: tz, hour12: false } as const
  const timeStr = now.toLocaleTimeString('en-GB', options)
  return timeStr >= exchange.open && timeStr <= exchange.close
}
