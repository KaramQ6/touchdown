import {
  BAND_LIMITED_MIN,
  BAND_READY_MIN,
  BONE_LOSS_PCT_PER_MONTH,
  CALF_LOSS_CAP_PCT,
  CALF_LOSS_PCT_AT_REF,
  CALF_REF_DAYS,
  COEF_BONE,
  COEF_CALF,
  COEF_LAPSE,
  COEF_RT,
  DAYS_PER_MONTH,
  EXERCISE_PROTECTION,
  EXERCISE_TARGET_MIN,
  EXERCISE_WINDOW_DAYS,
  INDICATOR_LABEL,
  INDICATORS,
  PVT_BASELINE_COUNT,
  STATUS_SCORE,
  WEIGHTS,
} from './constants'
import { indicatorStatuses } from './thresholds'
import type { Band, DailyLog, IndicatorKey, PvtResult, Readiness, Status } from './types'

// --- SPEC 4.2 formulas ---

export const clip = (x: number) => Math.min(100, Math.max(0, x))

/** Bone density loss, %. */
export const boneLoss = (d: number, E: number) =>
  BONE_LOSS_PCT_PER_MONTH * (d / DAYS_PER_MONTH) * (1 - EXERCISE_PROTECTION * E)

/** Calf strength loss, %, capped. */
export const calfLoss = (d: number, E: number) =>
  Math.min(CALF_LOSS_CAP_PCT, CALF_LOSS_PCT_AT_REF * (d / CALF_REF_DAYS) * (1 - EXERCISE_PROTECTION * E))

export const mScore = (d: number, E: number) => clip(100 - COEF_BONE * boneLoss(d, E) - COEF_CALF * calfLoss(d, E))

/** Slower than baseline costs points; faster is not a bonus. */
export const sScore = (rt: number, rt0: number, lapses: number) =>
  clip(100 - COEF_RT * Math.max(0, (rt - rt0) / rt0) - COEF_LAPSE * lapses)

export const vScore = (statuses: Record<IndicatorKey, Status>) =>
  INDICATORS.reduce((sum, k) => sum + STATUS_SCORE[statuses[k]], 0) / INDICATORS.length

export const rScore = (M: number, S: number, V: number) => WEIGHTS.M * M + WEIGHTS.S * S + WEIGHTS.V * V

export function bandOf(R: number): Band {
  if (R >= BAND_READY_MIN) return 'ready'
  return R >= BAND_LIMITED_MIN ? 'limited' : 'not-ready'
}

const BAND_STATUS: Record<Band, Status> = { ready: 'green', limited: 'yellow', 'not-ready': 'red' }

/** Any 0-100 score read through the R bands (used for body regions). */
export const scoreStatus = (score: number): Status => BAND_STATUS[bandOf(score)]

// --- SPEC 4.1 inputs from logs ---

/** Logs ordered by day. Returns the input itself when already ordered (the common case). */
export function sortByDay(logs: readonly DailyLog[]): readonly DailyLog[] {
  for (let i = 1; i < logs.length; i++) {
    if (logs[i].day < logs[i - 1].day) return [...logs].sort((a, b) => a.day - b.day)
  }
  return logs
}

/** Exercise minutes per day as a fraction of target, clipped to [0, 1]. */
export const adherenceFromMinutes = (min: number) => Math.min(1, Math.max(0, min / EXERCISE_TARGET_MIN))

/** Mean exercise minutes per day over the last 7 logged days (unclipped). 0 with no logs. */
export function recentExerciseMin(logs: readonly DailyLog[]): number {
  const window = sortByDay(logs).slice(-EXERCISE_WINDOW_DAYS)
  if (window.length === 0) return 0
  return window.reduce((sum, l) => sum + l.exerciseMin, 0) / window.length
}

/** E: mean exercise over the last 7 logged days / target. */
export const exerciseAdherence = (logs: readonly DailyLog[]) => adherenceFromMinutes(recentExerciseMin(logs))

const pvtLogs = (logs: readonly DailyLog[]) =>
  sortByDay(logs).filter((l): l is DailyLog & { pvt: PvtResult } => l.pvt !== undefined)

/** RT0: mean of the first 3 PVT medians (fewer if fewer exist). */
export function baselineRt(logs: readonly DailyLog[]): number | undefined {
  const first = pvtLogs(logs).slice(0, PVT_BASELINE_COUNT)
  if (first.length === 0) return undefined
  return first.reduce((sum, l) => sum + l.pvt.medianMs, 0) / first.length
}

/** Everything R needs except the day: today's E, S and indicator statuses. */
export interface ReadinessInputs {
  E: number
  S: number
  statuses: Record<IndicatorKey, Status>
  /** Present once any reaction test exists. */
  pvt?: { rt: number; rt0: number; lapses: number }
}

export function readinessInputs(logs: readonly DailyLog[]): ReadinessInputs | null {
  const sorted = sortByDay(logs)
  const today = sorted.at(-1)
  if (!today) return null
  const latest = pvtLogs(sorted).at(-1)?.pvt
  const rt0 = baselineRt(sorted)
  const pvt = latest && rt0 !== undefined ? { rt: latest.medianMs, rt0, lapses: latest.lapses } : undefined
  return {
    E: exerciseAdherence(sorted),
    S: pvt ? sScore(pvt.rt, pvt.rt0, pvt.lapses) : 100,
    statuses: indicatorStatuses(today),
    pvt,
  }
}

/** SPEC M3: R, sub-scores, band and one driver line per axis for `day`. Null with no logs. */
export function computeReadiness(logs: readonly DailyLog[], day: number): Readiness | null {
  const inputs = readinessInputs(logs)
  if (!inputs) return null
  const M = mScore(day, inputs.E)
  const V = vScore(inputs.statuses)
  const R = rScore(M, inputs.S, V)
  return {
    R,
    M,
    S: inputs.S,
    V,
    band: bandOf(R),
    drivers: [
      { axis: 'M', text: mDriver(day, inputs.E) },
      { axis: 'S', text: sDriver(inputs.pvt) },
      { axis: 'V', text: vDriver(inputs.statuses) },
    ],
    indicatorStatus: inputs.statuses,
  }
}

// --- Driver lines (one per axis) ---

function mDriver(day: number, E: number): string {
  const B = boneLoss(day, E)
  const Mu = calfLoss(day, E)
  const loss = COEF_CALF * Mu >= COEF_BONE * B ? `Calf strength down ${Mu.toFixed(1)}%` : `Bone density down ${B.toFixed(1)}%`
  return `${loss}, exercise at ${Math.round(E * 100)}% of target`
}

function sDriver(pvt: ReadinessInputs['pvt']): string {
  if (!pvt) return 'No reaction test yet'
  const slower = Math.max(0, (pvt.rt - pvt.rt0) / pvt.rt0)
  const rtPenalty = COEF_RT * slower
  const lapsePenalty = COEF_LAPSE * pvt.lapses
  if (rtPenalty === 0 && lapsePenalty === 0) return 'Reaction time at baseline'
  if (rtPenalty >= lapsePenalty) return `Reaction time ${Math.round(slower * 100)}% slower than baseline`
  return `${pvt.lapses} ${pvt.lapses === 1 ? 'lapse' : 'lapses'} on the last reaction test`
}

function vDriver(statuses: Record<IndicatorKey, Status>): string {
  for (const level of ['red', 'yellow'] as const) {
    const hit = INDICATORS.filter((k) => statuses[k] === level)
    if (hit.length) return `${level === 'red' ? 'Red' : 'Yellow'}: ${hit.map((k) => INDICATOR_LABEL[k]).join(', ')}`
  }
  return 'All vitals in range'
}
