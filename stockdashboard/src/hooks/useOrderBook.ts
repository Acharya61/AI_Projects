import { useStore } from '../store/store'

export function useOrderBook(symbol: string) {
  return useStore(s => s.prices.orderBooks[symbol])
}
