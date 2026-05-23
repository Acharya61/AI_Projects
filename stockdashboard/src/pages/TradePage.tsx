import { OrderPanel } from '../components/Trading/OrderPanel'
import { OrderBook } from '../components/Trading/OrderBook'
import { TradeHistory } from '../components/Trading/TradeHistory'
import { PortfolioSummary } from '../components/Portfolio/PortfolioSummary'

export default function TradePage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Trade Terminal</div>
      <div className="grid grid-cols-3 gap-4">
        <OrderPanel />
        <div className="space-y-4">
          <OrderBook />
          <PortfolioSummary />
        </div>
        <TradeHistory />
      </div>
    </div>
  )
}
