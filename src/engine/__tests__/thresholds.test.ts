import { describe, expect, it } from 'vitest'
import { indicatorBands, indicatorStatuses, indicatorValue, statusOf, validateVitals, type VitalsInput } from '../thresholds'
import { INDICATORS } from '../constants'

describe('indicatorBands: chart zones built from SPEC 6.1 thresholds', () => {
  it.each(INDICATORS)('%s bands are contiguous and every zone matches statusOf at its midpoint', (key) => {
    const bands = indicatorBands(key)
    expect(bands.length).toBeGreaterThanOrEqual(3)
    for (let i = 1; i < bands.length; i++) expect(bands[i].from).toBe(bands[i - 1].to)
    for (const b of bands) expect(statusOf(key, (b.from + b.to) / 2), `${key} ${b.from}-${b.to}`).toBe(b.status)
  })

  it('HR zones follow the written edges', () => {
    expect(indicatorBands('hr').map((b) => [b.from, b.to, b.status])).toEqual([
      [30, 50, 'red'],
      [50, 60, 'yellow'],
      [60, 100, 'green'],
      [100, 110, 'yellow'],
      [110, 220, 'red'],
    ])
  })

  it('span the input validation range', () => {
    const hr = indicatorBands('hr')
    expect([hr[0].from, hr.at(-1)!.to]).toEqual([30, 220])
  })

  it('draws integer mood zones halfway between levels', () => {
    expect(indicatorBands('mood').map((b) => [b.from, b.to, b.status])).toEqual([
      [1, 2.5, 'red'],
      [2.5, 3.5, 'yellow'],
      [3.5, 5, 'green'],
    ])
  })
})

describe('indicatorValue', () => {
  it('reads systolic for bp', () => expect(indicatorValue('bp', makeLog({ systolic: 133 }))).toBe(133))
})
import type { IndicatorKey, Status } from '../types'
import { makeLog } from './helpers'

// SPEC 6.1 / 6.2: every boundary, inclusive as written.
const BOUNDARIES: [IndicatorKey, number, Status][] = [
  // Resting HR: green 60-100, yellow 50-59 or 101-110, red < 50 or > 110
  ['hr', 49, 'red'],
  ['hr', 50, 'yellow'],
  ['hr', 59, 'yellow'],
  ['hr', 60, 'green'],
  ['hr', 100, 'green'],
  ['hr', 101, 'yellow'],
  ['hr', 110, 'yellow'],
  ['hr', 111, 'red'],
  // Systolic: green 90-129, yellow 130-139, red < 90 or >= 140
  ['bp', 89, 'red'],
  ['bp', 90, 'green'],
  ['bp', 129, 'green'],
  ['bp', 130, 'yellow'],
  ['bp', 139, 'yellow'],
  ['bp', 140, 'red'],
  // Fasting glucose: green 70-99, yellow 100-125, red < 70 or >= 126
  ['glucose', 69, 'red'],
  ['glucose', 70, 'green'],
  ['glucose', 99, 'green'],
  ['glucose', 100, 'yellow'],
  ['glucose', 125, 'yellow'],
  ['glucose', 126, 'red'],
  // Temp: green 36.1-37.2, yellow 37.3-37.9 or 35.5-36.0, red < 35.5 or >= 38.0
  ['temp', 35.4, 'red'],
  ['temp', 35.5, 'yellow'],
  ['temp', 36.0, 'yellow'],
  ['temp', 36.1, 'green'],
  ['temp', 37.2, 'green'],
  ['temp', 37.3, 'yellow'],
  ['temp', 37.9, 'yellow'],
  ['temp', 38.0, 'red'],
  // Sleep: green >= 7, yellow 6-6.9, red < 6
  ['sleep', 5.9, 'red'],
  ['sleep', 6, 'yellow'],
  ['sleep', 6.9, 'yellow'],
  ['sleep', 7, 'green'],
  // Mood: green 4-5, yellow 3, red 1-2
  ['mood', 1, 'red'],
  ['mood', 2, 'red'],
  ['mood', 3, 'yellow'],
  ['mood', 4, 'green'],
  ['mood', 5, 'green'],
]

describe('statusOf: SPEC 6.1 boundaries', () => {
  it.each(BOUNDARIES)('%s %s -> %s', (key, value, expected) => {
    expect(statusOf(key, value)).toBe(expected)
  })
})

describe('statusOf: values between written boundaries have no gap', () => {
  it.each<[IndicatorKey, number, Status]>([
    ['hr', 100.5, 'yellow'],
    ['hr', 59.5, 'yellow'],
    ['temp', 37.25, 'green'],
    ['temp', 36.05, 'yellow'],
    ['sleep', 6.95, 'yellow'],
  ])('%s %s -> %s', (key, value, expected) => {
    expect(statusOf(key, value)).toBe(expected)
  })
})

describe('indicatorStatuses', () => {
  it('reads BP status from systolic', () => {
    expect(indicatorStatuses(makeLog({ systolic: 145 })).bp).toBe('red')
  })
  it('is all green for a healthy log', () => {
    expect(Object.values(indicatorStatuses(makeLog()))).toEqual(Array(6).fill('green'))
  })
})

const valid: VitalsInput = {
  heartRate: 70,
  systolic: 115,
  diastolic: 75,
  glucose: 85,
  tempC: 36.7,
  sleepHours: 8,
  mood: 4,
  exerciseMin: 60,
}

// SPEC 6.3: HR 30-220, systolic 60-250, diastolic 30-150, glucose 30-500, temp 33-42, sleep 0-16, exercise 0-300.
const RANGES: [keyof VitalsInput, number, number][] = [
  ['heartRate', 30, 220],
  ['systolic', 60, 250],
  ['diastolic', 30, 150],
  ['glucose', 30, 500],
  ['tempC', 33, 42],
  ['sleepHours', 0, 16],
  ['exerciseMin', 0, 300],
  ['mood', 1, 5],
]

describe('validateVitals: SPEC 6.3', () => {
  it('accepts a valid check-in', () => expect(validateVitals(valid)).toEqual({}))

  it.each(RANGES)('%s accepts %s and %s', (field, min, max) => {
    expect(validateVitals({ ...valid, [field]: min })).toEqual({})
    expect(validateVitals({ ...valid, [field]: max })).toEqual({})
  })

  it.each(RANGES)('%s rejects just outside %s-%s', (field, min, max) => {
    const step = field === 'tempC' || field === 'sleepHours' ? 0.1 : 1
    expect(validateVitals({ ...valid, [field]: min - step })[field]).toBeTypeOf('string')
    expect(validateVitals({ ...valid, [field]: max + step })[field]).toBeTypeOf('string')
  })

  it('rejects a missing value (NaN)', () => {
    expect(validateVitals({ ...valid, heartRate: Number.NaN }).heartRate).toBeTypeOf('string')
  })

  it('rejects a non-integer mood', () => {
    expect(validateVitals({ ...valid, mood: 3.5 }).mood).toBeTypeOf('string')
  })

  it('reports only the invalid fields', () => {
    expect(Object.keys(validateVitals({ ...valid, glucose: 10, tempC: 50 }))).toEqual(['glucose', 'tempC'])
  })
})
