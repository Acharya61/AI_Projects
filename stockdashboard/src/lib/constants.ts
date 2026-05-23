export const SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
]

export const INDICES = [
  { name: 'S&P 500', basePrice: 5340 },
  { name: 'NASDAQ', basePrice: 17120 },
  { name: 'DOW', basePrice: 39120 },
]

export const BASE_PRICES: Record<string, number> = {
  AAPL: 198.50,
  GOOGL: 176.30,
  MSFT: 425.10,
  AMZN: 186.70,
  TSLA: 248.50,
  META: 512.40,
  NVDA: 880.20,
  JPM: 198.60,
  V: 285.30,
  JNJ: 156.80,
}

export const INITIAL_CASH = 100000
export const HISTORY_LENGTH = 5000
export const TICK_INTERVAL_MS = 1000
export const ORDER_BOOK_DEPTH = 10
