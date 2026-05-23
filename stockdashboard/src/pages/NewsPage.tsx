import { useState, useMemo } from 'react'
import { useStore } from '../store/store'
import type { NewsItem } from '../lib/types'

const CATEGORIES = ['All', 'Market', 'Company', 'Earnings', 'Macro', 'Analyst'] as const
const IMPACTS = ['All', 'high', 'medium', 'low'] as const
const SENTIMENTS = ['All', 'bullish', 'bearish', 'neutral'] as const

const CATEGORY_COLORS: Record<string, string> = {
  Market: 'text-[var(--cyan)]',
  Company: 'text-[var(--orange)]',
  Earnings: 'text-[var(--green)]',
  Macro: 'text-[var(--yellow)]',
  Analyst: 'text-[var(--purple)]',
}

const SENTIMENT_ICON: Record<string, string> = {
  bullish: '▲',
  bearish: '▼',
  neutral: '◆',
}

const SENTIMENT_COLORS: Record<string, string> = {
  bullish: 'text-[var(--green)]',
  bearish: 'text-[var(--red)]',
  neutral: 'text-[var(--yellow)]',
}

const IMPACT_COLORS: Record<string, string> = {
  high: 'bg-[var(--red)]/20 text-[var(--red)] border-[var(--red)]/30',
  medium: 'bg-[var(--yellow)]/20 text-[var(--yellow)] border-[var(--yellow)]/30',
  low: 'bg-[var(--text-secondary)]/10 text-[var(--text-secondary)] border-[var(--text-secondary)]/20',
}

function timeAgo(timestamp: number): string {
  const diff = Date.now() / 1000 - timestamp
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NewsPage() {
  const news = useStore(s => s.news)
  const activeMarket = useStore(s => s.prices.activeMarket)
  const setActiveSymbol = useStore(s => s.setActiveSymbol)

  const [categoryFilter, setCategoryFilter] = useState<string>('All')
  const [impactFilter, setImpactFilter] = useState<string>('All')
  const [sentimentFilter, setSentimentFilter] = useState<string>('All')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return news.filter(item => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) return false
      if (impactFilter !== 'All' && item.impact !== impactFilter) return false
      if (sentimentFilter !== 'All' && item.sentiment !== sentimentFilter) return false
      if (search) {
        const q = search.toLowerCase()
        if (!item.headline.toLowerCase().includes(q) &&
            !item.symbols.some(s => s.toLowerCase().includes(q)) &&
            !item.source.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [news, categoryFilter, impactFilter, sentimentFilter, search])

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: news.length }
    CATEGORIES.slice(1).forEach(cat => { c[cat] = news.filter(n => n.category === cat).length })
    return c
  }, [news])

  return (
    <div className="h-full flex flex-col overflow-hidden p-4">
      <div className="flex items-center justify-between mb-3 shrink-0">
        <div className="section-title mb-0">Market News Feed</div>
        <div className="text-[10px] text-[var(--text-secondary)]">
          <span className="pulse-dot green mr-1" />
          Live · {news.length} stories · {activeMarket}
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3 shrink-0 flex-wrap">
        <div className="flex items-center gap-1 text-[10px]">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2 py-1 rounded transition-colors ${
                categoryFilter === cat
                  ? 'bg-[var(--yellow)] text-black font-semibold'
                  : 'text-[var(--text-secondary)] hover:text-white hover:bg-[var(--bg-tertiary)]'
              }`}
            >
              {cat}{cat === 'All' ? '' : ` (${counts[cat] || 0})`}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[10px]">
          <select
            value={impactFilter}
            onChange={e => setImpactFilter(e.target.value)}
            className="bg-[var(--bg-tertiary)] text-white px-2 py-1 rounded text-[10px] outline-none border border-transparent focus:border-gray-500"
          >
            {IMPACTS.map(i => <option key={i} value={i}>{i === 'All' ? 'All Impact' : i}</option>)}
          </select>
          <select
            value={sentimentFilter}
            onChange={e => setSentimentFilter(e.target.value)}
            className="bg-[var(--bg-tertiary)] text-white px-2 py-1 rounded text-[10px] outline-none border border-transparent focus:border-gray-500"
          >
            {SENTIMENTS.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sentiment' : s}</option>)}
          </select>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search news..."
            className="bg-[var(--bg-tertiary)] text-white px-2 py-1 rounded text-[10px] w-32 outline-none border border-transparent focus:border-gray-500 placeholder:text-[var(--text-secondary)]"
          />
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
        {filtered.length === 0 && (
          <div className="text-xs text-[var(--text-secondary)] text-center py-8">No news matches your filters</div>
        )}
        {filtered.map(item => (
          <NewsRow key={item.id} item={item} onSymbolClick={setActiveSymbol} />
        ))}
      </div>
    </div>
  )
}

function NewsRow({ item, onSymbolClick }: { item: NewsItem; onSymbolClick: (s: string) => void }) {
  return (
    <div className="flex items-start gap-2 px-2 py-1.5 hover:bg-[var(--bg-tertiary)]/30 rounded transition-colors group">
      <span className="text-[10px] text-[var(--text-secondary)] shrink-0 w-12 font-mono tabular-nums">
        {timeAgo(item.time)}
      </span>
      <span className={`text-[10px] font-bold shrink-0 w-16 ${CATEGORY_COLORS[item.category] || ''}`}>
        {item.category.toUpperCase()}
      </span>
      <span className="text-[10px] font-bold shrink-0 w-20 text-[var(--text-secondary)]">
        [{item.source}]
      </span>
      <div className="flex-1 min-w-0">
        <span className="text-[11px] leading-tight">{item.headline}</span>
        {item.symbols.length > 0 && (
          <span className="ml-2 space-x-1">
            {item.symbols.map(sym => (
              <button
                key={sym}
                onClick={() => onSymbolClick(sym)}
                className="text-[10px] text-[var(--yellow)] hover:underline font-mono cursor-pointer"
              >
                {sym}
              </button>
            ))}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`text-[10px] ${SENTIMENT_COLORS[item.sentiment]}`}>
          {SENTIMENT_ICON[item.sentiment]}
        </span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded border ${IMPACT_COLORS[item.impact]}`}>
          {item.impact.toUpperCase()}
        </span>
      </div>
    </div>
  )
}