export default function ProfilePage() {
  return (
    <div className="flex-1 overflow-auto p-4">
      <div className="section-title">Profile Settings</div>
      <div className="terminal-panel-dim p-4 max-w-lg space-y-4">
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Username</div>
          <input className="terminal-input w-full" defaultValue="trader_42" />
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Default Currency</div>
          <select className="terminal-input w-full">
            <option>USD ($)</option>
            <option>EUR (€)</option>
            <option>GBP (£)</option>
            <option>JPY (¥)</option>
          </select>
        </div>
        <div>
          <div className="text-xs text-[var(--text-secondary)] mb-1">Default Exchange</div>
          <select className="terminal-input w-full">
            <option>NYSE</option>
            <option>NASDAQ</option>
            <option>LSE</option>
          </select>
        </div>
        <div className="flex gap-2 pt-2">
          <button className="btn-terminal primary">Save</button>
          <button className="btn-terminal">Cancel</button>
        </div>
      </div>
    </div>
  )
}
