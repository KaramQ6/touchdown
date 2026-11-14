import type { Source } from '../engine/types'

/** CLAUDE.md rule 5: anything not from a real measurement says SIMULATED. Renders nothing for manual entry. */
export function SimChip({ source }: { source: Source }) {
  if (source !== 'wearable-sim') return null
  return (
    <span className="rounded-sm border border-dashed border-dim/60 px-1.5 py-0.5 font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
      Simulated
    </span>
  )
}
