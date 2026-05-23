import type { ReactNode } from 'react'

interface Props {
  chart: ReactNode
  orderPanel: ReactNode
  orderBook: ReactNode
  portfolio: ReactNode
  watchlist: ReactNode
  tradeHistory: ReactNode
  marketOverview: ReactNode
}

export function DashboardLayout({
  chart,
  orderPanel,
  orderBook,
  portfolio,
  watchlist,
  tradeHistory,
  marketOverview,
}: Props) {
  return (
    <div className="flex-1 grid p-2 gap-2" style={{
      gridTemplateColumns: '280px 1fr 300px',
      gridTemplateRows: 'auto 1fr auto auto',
      gridTemplateAreas: `
        "watchlist  chart     orderbook"
        "watchlist  chart     orderbook"
        "market     portfolio orderpanel"
        "market     history   orderpanel"
      `,
    }}>
      <div style={{ gridArea: 'watchlist' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {watchlist}
      </div>
      <div style={{ gridArea: 'chart' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto flex flex-col">
        {chart}
      </div>
      <div style={{ gridArea: 'orderbook' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {orderBook}
      </div>
      <div style={{ gridArea: 'market' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {marketOverview}
      </div>
      <div style={{ gridArea: 'portfolio' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {portfolio}
      </div>
      <div style={{ gridArea: 'orderpanel' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {orderPanel}
      </div>
      <div style={{ gridArea: 'history' }} className="bg-[var(--bg-secondary)] rounded overflow-y-auto">
        {tradeHistory}
      </div>
    </div>
  )
}
