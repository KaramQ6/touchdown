import { INDICATORS, VALIDATION_RANGES, VITALS } from './constants'
import type { DailyLog, IndicatorKey, Source, Status } from './types'

/** SPEC 6.1: status of one indicator value. For 'bp' the value is systolic. */
export function statusOf(key: IndicatorKey, value: number): Status {
  switch (key) {
    case 'hr': {
      const t = VITALS.hr
      if (value >= t.greenMin && value <= t.greenMax) return 'green'
      return value >= t.yellowMin && value <= t.yellowMax ? 'yellow' : 'red'
    }
    case 'bp':
      return rising(value, VITALS.systolic)
    case 'glucose':
      return rising(value, VITALS.glucose)
    case 'temp': {
      const t = VITALS.temp
      if (value < t.redBelow || value >= t.redFrom) return 'red'
      return value >= t.greenFrom && value < t.yellowFrom ? 'green' : 'yellow'
    }
    case 'sleep':
      return falling(value, VITALS.sleep)
    case 'mood':
      return falling(value, VITALS.mood)
  }
}

/** Red below a floor, then green, yellow, red as the value rises. */
function rising(value: number, t: { redBelow: number; yellowFrom: number; redFrom: number }): Status {
  if (value < t.redBelow || value >= t.redFrom) return 'red'
  return value >= t.yellowFrom ? 'yellow' : 'green'
}

/** Higher is better: green from one edge, yellow from a lower one, red below. */
function falling(value: number, t: { yellowFrom: number; greenFrom: number }): Status {
  if (value >= t.greenFrom) return 'green'
  return value >= t.yellowFrom ? 'yellow' : 'red'
}

/** The log field behind each indicator (BP is read from systolic). */
export const INDICATOR_FIELD = {
  hr: 'heartRate',
  bp: 'systolic',
  glucose: 'glucose',
  temp: 'tempC',
  sleep: 'sleepHours',
  mood: 'mood',
} as const satisfies Record<IndicatorKey, keyof DailyLog>

export const indicatorValue = (key: IndicatorKey, log: DailyLog): number => log[INDICATOR_FIELD[key]]

/** SPEC S1: where an indicator's value came from. Only HR and temp have a sensor source. */
export const indicatorSource = (key: IndicatorKey, log: DailyLog): Source =>
  key === 'hr' ? log.hrSource : key === 'temp' ? log.tempSource : 'manual'

export function indicatorStatuses(log: DailyLog): Record<IndicatorKey, Status> {
  return Object.fromEntries(INDICATORS.map((k) => [k, statusOf(k, indicatorValue(k, log))])) as Record<
    IndicatorKey,
    Status
  >
}

export interface StatusBand {
  from: number
  to: number
  status: Status
}

/** Edges from SPEC 6.1 between the validation-range limits, and the status of each zone between them. */
function zoneEdges(key: IndicatorKey): { edges: number[]; statuses: Status[] } {
  const { min, max } = VALIDATION_RANGES[INDICATOR_FIELD[key]]
  switch (key) {
    case 'hr': {
      const t = VITALS.hr
      return { edges: [min, t.yellowMin, t.greenMin, t.greenMax, t.yellowMax, max], statuses: ['red', 'yellow', 'green', 'yellow', 'red'] }
    }
    case 'bp':
    case 'glucose': {
      const t = key === 'bp' ? VITALS.systolic : VITALS.glucose
      return { edges: [min, t.redBelow, t.yellowFrom, t.redFrom, max], statuses: ['red', 'green', 'yellow', 'red'] }
    }
    case 'temp': {
      const t = VITALS.temp
      return { edges: [min, t.redBelow, t.greenFrom, t.yellowFrom, t.redFrom, max], statuses: ['red', 'yellow', 'green', 'yellow', 'red'] }
    }
    case 'sleep':
      return { edges: [min, VITALS.sleep.yellowFrom, VITALS.sleep.greenFrom, max], statuses: ['red', 'yellow', 'green'] }
    case 'mood': {
      // Integer scale: draw each edge halfway between levels so a level never sits on a zone line.
      const t = VITALS.mood
      return { edges: [min, t.yellowFrom - 0.5, t.greenFrom - 0.5, max], statuses: ['red', 'yellow', 'green'] }
    }
  }
}

/** Contiguous status zones for charting an indicator (Trends bands). */
export function indicatorBands(key: IndicatorKey): StatusBand[] {
  const { edges, statuses } = zoneEdges(key)
  return statuses.map((status, i) => ({ from: edges[i], to: edges[i + 1], status }))
}

export type VitalField = keyof typeof VALIDATION_RANGES
export type VitalsInput = Record<VitalField, number>
export type VitalsErrors = Partial<Record<VitalField, string>>

/** SPEC 6.3: reject values outside plausible ranges. Returns only the invalid fields. */
export function validateVitals(input: VitalsInput): VitalsErrors {
  const errors: VitalsErrors = {}
  for (const field of Object.keys(VALIDATION_RANGES) as VitalField[]) {
    const { min, max, unit, label } = VALIDATION_RANGES[field]
    const value = input[field]
    const integerOnly = field === 'mood'
    if (!Number.isFinite(value) || value < min || value > max || (integerOnly && !Number.isInteger(value))) {
      errors[field] = `${label} must be ${integerOnly ? 'a whole number ' : ''}between ${min} and ${max}${unit ? ` ${unit}` : ''}.`
    }
  }
  return errors
}
