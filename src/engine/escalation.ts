import { COMM_DELAY_RANGE_MIN, ESCALATION, INDICATOR_LABEL, INDICATORS } from './constants'
import { sortByDay } from './score'
import { indicatorStatuses } from './thresholds'
import type { DailyLog, Escalation, IndicatorKey, Status } from './types'

const label = (k: IndicatorKey) => INDICATOR_LABEL[k][0].toUpperCase() + INDICATOR_LABEL[k].slice(1)

const level1 = (rule: string, indicator: IndicatorKey): Escalation => ({
  level: 1,
  rule,
  action: `Follow the ${INDICATOR_LABEL[indicator]} guidance card and re-check tomorrow.`,
  indicator,
})
const level2 = (rule: string, indicator: IndicatorKey): Escalation => ({
  level: 2,
  rule,
  action: `Notify the CMO and re-measure within ${ESCALATION.remeasureHours} h.`,
  indicator,
})
const level3 = (rule: string, indicator: IndicatorKey): Escalation => ({
  level: 3,
  rule,
  action: 'Send the summary to the flight surgeon on Earth.',
  indicator,
})

/**
 * True when indicator `k` matches `pred` on each of the last `days` logs and those logs are consecutive days.
 * O(days) per call.
 */
function streak(sorted: readonly DailyLog[], k: IndicatorKey, days: number, pred: (s: Status) => boolean): boolean {
  if (sorted.length < days) return false
  const end = sorted.length - 1
  for (let i = 0; i < days; i++) {
    const log = sorted[end - i]
    if (log.day !== sorted[end].day - i || !pred(indicatorStatuses(log)[k])) return false
  }
  return true
}

/** SPEC 4.6: highest triggered level wins; within a level, the first rule in table order. */
export function evaluateEscalation(logs: readonly DailyLog[]): Escalation {
  const sorted = sortByDay(logs)
  const today = sorted.at(-1)
  if (!today) return { level: 0, rule: 'No check-in yet', action: 'All clear.' }
  const status = indicatorStatuses(today)
  const E = ESCALATION

  // Level 3: contact Earth
  if (today.tempC >= E.tempFrom) return level3(`Temperature ${today.tempC} C is at or above ${E.tempFrom} C`, 'temp')
  if (today.systolic >= E.systolicFrom)
    return level3(`Systolic ${today.systolic} mmHg is at or above ${E.systolicFrom} mmHg`, 'bp')
  if (today.glucose < E.glucoseBelow) return level3(`Glucose ${today.glucose} mg/dL is below ${E.glucoseBelow} mg/dL`, 'glucose')
  for (const k of INDICATORS) {
    if (streak(sorted, k, E.redStreakDays, (s) => s === 'red'))
      return level3(`${label(k)} red ${E.redStreakDays} days in a row`, k)
  }

  // Level 2: alert crew
  const redToday = INDICATORS.find((k) => status[k] === 'red')
  if (redToday) return level2(`${label(redToday)} is red today`, redToday)
  for (const k of INDICATORS) {
    // A red day inside the run still counts as "at least yellow".
    if (streak(sorted, k, E.yellowStreakDays, (s) => s !== 'green'))
      return level2(`${label(k)} yellow ${E.yellowStreakDays} days in a row`, k)
  }

  // Level 1: handle it myself
  const yellowToday = INDICATORS.find((k) => status[k] === 'yellow')
  if (yellowToday) return level1(`${label(yellowToday)} is yellow today`, yellowToday)

  return { level: 0, rule: 'All indicators green', action: 'All clear.' }
}

/** SPEC 4.7: round trip in minutes for a one-way delay within the physical Earth-Mars range. */
export function roundTripMin(oneWayMin: number): number {
  const { min, max } = COMM_DELAY_RANGE_MIN
  if (!(oneWayMin >= min && oneWayMin <= max)) throw new RangeError(`One-way delay must be ${min}-${max} min`)
  return 2 * oneWayMin
}
