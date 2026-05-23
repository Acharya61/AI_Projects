import type { Position } from '../../lib/types'

interface Props {
  position: Position
  currentPrice: number
}

export function PositionCard({ position, currentPrice }: Props) {
  const marketValue = position.quantity * currentPrice
  const costBasis = position.quantity * position.avgEntry
  const unrealizedPL = marketValue - costBasis
  const unrealizedPercent = costBasis > 0 ? (unrealizedPL / costBasis) * 100 : 0

  return (
    <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-800/30 text-xs">
      <div>
        <div className="font-semibold text-sm">{position.symbol}</div>
        <div className="text-[var(--text-secondary)]">{position.quantity} shares</div>
      </div>
      <div className="text-right">
        <div>${currentPrice.toFixed(2)}</div>
        <div className="text-[var(--text-secondary)]">Avg ${position.avgEntry.toFixed(2)}</div>
      </div>
      <div className="text-right">
        <div className={unrealizedPL >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
          {unrealizedPL >= 0 ? '+' : ''}${unrealizedPL.toFixed(2)}
        </div>
        <div className={unrealizedPL >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}>
          ({unrealizedPercent >= 0 ? '+' : ''}{unrealizedPercent.toFixed(2)}%)
        </div>
      </div>
    </div>
  )
}
