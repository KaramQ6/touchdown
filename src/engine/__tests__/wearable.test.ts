import { describe, expect, it } from 'vitest'
import { createSeedMission } from '../../data/seed-crew'
import { LANDING_DAY_DEFAULT, WEARABLE_SIM } from '../constants'
import { validateVitals } from '../thresholds'
import { wearableReading } from '../wearable'
import { makeDays, makeLog } from './helpers'

const week = (hr: number, tempC: number) => makeDays(10, Array.from({ length: 7 }, () => ({ heartRate: hr, tempC })))

describe('wearableReading (SPEC S1)', () => {
  it('is deterministic: same astronaut and day give the same reading', () => {
    const logs = week(70, 36.7)
    expect(wearableReading(logs, 11, 'noor')).toEqual(wearableReading(logs, 11, 'noor'))
  })

  it('varies across days and across astronauts', () => {
    const logs = week(70, 36.7)
    const days = Array.from({ length: 20 }, (_, i) => wearableReading(logs, 11 + i, 'noor'))
    expect(new Set(days.map((r) => `${r?.heartRate}|${r?.tempC}`)).size).toBeGreaterThan(1)
    const crew = ['noor', 'daniel', 'elena', 'kenji'].map((id) => wearableReading(logs, 11, id))
    expect(new Set(crew.map((r) => `${r?.heartRate}|${r?.tempC}`)).size).toBeGreaterThan(1)
  })

  it('stays within small noise of the recent average, rounded like the form', () => {
    const logs = week(70, 36.7)
    for (let day = 11; day < 60; day++) {
      const r = wearableReading(logs, day, 'elena')
      expect(r).not.toBeNull()
      expect(Number.isInteger(r!.heartRate)).toBe(true)
      expect(Math.abs(r!.heartRate - 70)).toBeLessThanOrEqual(WEARABLE_SIM.hrNoiseBpm)
      expect(Math.round(r!.tempC * 10) / 10).toBe(r!.tempC)
      expect(Math.abs(r!.tempC - 36.7)).toBeLessThanOrEqual(WEARABLE_SIM.tempNoiseC + 1e-9)
    }
  })

  it('uses only days before the reading day, so editing today does not move it', () => {
    const logs = week(70, 36.7)
    const withToday = [...logs, makeLog({ day: 11, heartRate: 140, tempC: 39 })]
    expect(wearableReading(withToday, 11, 'kenji')).toEqual(wearableReading(logs, 11, 'kenji'))
  })

  it('averages only the last baseline window', () => {
    const old = makeDays(3, [{ heartRate: 150 }, { heartRate: 150 }, { heartRate: 150 }])
    const recent = makeDays(10, Array.from({ length: WEARABLE_SIM.baselineDays }, () => ({ heartRate: 60 })))
    const r = wearableReading([...old, ...recent], 11, 'noor')
    expect(Math.abs(r!.heartRate - 60)).toBeLessThanOrEqual(WEARABLE_SIM.hrNoiseBpm)
  })

  it('returns null when there is no history to anchor the stream', () => {
    expect(wearableReading([], 5, 'noor')).toBeNull()
    expect(wearableReading([makeLog({ day: 5 })], 5, 'noor')).toBeNull()
  })

  it('clamps to the validation ranges at the extremes', () => {
    const r = wearableReading(week(220, 42), 11, 'noor')
    expect(r!.heartRate).toBeLessThanOrEqual(220)
    expect(r!.tempC).toBeLessThanOrEqual(42)
  })

  it('every reading passes validation for the whole seeded crew, day 22 to landing', () => {
    const { crew } = createSeedMission()
    for (const a of crew) {
      for (let day = 22; day <= LANDING_DAY_DEFAULT; day++) {
        const r = wearableReading(a.logs, day, a.id)
        expect(r, `${a.id} day ${day}`).not.toBeNull()
        const errors = validateVitals({ ...makeLog(), ...r! })
        expect(errors, `${a.id} day ${day}`).toEqual({})
      }
    }
  })
})
