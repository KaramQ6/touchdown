import { Component, type ReactNode } from 'react'
import { useMission } from '../store/mission'

interface Props {
  children: ReactNode
}

/**
 * Catches a render error so the app shows a way out instead of a blank page.
 * React only supports this as a class component. Remount it with a new `key` to retry.
 */
export class ErrorBoundary extends Component<Props, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  private resetDemo = () => {
    useMission.getState().resetDemo()
    this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <div role="alert" className="mx-auto flex max-w-xl flex-col gap-4 p-10">
        <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Screen error</p>
        <h1 className="text-2xl font-semibold">This screen could not be shown.</h1>
        <p className="text-sm text-dim">Your saved check-ins are kept. Reset the demo data or reload the app to continue.</p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={this.resetDemo}
            className="border border-accent bg-accent/10 px-4 py-2 font-mono text-xs tracking-[0.15em] text-accent uppercase hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Reset demo
          </button>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="border border-edge px-4 py-2 font-mono text-xs tracking-[0.15em] text-dim uppercase hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            Reload
          </button>
        </div>
      </div>
    )
  }
}
