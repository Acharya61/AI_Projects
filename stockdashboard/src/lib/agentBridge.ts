import type { AgentConfig, WsMessage } from './agentTypes'

type MessageHandler = (data: Record<string, unknown>) => void

class AgentBridge {
  private ws: WebSocket | null = null
  private handlers = new Map<string, Set<MessageHandler>>()
  private wildcardHandlers = new Set<MessageHandler>()
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private _url = ''

  get connected() {
    return this.ws?.readyState === WebSocket.OPEN
  }

  connect(url: string): Promise<void> {
    this._url = url
    return new Promise((resolve, reject) => {
      try {
        const ws = new WebSocket(url)
        ws.onopen = () => {
          this.ws = ws
          resolve()
        }
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as Record<string, unknown>
            const type = data.type as string
            const typeHandlers = this.handlers.get(type)
            if (typeHandlers) {
              typeHandlers.forEach(h => h(data))
            }
            this.wildcardHandlers.forEach(h => h(data))
          } catch { /* ignore parse errors */ }
        }
        ws.onclose = () => {
          this.ws = null
          this.scheduleReconnect()
        }
        ws.onerror = () => {
          reject(new Error('WebSocket connection failed'))
        }
      } catch (err) {
        reject(err)
      }
    })
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.ws?.close()
    this.ws = null
  }

  send(msg: WsMessage) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg))
    }
  }

  on(type: string, handler: MessageHandler): () => void {
    if (!this.handlers.has(type)) {
      this.handlers.set(type, new Set())
    }
    this.handlers.get(type)!.add(handler)
    return () => this.handlers.get(type)?.delete(handler)
  }

  onAny(handler: MessageHandler): () => void {
    this.wildcardHandlers.add(handler)
    return () => this.wildcardHandlers.delete(handler)
  }

  start(config: AgentConfig) {
    this.send({ type: 'start', ...config })
  }

  stop() {
    this.send({ type: 'stop' })
  }

  reset(cash?: number) {
    this.send({ type: 'reset', cash: cash ?? 100000 })
  }

  tick(data: { price: number; open: number; high: number; low: number; volume: number; indicators?: Record<string, number> }) {
    this.send({ type: 'tick', ...data })
  }

  train(episodes: number) {
    this.send({ type: 'train', episodes })
  }

  getStatus() {
    this.send({ type: 'get_status' })
  }

  predict(symbol: string, horizonTicks = 10, horizonBars = 5) {
    this.send({ type: 'predict', symbol, horizon_ticks: horizonTicks, horizon_bars: horizonBars })
  }

  predictAll(horizonTicks = 10, horizonBars = 5) {
    this.send({ type: 'predict_all', horizon_ticks: horizonTicks, horizon_bars: horizonBars })
  }

  sessionStart(config: { duration: number; max_stocks?: number; initial_cash?: number; horizon_ticks?: number; horizon_bars?: number; pre_session_time?: number }) {
    this.send({ type: 'session_start', ...config })
  }

  sessionStop() {
    this.send({ type: 'session_stop' })
  }

  sessionStatus() {
    this.send({ type: 'session_status' })
  }

  getPerformance() {
    this.send({ type: 'get_performance' })
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      if (this._url) {
        this.connect(this._url).catch(() => {})
      }
    }, 3000)
  }
}

export const agentBridge = new AgentBridge()
