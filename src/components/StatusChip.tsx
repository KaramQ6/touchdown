import type { ReactNode } from 'react'
import type { Band, Escalation, Status } from '../engine/types'

export const BAND_LABEL: Record<Band, string> = { ready: 'Ready', limited: 'Limited', 'not-ready': 'Not Ready' }
export const BAND_TONE: Record<Band, Status> = { ready: 'green', limited: 'yellow', 'not-ready': 'red' }
export const LEVEL_TONE: Record<Escalation['level'], Status> = { 0: 'green', 1: 'yellow', 2: 'red', 3: 'red' }

export const TONE_TEXT: Record<Status, string> = { green: 'text-ok', yellow: 'text-warn', red: 'text-bad' }
const TONE_CHIP: Record<Status, string> = {
  green: 'text-ok border-ok/40 bg-ok/10',
  yellow: 'text-warn border-warn/40 bg-warn/10',
  red: 'text-bad border-bad/40 bg-bad/10',
}

export function StatusChip({ tone, children }: { tone: Status; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[11px] font-semibold tracking-[0.15em] uppercase ${TONE_CHIP[tone]}`}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}
