import { EXERCISE_TARGET_MIN, RECOMMEND } from './constants'
import { projectLanding } from './projection'
import { recentExerciseMin, sortByDay } from './score'
import type { Band, DailyLog } from './types'

export interface WhatIfChange {
  exerciseMin?: number
  sleepHours?: number
}

export interface ProjectedBand {
  rLand: number
  band: Band
}

export type Recommendation =
  | { kind: 'change'; change: WhatIfChange; before: ProjectedBand; after: ProjectedBand; gain: number; text: string }
  | { kind: 'hold'; before: ProjectedBand; text: string }

const fmtHours = (h: number) => String(Math.round(h * 10) / 10)

export function describeChange({ exerciseMin, sleepHours }: WhatIfChange): string {
  const ex = exerciseMin === undefined ? null : `${exerciseMin} min a day`
  const sl = sleepHours === undefined ? null : `${fmtHours(sleepHours)} h a night`
  if (ex && sl) return `Exercise ${ex} and sleep ${sl}`
  if (ex) return `Exercise ${ex}`
  return sl ? `Sleep ${sl}` : ''
}

/** True when the logged day meets every target the change sets. Keys the change omits are not checked. */
export function commitmentMet(change: WhatIfChange, log: DailyLog): boolean {
  return (
    (change.exerciseMin === undefined || log.exerciseMin >= change.exerciseMin) &&
    (change.sleepHours === undefined || log.sleepHours >= change.sleepHours)
  )
}

const uniqueSorted = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b)

/**
 * Today's Action: the single exercise or sleep change, or exercise+sleep pair, with the highest
 * projected landing gain. Candidates never go below today's values. Ties keep the earlier (smaller) change.
 */
export function recommend(
  logs: readonly DailyLog[],
  mission: { currentDay: number; landingDay: number },
): Recommendation | null {
  const latest = sortByDay(logs).at(-1)
  if (!latest) return null
  const base = { currentDay: mission.currentDay, landingDay: mission.landingDay }
  const before = projectLanding(logs, base)
  if (!before) return null

  const exerciseNow = recentExerciseMin(logs)
  const exerciseCandidates = uniqueSorted([
    // Whole minutes: a fractional 7-day mean must not leak into the card ("90.86 min").
    Math.min(Math.round(exerciseNow + RECOMMEND.exerciseStepMin), RECOMMEND.exerciseMaxMin),
    EXERCISE_TARGET_MIN,
  ]).filter((e) => e > exerciseNow)
  const sleepCandidates = RECOMMEND.sleepTargetsH.filter((h) => h > latest.sleepHours)

  const singles: WhatIfChange[] = [
    ...exerciseCandidates.map((exerciseMin) => ({ exerciseMin })),
    ...sleepCandidates.map((sleepHours) => ({ sleepHours })),
  ]
  const combos: WhatIfChange[] = exerciseCandidates.flatMap((exerciseMin) =>
    sleepCandidates.map((sleepHours) => ({ exerciseMin, sleepHours })),
  )

  let best: { change: WhatIfChange; after: ProjectedBand; gain: number } | null = null
  for (const change of [...singles, ...combos]) {
    const after = projectLanding(logs, { ...base, whatIf: change })
    if (!after) continue
    const gain = after.rLand - before.rLand
    if (!best || gain > best.gain) best = { change, after: { rLand: after.rLand, band: after.band }, gain }
  }

  const beforeBand = { rLand: before.rLand, band: before.band }
  if (!best || best.gain < RECOMMEND.minGain) return { kind: 'hold', before: beforeBand, text: 'Hold course' }
  return {
    kind: 'change',
    change: best.change,
    before: beforeBand,
    after: best.after,
    gain: best.gain,
    text: describeChange(best.change),
  }
}
