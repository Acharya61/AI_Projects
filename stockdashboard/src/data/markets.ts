import type { MarketType } from './exchanges'

export interface MarketSymbol {
  symbol: string
  name: string
  exchange: string
  type: MarketType
  currency: string
  sector?: string
}

export interface ExchangeStockList {
  name: string
  exchange: string
  currency: string
  country: string
  top10: { symbol: string; name: string; basePrice: number }[]
}

export const EXCHANGE_STOCKS: Record<string, ExchangeStockList> = {
  'NYSE': {
    name: 'NYSE', exchange: 'XNYS', currency: 'USD', country: 'US',
    top10: [
      { symbol: 'JPM', name: 'JPMorgan Chase & Co.', basePrice: 198 },
      { symbol: 'V', name: 'Visa Inc.', basePrice: 285 },
      { symbol: 'JNJ', name: 'Johnson & Johnson', basePrice: 157 },
      { symbol: 'WMT', name: 'Walmart Inc.', basePrice: 168 },
      { symbol: 'KO', name: 'The Coca-Cola Co.', basePrice: 63 },
      { symbol: 'PG', name: 'Procter & Gamble Co.', basePrice: 165 },
      { symbol: 'HD', name: 'The Home Depot Inc.', basePrice: 354 },
      { symbol: 'CVX', name: 'Chevron Corp.', basePrice: 191 },
      { symbol: 'MCD', name: "McDonald's Corp.", basePrice: 267 },
      { symbol: 'BA', name: 'The Boeing Co.', basePrice: 178 },
    ],
  },
  'NASDAQ': {
    name: 'NASDAQ', exchange: 'XNAS', currency: 'USD', country: 'US',
    top10: [
      { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 198 },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', basePrice: 176 },
      { symbol: 'MSFT', name: 'Microsoft Corp.', basePrice: 425 },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', basePrice: 187 },
      { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 249 },
      { symbol: 'META', name: 'Meta Platforms Inc.', basePrice: 512 },
      { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 880 },
      { symbol: 'NFLX', name: 'Netflix Inc.', basePrice: 640 },
      { symbol: 'AMD', name: 'Advanced Micro Devices', basePrice: 162 },
      { symbol: 'ADBE', name: 'Adobe Inc.', basePrice: 475 },
    ],
  },
  'LSE': {
    name: 'LSE', exchange: 'XLON', currency: 'GBP', country: 'GB',
    top10: [
      { symbol: 'AZN.L', name: 'AstraZeneca PLC', basePrice: 120 },
      { symbol: 'SHEL.L', name: 'Shell PLC', basePrice: 28 },
      { symbol: 'HSBA.L', name: 'HSBC Holdings PLC', basePrice: 7 },
      { symbol: 'GSK.L', name: 'GSK PLC', basePrice: 16 },
      { symbol: 'BP.L', name: 'BP PLC', basePrice: 5 },
      { symbol: 'RIO.L', name: 'Rio Tinto PLC', basePrice: 54 },
      { symbol: 'TSCO.L', name: 'Tesco PLC', basePrice: 3 },
      { symbol: 'VOD.L', name: 'Vodafone Group PLC', basePrice: 1 },
      { symbol: 'BARC.L', name: 'Barclays PLC', basePrice: 2 },
      { symbol: 'LLOY.L', name: 'Lloyds Banking Group', basePrice: 1 },
    ],
  },
  'NSE': {
    name: 'NSE', exchange: 'XNSE', currency: 'INR', country: 'IN',
    top10: [
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries Ltd.', basePrice: 245 },
      { symbol: 'TCS.NS', name: 'Tata Consultancy Services', basePrice: 350 },
      { symbol: 'INFY.NS', name: 'Infosys Ltd.', basePrice: 142 },
      { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Ltd.', basePrice: 152 },
      { symbol: 'WIPRO.NS', name: 'Wipro Ltd.', basePrice: 42 },
      { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Ltd.', basePrice: 105 },
      { symbol: 'ITC.NS', name: 'ITC Ltd.', basePrice: 42 },
      { symbol: 'SBIN.NS', name: 'State Bank of India', basePrice: 72 },
      { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance Ltd.', basePrice: 650 },
      { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever Ltd.', basePrice: 245 },
    ],
  },
  'TSE': {
    name: 'TSE', exchange: 'XTKS', currency: 'JPY', country: 'JP',
    top10: [
      { symbol: '7203.T', name: 'Toyota Motor Corp.', basePrice: 180 },
      { symbol: '6758.T', name: 'Sony Group Corp.', basePrice: 95 },
      { symbol: '9984.T', name: 'SoftBank Group Corp.', basePrice: 45 },
      { symbol: '8306.T', name: 'Mitsubishi UFJ Financial', basePrice: 8 },
      { symbol: '8035.T', name: 'Tokyo Electron Ltd.', basePrice: 220 },
      { symbol: '6861.T', name: 'Keyence Corp.', basePrice: 400 },
      { symbol: '9983.T', name: 'Fast Retailing Co.', basePrice: 210 },
      { symbol: '8316.T', name: 'Sumitomo Mitsui Financial', basePrice: 7 },
      { symbol: '6954.T', name: 'Fanuc Corp.', basePrice: 42 },
      { symbol: '9432.T', name: 'Nippon Telegraph & Tel.', basePrice: 3 },
    ],
  },
  'HKEX': {
    name: 'HKEX', exchange: 'XHKG', currency: 'HKD', country: 'HK',
    top10: [
      { symbol: '0700.HK', name: 'Tencent Holdings Ltd.', basePrice: 380 },
      { symbol: '9988.HK', name: 'Alibaba Group Holding Ltd.', basePrice: 75 },
      { symbol: '3690.HK', name: 'Meituan', basePrice: 120 },
      { symbol: '1810.HK', name: 'Xiaomi Corp.', basePrice: 18 },
      { symbol: '9618.HK', name: 'JD.com Inc.', basePrice: 110 },
      { symbol: '9888.HK', name: 'Baidu Inc.', basePrice: 95 },
      { symbol: '1299.HK', name: 'AIA Group Ltd.', basePrice: 55 },
      { symbol: '0005.HK', name: 'HSBC Holdings PLC', basePrice: 65 },
      { symbol: '0011.HK', name: 'Hang Seng Bank Ltd.', basePrice: 95 },
      { symbol: '0002.HK', name: 'CLP Holdings Ltd.', basePrice: 65 },
    ],
  },
  'EURONEXT': {
    name: 'EURONEXT', exchange: 'XPAR', currency: 'EUR', country: 'EU',
    top10: [
      { symbol: 'SAP.DE', name: 'SAP SE', basePrice: 180 },
      { symbol: 'MC.PA', name: 'LVMH Moët Hennessy', basePrice: 750 },
      { symbol: 'OR.PA', name: "L'Oréal S.A.", basePrice: 420 },
      { symbol: 'AIR.PA', name: 'Airbus SE', basePrice: 145 },
      { symbol: 'SAN.PA', name: 'Sanofi S.A.', basePrice: 95 },
      { symbol: 'ALV.DE', name: 'Allianz SE', basePrice: 265 },
      { symbol: 'SIE.DE', name: 'Siemens AG', basePrice: 175 },
      { symbol: 'DTE.DE', name: 'Deutsche Telekom AG', basePrice: 24 },
      { symbol: 'BNP.PA', name: 'BNP Paribas S.A.', basePrice: 65 },
      { symbol: 'SU.PA', name: 'Schneider Electric SE', basePrice: 220 },
    ],
  },
}

export const stockSymbols: MarketSymbol[] = Object.values(EXCHANGE_STOCKS).flatMap(
  ex => ex.top10.map(s => ({
    symbol: s.symbol,
    name: s.name,
    exchange: ex.exchange,
    type: 'stock' as MarketType,
    currency: ex.currency,
    sector: 'Various',
  }))
)

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