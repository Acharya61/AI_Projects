import type { ReactNode } from 'react'
import { useState } from 'react'

interface Props {
  chart: ReactNode
  orderPanel: ReactNode
  orderBook: ReactNode
  portfolio: ReactNode
  watchlist: ReactNode
  tradeHistory: ReactNode
  marketOverview: ReactNode
}

const RIGHT_TABS = [
  { key: 'orderbook', label: 'Order Book' },
  { key: 'trade', label: 'Trade' },
  { key: 'history', label: 'History' },
] as const

type RightTab = (typeof RIGHT_TABS)[number]['key']

export function DashboardLayout({
  chart,
  orderPanel,
  orderBook,
  portfolio,
  watchlist,
  tradeHistory,
  marketOverview,
}: Props) {
  const [rightTab, setRightTab] = useState<RightTab>('orderbook')

  const rightContent = {
    orderbook: orderBook,
    trade: orderPanel,
    history: tradeHistory,
  }[rightTab]

  return (
    <div className="flex-1 grid p-2 gap-2" style={{
      gridTemplateColumns: '220px 2fr 300px',
      gridTemplateRows: '1fr auto',
      gridTemplateAreas: `
        "watchlist  chart     right"
        "market     chart     right"
      `,
    }}>
      <div style={{ gridArea: 'watchlist' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {watchlist}
      </div>
      <div style={{ gridArea: 'chart' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto flex flex-col">
        {chart}
      </div>
      <div style={{ gridArea: 'market' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {marketOverview}
      </div>
      <div style={{ gridArea: 'right' }} className="flex flex-col gap-2 overflow-hidden">
        <div className="bg-[var(--bg-secondary)] rounded flex flex-col overflow-hidden flex-1">
          <div className="flex border-b border-[var(--border-dim)] shrink-0">
            {RIGHT_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setRightTab(tab.key)}
                className={`flex-1 text-xs py-2 font-medium transition-colors ${
                  rightTab === tab.key
                    ? 'text-[var(--yellow)] bg-[var(--bg-tertiary)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--yellow)]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {rightContent}
          </div>
        </div>
        <div className="bg-[var(--bg-secondary)] rounded overflow-y-auto shrink-0">
          {portfolio}
        </div>
      </div>
    </div>
  )
}
