import { VALIDATION_RANGES, WEARABLE_SIM } from './constants'
import { hashSeed, mulberry32 } from './random'
import type { DailyLog } from './types'

export interface WearableReading {
  heartRate: number
  tempC: number
}

const clamp = (x: number, { min, max }: { min: number; max: number }) => Math.min(max, Math.max(min, x))
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length

/**
 * SPEC S1: simulated wearable stream. Anchored on the astronaut's own recent average (days before `day`),
 * plus small seeded noise, so the same astronaut and day always read the same. Null without history.
 */
export function wearableReading(logs: readonly DailyLog[], day: number, astronautId: string): WearableReading | null {
  const recent = logs
    .filter((l) => l.day < day)
    .sort((a, b) => a.day - b.day)
    .slice(-WEARABLE_SIM.baselineDays)
  if (recent.length === 0) return null
  const rand = mulberry32(hashSeed(astronautId) ^ Math.imul(day, 0x9e3779b1))
  const noise = (amp: number) => (rand() * 2 - 1) * amp
  // Round the anchor first, then add whole-step noise, so the result stays inside the noise band.
  const hr = Math.round(mean(recent.map((l) => l.heartRate))) + Math.round(noise(WEARABLE_SIM.hrNoiseBpm))
  const temp = Math.round((mean(recent.map((l) => l.tempC)) + noise(WEARABLE_SIM.tempNoiseC)) * 10) / 10
  return {
    heartRate: clamp(hr, VALIDATION_RANGES.heartRate),
    tempC: clamp(temp, VALIDATION_RANGES.tempC),
  }
}
