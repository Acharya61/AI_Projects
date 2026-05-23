import { Component, type ReactNode, type ErrorInfo } from 'react'

interface Props { children: ReactNode }
interface State { error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error) { return { error } }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(error, info) }
  render() {
    if (this.state.error) {
      return (
        <div className="h-screen flex items-center justify-center bg-[var(--bg-primary)] text-[var(--red)] p-4">
          <div className="text-center">
            <div className="text-lg font-bold mb-2">Application Error</div>
            <pre className="text-xs text-[var(--text-secondary)] max-w-xl overflow-auto">
              {this.state.error.message}
            </pre>
            <button onClick={() => window.location.reload()} className="mt-4 btn-terminal primary">
              Reload
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
