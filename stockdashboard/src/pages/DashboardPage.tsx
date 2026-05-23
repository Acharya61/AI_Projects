import { CandlestickChart } from '../components/Chart/CandlestickChart'
import { OrderPanel } from '../components/Trading/OrderPanel'
import { OrderBook } from '../components/Trading/OrderBook'
import { TradeHistory } from '../components/Trading/TradeHistory'
import { PortfolioSummary } from '../components/Portfolio/PortfolioSummary'
import { Watchlist } from '../components/Watchlist/Watchlist'
import { MarketOverview } from '../components/Market/MarketOverview'
import { DashboardLayout } from '../components/Layout/DashboardLayout'
import { DataPanel } from '../components/Data/DataPanel'
import { BacktestPanel } from '../components/Backtest/BacktestPanel'
import { Header } from '../components/Layout/Header'

export default function DashboardPage() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <Header right={<><DataPanel /><BacktestPanel /></>} />
      <div className="flex-1 overflow-auto">
        <DashboardLayout
          chart={<CandlestickChart />}
          orderPanel={<OrderPanel />}
          orderBook={<OrderBook />}
          portfolio={<PortfolioSummary />}
          watchlist={<Watchlist />}
          tradeHistory={<TradeHistory />}
          marketOverview={<MarketOverview />}
        />
      </div>
    </div>
  )
}
