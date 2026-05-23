import { useEffect } from 'react'
import { useStore } from '../store/store'
import { startLogger } from '../lib/logger'

export function useLogger() {
  const initialized = useStore(s => s.initialized)

  useEffect(() => {
    if (!initialized) return
    const cleanup = startLogger(useStore)
    return cleanup
  }, [initialized])
}
