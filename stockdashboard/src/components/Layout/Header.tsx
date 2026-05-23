import type { ReactNode } from 'react'
import { useStore } from '../../store/store'

interface Props {
  right?: ReactNode
}

export function Header({ right }: Props) {
  const indices = useStore(s => s.prices.indices)

  return (
    <header className="flex items-center h-12 px-4 bg-[var(--bg-secondary)] border-b border-gray-800 text-sm gap-6 shrink-0">
      <div className="text-lg font-bold text-[var(--yellow)] mr-2">STOCKDASH</div>
      {indices.map(idx => (
        <div key={idx.name} className="flex items-center gap-2">
          <span className="text-[var(--text-secondary)]">{idx.name}</span>
          <span className="font-medium">{idx.price.toLocaleString()}</span>
          <span className={idx.change >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
            {idx.change >= 0 ? '+' : ''}{idx.change.toFixed(2)} ({idx.changePercent >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%)
          </span>
        </div>
      ))}
      {right && <div className="ml-auto">{right}</div>}
    </header>
  )
}
