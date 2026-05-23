import type { NewsItem } from './types'

const SOURCES = ['REUTERS', 'BLOOMBERG', 'CNBC', 'WSJ', 'FT', 'BARRONS', 'MARKETWATCH', 'INVESTING']
const CATEGORIES: NewsItem['category'][] = ['Market', 'Company', 'Earnings', 'Macro', 'Analyst']

interface Template {
  category: NewsItem['category']
  templates: { headline: string; impact: NewsItem['impact']; sentiment: NewsItem['sentiment'] }[]
}

const MARKET_NEWS: Template = {
  category: 'Market',
  templates: [
    { headline: 'Sector rotation accelerates as {industry} stocks surge', impact: 'medium', sentiment: 'bullish' },
    { headline: 'Market breadth weakens amid {industry} sell-off', impact: 'medium', sentiment: 'bearish' },
    { headline: 'Volatility index spikes on global growth concerns', impact: 'high', sentiment: 'bearish' },
    { headline: 'Bull flag forming on {market} index technicals', impact: 'medium', sentiment: 'bullish' },
    { headline: 'Trading volume surges 40% in opening hour', impact: 'low', sentiment: 'neutral' },
    { headline: '{market} futures point to higher open', impact: 'medium', sentiment: 'bullish' },
    { headline: 'Options flow signals big money positioning', impact: 'medium', sentiment: 'neutral' },
  ],
}

const COMPANY_NEWS: Template = {
  category: 'Company',
  templates: [
    { headline: '{symbol}: {name} announces new $500M buyback program', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} faces antitrust probe in EU', impact: 'high', sentiment: 'bearish' },
    { headline: '{symbol}: {name} launches innovative product line', impact: 'medium', sentiment: 'bullish' },
    { headline: '{symbol}: {name} settles class-action lawsuit for $120M', impact: 'medium', sentiment: 'neutral' },
    { headline: '{symbol}: {name} expands into Southeast Asian market', impact: 'medium', sentiment: 'bullish' },
    { headline: '{symbol}: {name} CEO sells 500K shares amid insider probe', impact: 'high', sentiment: 'bearish' },
    { headline: '{symbol}: {name} secures major government contract', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} acquires AI startup for $2.1B', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} downgraded by key analyst', impact: 'medium', sentiment: 'bearish' },
    { headline: '{symbol}: {name} reports supply chain disruption', impact: 'medium', sentiment: 'bearish' },
  ],
}

const EARNINGS_NEWS: Template = {
  category: 'Earnings',
  templates: [
    { headline: '{symbol}: {name} beats Q2 estimates, raises guidance', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} misses revenue targets, stock slides', impact: 'high', sentiment: 'bearish' },
    { headline: '{symbol}: {name} reports inline earnings, mixed outlook', impact: 'medium', sentiment: 'neutral' },
    { headline: '{symbol}: {name} earnings beat driven by margin expansion', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} posts record quarterly profit', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} cuts full-year forecast amid headwinds', impact: 'high', sentiment: 'bearish' },
    { headline: '{symbol}: {name} earnings call highlights growth strategy', impact: 'medium', sentiment: 'neutral' },
  ],
}

const MACRO_NEWS: Template = {
  category: 'Macro',
  templates: [
    { headline: 'Fed officials signal hawkish stance on inflation', impact: 'high', sentiment: 'bearish' },
    { headline: 'ECB holds rates steady at 4.25%', impact: 'medium', sentiment: 'neutral' },
    { headline: 'US jobs report beats expectations with 280K added', impact: 'high', sentiment: 'bullish' },
    { headline: 'CPI data comes in hot at 3.4% YoY', impact: 'high', sentiment: 'bearish' },
    { headline: 'GDP growth revised up to 3.1% annualized', impact: 'high', sentiment: 'bullish' },
    { headline: 'Treasury yields retreat on safe-haven demand', impact: 'medium', sentiment: 'bullish' },
    { headline: 'Global supply chain pressures ease in May', impact: 'medium', sentiment: 'bullish' },
    { headline: 'Dollar strengthens against major currencies', impact: 'medium', sentiment: 'neutral' },
    { headline: 'Crude oil prices slide on demand concerns', impact: 'medium', sentiment: 'bearish' },
    { headline: 'Retail sales data shows consumer resilience', impact: 'medium', sentiment: 'bullish' },
  ],
}

const ANALYST_NEWS: Template = {
  category: 'Analyst',
  templates: [
    { headline: '{symbol}: {name} upgraded to Buy at Goldman Sachs', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} downgraded to Neutral at Morgan Stanley', impact: 'medium', sentiment: 'bearish' },
    { headline: '{symbol}: {name} price target raised to ${price}', impact: 'medium', sentiment: 'bullish' },
    { headline: '{symbol}: {name} initiated with Overweight at JP Morgan', impact: 'medium', sentiment: 'bullish' },
    { headline: '{symbol}: {name} added to conviction list', impact: 'medium', sentiment: 'bullish' },
    { headline: '{symbol}: {name} sees rare double upgrade', impact: 'high', sentiment: 'bullish' },
    { headline: '{symbol}: {name} analyst day fails to impress', impact: 'medium', sentiment: 'bearish' },
    { headline: '{symbol}: {name} top pick for Q2, analyst says', impact: 'medium', sentiment: 'bullish' },
  ],
}

const INDUSTRIES = ['Technology', 'Financial', 'Healthcare', 'Energy', 'Consumer', 'Industrial', 'Utilities', 'Real Estate']
const MARKETS = ['S&P 500', 'NASDAQ', 'Dow Jones', 'Russell 2000', 'FTSE 100', 'Nikkei 225']

let newsIdCounter = 0

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function generateHeadline(
  template: { headline: string; impact: NewsItem['impact']; sentiment: NewsItem['sentiment'] },
  symbols: { symbol: string; name: string; basePrice: number }[],
): string {
  const sym = pick(symbols)
  let headline = template.headline
    .replace(/{symbol}/g, sym.symbol)
    .replace(/{name}/g, sym.name)
    .replace(/{industry}/g, pick(INDUSTRIES))
    .replace(/{market}/g, pick(MARKETS))
    .replace(/{price}/g, (sym.basePrice * (1 + (Math.random() - 0.5) * 0.2)).toFixed(0))
  return headline
}

export function generateNewsItem(
  timestamp: number,
  symbols: { symbol: string; name: string; basePrice: number }[],
): NewsItem {
  const category = pick(CATEGORIES)
  let templateCategory: Template

  switch (category) {
    case 'Market': templateCategory = MARKET_NEWS; break
    case 'Company': templateCategory = COMPANY_NEWS; break
    case 'Earnings': templateCategory = EARNINGS_NEWS; break
    case 'Macro': templateCategory = MACRO_NEWS; break
    case 'Analyst': templateCategory = ANALYST_NEWS; break
  }

  const template = pick(templateCategory.templates)
  const headline = generateHeadline(template, symbols)
  const symCount = category === 'Company' || category === 'Earnings' || category === 'Analyst' ? 1 : Math.floor(Math.random() * 2) + 1
  const relatedSymbols: string[] = []
  for (let i = 0; i < symCount; i++) {
    const sym = pick(symbols)
    if (!relatedSymbols.includes(sym.symbol)) relatedSymbols.push(sym.symbol)
  }

  newsIdCounter++
  const source = pick(SOURCES)

  return {
    id: `news-${timestamp}-${newsIdCounter}`,
    time: timestamp,
    source,
    headline,
    category,
    impact: template.impact,
    sentiment: template.sentiment,
    symbols: relatedSymbols,
  }
}

export function generateInitialNews(
  count: number,
  symbols: { symbol: string; name: string; basePrice: number }[],
): NewsItem[] {
  const now = Math.floor(Date.now() / 1000)
  const items: NewsItem[] = []
  for (let i = 0; i < count; i++) {
    items.push(generateNewsItem(now - (count - i) * 120, symbols))
  }
  return items
}