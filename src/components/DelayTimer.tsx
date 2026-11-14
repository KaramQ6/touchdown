import { useState } from 'react'
import { roundTripMin } from '../engine/escalation'
import { SourceBadge } from './SourceBadge'
import { formatDuration, useNow } from './Countdown'

/** SPEC 4.7: counts down the Earth round trip from the moment it is shown. */
export function DelayTimer({ oneWayMin }: { oneWayMin: number }) {
  const roundTrip = roundTripMin(oneWayMin)
  const [startedAt] = useState(() => Date.now())
  const now = useNow()

  const left = roundTrip * 60 - (now - startedAt) / 1000

  return (
    <div className="flex flex-col gap-4 border border-bad/40 bg-bad/5 p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Comm delay</p>
        <SourceBadge title="Earth-Mars communication delay" ids={['comm_delay']} />
      </div>
      <p className="text-sm">{left > 0 ? 'Earliest reply from Earth in' : 'Earliest reply window is open'}</p>
      <p className="font-mono text-6xl font-semibold tabular-nums" role="timer" aria-live="off">
        {formatDuration(left)}
      </p>
      <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-dim uppercase">One-way</dt>
          <dd className="tabular-nums">{oneWayMin} min</dd>
        </div>
        <div>
          <dt className="text-[10px] tracking-[0.2em] text-dim uppercase">Round trip</dt>
          <dd className="tabular-nums">{roundTrip} min</dd>
        </div>
      </dl>
    </div>
  )
}
