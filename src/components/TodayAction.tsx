import { useMemo } from 'react'
import { RECOMMEND } from '../engine/constants'
import { commitmentMet, describeChange, recommend } from '../engine/recommend'
import type { WhatIfChange } from '../engine/recommend'
import { useActiveAstronaut, useMission } from '../store/mission'
import type { Commitment } from '../store/mission'
import type { ScreenProps } from './Nav'
import { SourceBadge } from './SourceBadge'
import { BAND_LABEL, BAND_TONE, StatusChip } from './StatusChip'

const sameChange = (a: WhatIfChange, b: WhatIfChange) => a.exerciseMin === b.exerciseMin && a.sleepHours === b.sleepHours

/** SPEC M10 / 4.8: one recommended change with before -> after R_land, plus commit and outcome. */
export function TodayAction({ onNavigate }: ScreenProps) {
  const { currentDay, landingDay } = useMission((s) => s.mission)
  const astronaut = useActiveAstronaut()
  const commitment: Commitment | undefined = useMission((s) => s.commitments[astronaut.id])
  const commit = useMission((s) => s.commit)
  const rec = useMemo(
    () => recommend(astronaut.logs, { currentDay, landingDay }),
    [astronaut.logs, currentDay, landingDay],
  )

  if (!rec) return null

  const alreadyCommitted =
    rec.kind === 'change' && commitment !== undefined && commitment.day === currentDay && sameChange(commitment.change, rec.change)

  return (
    <div className="flex flex-col gap-3">
      {commitment && (
        <div className="flex flex-wrap items-center gap-3 border border-line bg-panel/60 px-5 py-3 text-sm">
          {commitment.checkIn ? (
            <>
              <span>You committed to {describeChange(commitment.change).toLowerCase()} on day {commitment.day}:</span>
              <StatusChip tone={commitmentMet(commitment.change, commitment.checkIn) ? 'green' : 'yellow'}>
                {commitmentMet(commitment.change, commitment.checkIn) ? 'Done' : 'Not done'}
              </StatusChip>
            </>
          ) : (
            <>
              <span>
                Committed on day {commitment.day}: {describeChange(commitment.change)}. Check in to log it.
              </span>
              <button
                type="button"
                onClick={() => onNavigate('checkin')}
                className="border border-edge px-3 py-1.5 font-mono text-xs tracking-[0.15em] text-dim uppercase hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
              >
                Check in
              </button>
            </>
          )}
        </div>
      )}

      <div className="flex flex-col gap-5 border border-line bg-panel/80 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Today&apos;s action</p>
            <SourceBadge title="Today's action" ids={['recommend_rules', 'exercise_target', 'weights']} />
          </div>

          {rec.kind === 'change' ? (
            <p className="text-xl font-semibold">{rec.text}</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xl font-semibold">Hold course</p>
              <p className="text-sm text-dim">
                No single change adds {RECOMMEND.minGain} point or more to landing readiness.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 font-mono">
            <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">R land</p>
            <span className="text-2xl tabular-nums">{rec.before.rLand.toFixed(1)}</span>
            <StatusChip tone={BAND_TONE[rec.before.band]}>{BAND_LABEL[rec.before.band]}</StatusChip>
            {rec.kind === 'change' && (
              <>
                <span aria-hidden className="text-dim">
                  →
                </span>
                <span className="sr-only">to</span>
                <span className="text-2xl tabular-nums">{rec.after.rLand.toFixed(1)}</span>
                <StatusChip tone={BAND_TONE[rec.after.band]}>{BAND_LABEL[rec.after.band]}</StatusChip>
                <span className="text-sm text-dim">+{rec.gain.toFixed(1)}</span>
              </>
            )}
          </div>
        </div>

        {rec.kind === 'change' &&
          (alreadyCommitted ? (
            <span className="shrink-0 border border-accent/40 px-4 py-2.5 font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase">
              Committed
            </span>
          ) : (
            <button
              type="button"
              onClick={() => commit({ day: currentDay, change: rec.change, targetRLand: rec.after.rLand })}
              className="shrink-0 border border-accent bg-accent/10 px-6 py-3 font-mono text-sm font-semibold tracking-[0.2em] text-accent uppercase hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Commit
            </button>
          ))}
      </div>
    </div>
  )
}
