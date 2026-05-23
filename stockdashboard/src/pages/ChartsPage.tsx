import { CandlestickChart } from '../components/Chart/CandlestickChart'

export default function ChartsPage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Advanced Charts</div>
      <CandlestickChart />
    </div>
  )
}
