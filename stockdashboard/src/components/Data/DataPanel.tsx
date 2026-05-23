import { useState, useEffect, useCallback } from 'react'
import { getTableCounts, getDateRange, exportTableAsCSV, clearAll } from '../../lib/database'

const TABLES = ['ticks', 'trades', 'snapshots', 'indicators'] as const

export function DataPanel() {
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [dateRange, setDateRange] = useState<Record<string, { from: string; to: string } | null>>({})
  const [open, setOpen] = useState(false)

  const refresh = useCallback(async () => {
    setCounts(await getTableCounts())
    setDateRange(await getDateRange())
  }, [])

  useEffect(() => {
    if (open) refresh()
  }, [open, refresh])

  const handleExport = async (table: string) => {
    const blob = await exportTableAsCSV(table)
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${table}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClear = async () => {
    await clearAll()
    refresh()
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ml-auto text-xs text-[var(--text-secondary)] hover:text-white px-3 py-1 rounded bg-[var(--bg-tertiary)]"
      >
        Data
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setOpen(false)}>
          <div
            className="bg-[var(--bg-secondary)] rounded-lg w-[520px] max-h-[80vh] overflow-y-auto p-5 shadow-xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Logged Data</h2>
              <button onClick={() => setOpen(false)} className="text-[var(--text-secondary)] hover:text-white text-xl leading-none">&times;</button>
            </div>

            <div className="space-y-2 text-sm">
              {TABLES.map(table => (
                <div key={table} className="flex items-center justify-between bg-[var(--bg-tertiary)] rounded px-3 py-2">
                  <div>
                    <span className="font-medium capitalize">{table}</span>
                    <span className="text-[var(--text-secondary)] ml-2">{counts[table]?.toLocaleString() ?? 0} records</span>
                    {dateRange[table] && (
                      <div className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {dateRange[table]!.from} — {dateRange[table]!.to}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleExport(table)}
                    disabled={!counts[table]}
                    className="text-xs px-3 py-1 rounded bg-[var(--bg-primary)] hover:bg-gray-700 disabled:opacity-30"
                  >
                    Export CSV
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-between mt-5 pt-3 border-t border-gray-800">
              <button
                onClick={handleClear}
                className="text-xs px-3 py-1.5 rounded bg-[var(--red)]/20 text-[var(--red)] hover:bg-[var(--red)]/30"
              >
                Clear All Data
              </button>
              <button
                onClick={refresh}
                className="text-xs px-3 py-1.5 rounded bg-[var(--bg-tertiary)] hover:bg-gray-700"
              >
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
