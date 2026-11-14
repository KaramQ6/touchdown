import { adherenceFromMinutes, bandOf, mScore, readinessInputs, rScore, vScore } from './score'
import { statusOf } from './thresholds'
import type { Band, DailyLog } from './types'

export interface ProjectionOptions {
  currentDay: number
  landingDay: number
  /** Slider overrides: exercise minutes/day replaces E, sleep hours replaces today's sleep. */
  whatIf?: { exerciseMin?: number; sleepHours?: number }
}

export interface Projection {
  rLand: number
  band: Band
  /** R for every day from currentDay to landingDay, inclusive. */
  curve: { day: number; R: number }[]
}

/** SPEC 4.3: project R to landing day. Only M changes with time; S and V stay at today's values. */
export function projectLanding(logs: readonly DailyLog[], opts: ProjectionOptions): Projection | null {
  if (opts.landingDay < opts.currentDay) return null
  const inputs = readinessInputs(logs)
  if (!inputs) return null
  const { exerciseMin, sleepHours } = opts.whatIf ?? {}
  const E = exerciseMin === undefined ? inputs.E : adherenceFromMinutes(exerciseMin)
  const statuses = sleepHours === undefined ? inputs.statuses : { ...inputs.statuses, sleep: statusOf('sleep', sleepHours) }
  const V = vScore(statuses)
  const at = (day: number) => rScore(mScore(day, E), inputs.S, V)

  const curve: Projection['curve'] = []
  for (let day = opts.currentDay; day <= opts.landingDay; day++) curve.push({ day, R: at(day) })
  const rLand = at(opts.landingDay)
  return { rLand, band: bandOf(rLand), curve }
}
