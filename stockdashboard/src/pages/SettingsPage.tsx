export default function SettingsPage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">System Settings</div>
      <div className="terminal-panel-dim p-4 max-w-lg space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs">Sound Effects</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-9 h-5 bg-[var(--border-dim)] peer-checked:bg-[var(--yellow)] transition-colors" />
          </label>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs">Real-time Updates</span>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" defaultChecked />
            <div className="w-9 h-5 bg-[var(--border-dim)] peer-checked:bg-[var(--yellow)] transition-colors" />
          </label>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Ticker Interval</div>
          <select className="terminal-input w-full">
            <option>1s</option>
            <option>5s</option>
            <option>15s</option>
            <option>30s</option>
            <option>1m</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Data Provider</div>
          <select className="terminal-input w-full">
            <option>Simulated (Local)</option>
            <option>Yahoo Finance</option>
            <option>Alpha Vantage</option>
            <option>IEX Cloud</option>
          </select>
        </div>
      </div>
    </div>
  )
}
