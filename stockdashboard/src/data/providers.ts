export interface DataProvider {
  id: string
  name: string
  type: 'free' | 'freemium' | 'paid'
  markets: string[]
  rateLimit: string
  documentation: string
  apiKeyRequired: boolean
  notes: string
}

export const providers: DataProvider[] = [
  { id: 'yahoo', name: 'Yahoo Finance', type: 'free', markets: ['stock', 'futures', 'forex', 'crypto'], rateLimit: 'Unlimited (delayed)', documentation: 'https://finance.yahoo.com', apiKeyRequired: false, notes: '15-min delayed data. No API key needed for scraping. Unofficial API.' },
  { id: 'alphavantage', name: 'Alpha Vantage', type: 'free', markets: ['stock', 'forex', 'crypto'], rateLimit: '5 req/min, 500 req/day', documentation: 'https://www.alphavantage.co', apiKeyRequired: true, notes: 'Free API key. Good for US stocks and forex.' },
  { id: 'iexcloud', name: 'IEX Cloud', type: 'freemium', markets: ['stock'], rateLimit: '50k calls/month (free)', documentation: 'https://iexcloud.io', apiKeyRequired: true, notes: 'Free tier with 50k calls/mo. Paid tiers available.' },
  { id: 'polygon', name: 'Polygon.io', type: 'freemium', markets: ['stock', 'futures', 'forex', 'crypto'], rateLimit: '5 req/min (free)', documentation: 'https://polygon.io', apiKeyRequired: true, notes: 'Free tier very limited. Paid plans from $29/mo.' },
  { id: 'twelve', name: 'Twelve Data', type: 'freemium', markets: ['stock', 'forex', 'crypto'], rateLimit: '800 calls/day (free)', documentation: 'https://twelvedata.com', apiKeyRequired: true, notes: 'Good free tier with 800 calls/day. WebSocket support.' },
  { id: 'finnhub', name: 'Finnhub', type: 'freemium', markets: ['stock', 'forex', 'crypto'], rateLimit: '60 req/min (free)', documentation: 'https://finnhub.io', apiKeyRequired: true, notes: 'Free tier includes news and sentiment.' },
  { id: 'oanda', name: 'OANDA', type: 'free', markets: ['forex'], rateLimit: 'Unlimited (demo)', documentation: 'https://developer.oanda.com', apiKeyRequired: true, notes: 'Forex-focused. Demo account provides real data.' },
  { id: 'binance', name: 'Binance', type: 'free', markets: ['crypto'], rateLimit: '1200 req/min', documentation: 'https://binance-docs.github.io', apiKeyRequired: false, notes: 'Best for crypto. Real-time via WebSocket.' },
  { id: 'simulated', name: 'Simulated (Local)', type: 'free', markets: ['stock', 'futures', 'forex', 'crypto'], rateLimit: 'Unlimited', documentation: '', apiKeyRequired: false, notes: 'Built-in data generator. No API needed. Default mode.' },
]
