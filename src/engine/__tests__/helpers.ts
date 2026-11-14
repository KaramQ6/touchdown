import type { DailyLog } from '../types'

/** SPEC 4.4: golden values are compared rounded to 2 decimals. */
export const round2 = (x: number) => Math.round(x * 100 + 1e-9) / 100

/** An all-green log; override only what a test cares about. */
export function makeLog(overrides: Partial<DailyLog> = {}): DailyLog {
  return {
    day: 1,
    heartRate: 70,
    hrSource: 'manual',
    systolic: 115,
    diastolic: 75,
    glucose: 85,
    tempC: 36.7,
    tempSource: 'manual',
    sleepHours: 8,
    mood: 4,
    exerciseMin: 120,
    ...overrides,
  }
}

/** Consecutive daily logs ending on `lastDay`, built from per-day overrides (oldest first). */
export function makeDays(lastDay: number, perDay: Partial<DailyLog>[]): DailyLog[] {
  const first = lastDay - perDay.length + 1
  return perDay.map((o, i) => makeLog({ day: first + i, ...o }))
}
