import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useStockData } from './hooks/useStockData'
import { usePortfolio } from './hooks/usePortfolio'
import { useLogger } from './hooks/useLogger'
import { useHotkeys } from './hooks/useHotkeys'
import { ToastProvider } from './components/Common/Toast'
import { ErrorBoundary } from './components/Common/ErrorBoundary'
import { Sidebar } from './components/Layout/Sidebar'
import { TopBar } from './components/Layout/TopBar'
import { StatusBar } from './components/Layout/StatusBar'
import DashboardPage from './pages/DashboardPage'
import TradePage from './pages/TradePage'
import ChartsPage from './pages/ChartsPage'
import MarketsPage from './pages/MarketsPage'
import NewsPage from './pages/NewsPage'
import AgentPageWrapper from './pages/AgentPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import ProvidersPage from './pages/ProvidersPage'

function AppShell() {
  const { initialized } = useStockData()
  usePortfolio()
  useLogger()
  useHotkeys()

  if (!initialized) {
    return (
      <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--text-secondary)]">
        Loading market data...
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
      <TopBar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-y-auto min-h-0">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/trade" element={<TradePage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/markets" element={<MarketsPage />} />
            <Route path="/news" element={<NewsPage />} />
            <Route path="/agent" element={<AgentPageWrapper />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/providers" element={<ProvidersPage />} />
          </Routes>
        </div>
      </div>
      <StatusBar />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <ErrorBoundary>
          <AppShell />
        </ErrorBoundary>
      </ToastProvider>
    </BrowserRouter>
  )
}
