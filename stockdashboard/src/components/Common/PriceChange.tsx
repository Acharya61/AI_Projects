interface Props {
  value: number
  percent?: boolean
  showSign?: boolean
}

export function PriceChange({ value, percent = false, showSign = true }: Props) {
  const isPositive = value >= 0
  const color = isPositive ? 'text-[var(--green)]' : 'text-[var(--red)]'
  const prefix = showSign && isPositive ? '+' : ''
  const suffix = percent ? '%' : ''

  return (
    <span className={color}>
      {prefix}{value.toFixed(2)}{suffix}
    </span>
  )
}
