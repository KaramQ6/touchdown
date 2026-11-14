import type { Axis } from '../engine/types'
import { SourceBadge } from './SourceBadge'

interface AxisCardProps {
  axis: Axis
  title: string
  value: number
  driver: string
  sourceIds: readonly string[]
  note?: string
}

/** One sub-score: number, bar, and its biggest driver in one line (SPEC M3). */
export function AxisCard({ axis, title, value, driver, sourceIds, note }: AxisCardProps) {
  return (
    <article className="flex flex-col gap-3 border border-line bg-panel/80 p-5">
      <header className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
          <span className="text-ink">{axis}</span> · {title}
        </p>
        <SourceBadge title={`${axis}: ${title}`} ids={sourceIds} />
      </header>
      <p className="font-mono text-4xl font-semibold tabular-nums">{Math.round(value)}</p>
      <div className="h-1 bg-line" aria-hidden>
        <div className="h-full bg-ink/70 transition-[width] duration-700" style={{ width: `${value}%` }} />
      </div>
      <p className="text-sm">{driver}</p>
      {note && <p className="text-xs text-dim">{note}</p>}
    </article>
  )
}
