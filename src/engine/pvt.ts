import { PVT_DELAY_MS, PVT_LAPSE_MS } from './constants'
import type { PvtResult } from './types'

/** SPEC M2: random wait before the next stimulus, 2-10 s. `rand` returns [0, 1). */
export const nextStimulusDelayMs = (rand: () => number) => PVT_DELAY_MS.min + rand() * (PVT_DELAY_MS.max - PVT_DELAY_MS.min)

/** One trial: a reaction time, or a tap before the stimulus. */
export type PvtResponse = { kind: 'rt'; ms: number } | { kind: 'false-start' }

/** SPEC M2: median RT, lapses (RT >= 500 ms), false starts counted separately. Null if no valid RT. */
export function summarizePvt(responses: readonly PvtResponse[]): PvtResult | null {
  const rts: number[] = []
  let falseStarts = 0
  for (const r of responses) {
    if (r.kind === 'rt') rts.push(r.ms)
    else falseStarts++
  }
  if (rts.length === 0) return null
  return {
    medianMs: median(rts),
    lapses: rts.filter((ms) => ms >= PVT_LAPSE_MS).length,
    falseStarts,
  }
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
