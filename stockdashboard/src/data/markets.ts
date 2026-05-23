import type { MarketType } from './exchanges'

export interface MarketSymbol {
  symbol: string
  name: string
  exchange: string
  type: MarketType
  currency: string
  sector?: string
}

export const stockSymbols: MarketSymbol[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Consumer Cyclical' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Automotive' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Technology' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', exchange: 'XNAS', type: 'stock', currency: 'USD', sector: 'Technology' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'XNYS', type: 'stock', currency: 'USD', sector: 'Financial' },
  { symbol: 'V', name: 'Visa Inc.', exchange: 'XNYS', type: 'stock', currency: 'USD', sector: 'Financial' },
  { symbol: 'JNJ', name: 'Johnson & Johnson', exchange: 'XNYS', type: 'stock', currency: 'USD', sector: 'Healthcare' },
  { symbol: 'TSCO.L', name: 'Tesco PLC', exchange: 'XLON', type: 'stock', currency: 'GBP', sector: 'Consumer Defensive' },
  { symbol: 'SAP.DE', name: 'SAP SE', exchange: 'XETR', type: 'stock', currency: 'EUR', sector: 'Technology' },
  { symbol: '7203.T', name: 'Toyota Motor', exchange: 'XTKS', type: 'stock', currency: 'JPY', sector: 'Automotive' },
  { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', exchange: 'XNSE', type: 'stock', currency: 'INR', sector: 'Energy' },
  { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'XNSE', type: 'stock', currency: 'INR', sector: 'Technology' },
  { symbol: 'INFY.NS', name: 'Infosys Ltd.', exchange: 'XNSE', type: 'stock', currency: 'INR', sector: 'Technology' },
  { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', exchange: 'XNSE', type: 'stock', currency: 'INR', sector: 'Financial' },
  { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', exchange: 'XNSE', type: 'stock', currency: 'INR', sector: 'Technology' },
  { symbol: '0700.HK', name: 'Tencent Holdings', exchange: 'XHKG', type: 'stock', currency: 'HKD', sector: 'Technology' },
]

export const futuresSymbols: MarketSymbol[] = [
  { symbol: 'ES', name: 'S&P 500 E-mini', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: 'NQ', name: 'NASDAQ 100 E-mini', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: 'YM', name: 'Dow Jones E-mini', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: 'CL', name: 'Crude Oil WTI', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: 'GC', name: 'Gold Futures', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: 'SI', name: 'Silver Futures', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: 'ZB', name: 'US 30Y Treasury Bond', exchange: 'CME', type: 'futures', currency: 'USD' },
  { symbol: '6E', name: 'Euro FX', exchange: 'CME', type: 'futures', currency: 'USD' },
]

export const forexPairs: MarketSymbol[] = [
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', exchange: 'FX', type: 'forex', currency: 'USD' },
  { symbol: 'USD/CNY', name: 'US Dollar / Chinese Yuan', exchange: 'FX', type: 'forex', currency: 'CNY' },
]

export const cryptoSymbols: MarketSymbol[] = [
  { symbol: 'BTC/USDT', name: 'Bitcoin', exchange: 'BINANCE', type: 'crypto', currency: 'USDT' },
  { symbol: 'ETH/USDT', name: 'Ethereum', exchange: 'BINANCE', type: 'crypto', currency: 'USDT' },
  { symbol: 'SOL/USDT', name: 'Solana', exchange: 'BINANCE', type: 'crypto', currency: 'USDT' },
  { symbol: 'XRP/USDT', name: 'Ripple', exchange: 'BINANCE', type: 'crypto', currency: 'USDT' },
]

export function getAllMarkets(): MarketSymbol[] {
  return [...stockSymbols, ...futuresSymbols, ...forexPairs, ...cryptoSymbols]
}

export function getMarketsByType(type: MarketType): MarketSymbol[] {
  switch (type) {
    case 'stock': return stockSymbols
    case 'futures': return futuresSymbols
    case 'forex': return forexPairs
    case 'crypto': return cryptoSymbols
  }
}

export const optionTypes = [
  { name: 'AAPL 200C 2024-06-21', underlying: 'AAPL', strike: 200, type: 'call', expiry: '2024-06-21' },
  { name: 'TSLA 250P 2024-06-21', underlying: 'TSLA', strike: 250, type: 'put', expiry: '2024-06-21' },
  { name: 'NVDA 900C 2024-07-19', underlying: 'NVDA', strike: 900, type: 'call', expiry: '2024-07-19' },
  { name: 'MSFT 420P 2024-06-21', underlying: 'MSFT', strike: 420, type: 'put', expiry: '2024-06-21' },
] as const
