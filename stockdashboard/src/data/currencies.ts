export interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  locale: string
}

export const currencies: CurrencyInfo[] = [
  { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
  { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'HKD', symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'zh-HK' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc', locale: 'de-CH' },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  { code: 'KRW', symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
]

export const currencyRates: Record<string, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.50,
  CNY: 7.24,
  HKD: 7.82,
  CHF: 0.88,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.12,
  KRW: 1320.50,
  BRL: 4.97,
}

export function convertCurrency(amount: number, from: string, to: string): number {
  if (from === to) return amount
  const usd = amount / currencyRates[from]
  return usd * currencyRates[to]
}

export function formatCurrency(amount: number, currencyCode: string): string {
  const c = currencies.find(c => c.code === currencyCode)
  if (!c) return `${currencyCode} ${amount.toFixed(2)}`
  return `${c.symbol}${amount.toLocaleString(c.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
