import { describe, expect, it } from 'vitest'
import {
  bandOf,
  baselineRt,
  computeReadiness,
  exerciseAdherence,
  mScore,
  recentExerciseMin,
  rScore,
  scoreStatus,
  sScore,
  vScore,
} from '../score'
import type { IndicatorKey, Status } from '../types'
import { makeDays, makeLog, round2 } from './helpers'

const statuses = (s: Partial<Record<IndicatorKey, Status>> = {}): Record<IndicatorKey, Status> => ({
  hr: 'green',
  bp: 'green',
  glucose: 'green',
  temp: 'green',
  sleep: 'green',
  mood: 'green',
  ...s,
})

describe('SPEC 4.4 golden values', () => {
  it('M(d=210, E=0) = 38.75', () => expect(round2(mScore(210, 0))).toBe(38.75))
  it('M(d=210, E=0.5) = 54.06', () => expect(round2(mScore(210, 0.5))).toBe(54.06))
  it('M(d=210, E=1) = 69.38', () => expect(round2(mScore(210, 1))).toBe(69.38))
  it('M(d=140, E=0.5) = 69.38', () => expect(round2(mScore(140, 0.5))).toBe(69.38))
  it('S(RT=1.2*RT0, L=1) = 65.00', () => expect(round2(sScore(1.2 * 250, 250, 1))).toBe(65))
  it('S(RT=RT0, L=0) = 100.00', () => expect(round2(sScore(250, 250, 0))).toBe(100))
  it('S(RT=0.9*RT0, L=0) = 100.00, faster is not a bonus', () =>
    expect(round2(sScore(0.9 * 250, 250, 0))).toBe(100))
  it('V(all green) = 100.00', () => expect(round2(vScore(statuses()))).toBe(100))
  it('R(M=100, S=100, V=100) = 100.00', () => expect(round2(rScore(100, 100, 100))).toBe(100))
  it('band(74.99) = limited', () => expect(bandOf(74.99)).toBe('limited'))
  it('band(75) = ready', () => expect(bandOf(75)).toBe('ready'))
  it('band(49.99) = not-ready', () => expect(bandOf(49.99)).toBe('not-ready'))
  it('band(50) = limited', () => expect(bandOf(50)).toBe('limited'))
})

describe('scoreStatus: a 0-100 score read through the R bands', () => {
  it.each([
    [75, 'green'],
    [74.99, 'yellow'],
    [50, 'yellow'],
    [49.99, 'red'],
  ] as const)('%s -> %s', (score, status) => expect(scoreStatus(score)).toBe(status))
})

describe('sub-score formulas', () => {
  it('M is clipped at 0 for very long missions', () => expect(mScore(10_000, 0)).toBe(0))
  it('calf loss is capped at 30%', () => {
    // d=1000, E=0: B=41.67 -> 3B = 125, M already 0; use a day where only the cap matters
    // d=360, E=0: Mu raw = 40 -> capped 30; B = 15 -> M = 100 - 45 - 45 = 10
    expect(round2(mScore(360, 0))).toBe(10)
  })
  it('S is clipped at 0', () => expect(sScore(1000, 250, 10)).toBe(0))
  it('V weights green 100, yellow 60, red 20', () =>
    expect(round2(vScore(statuses({ hr: 'yellow', sleep: 'red', mood: 'red' })))).toBe(66.67))
  it('R weights 0.40 M + 0.35 S + 0.25 V', () => expect(round2(rScore(50, 40, 80))).toBe(54))
})

describe('exerciseAdherence (SPEC 4.1)', () => {
  it('averages the last 7 logged days over 120 min', () => {
    const logs = makeDays(10, [
      { exerciseMin: 300 },
      { exerciseMin: 300 },
      { exerciseMin: 300 },
      ...Array.from({ length: 7 }, () => ({ exerciseMin: 60 })),
    ])
    expect(exerciseAdherence(logs)).toBe(0.5)
  })
  it('is clipped to 1', () => expect(exerciseAdherence([makeLog({ exerciseMin: 300 })])).toBe(1))
  it('is 0 with no logs', () => expect(exerciseAdherence([])).toBe(0))
})

describe('recentExerciseMin', () => {
  it('is the unclipped mean minutes over the last 7 logged days', () => {
    const logs = makeDays(10, [{ exerciseMin: 0 }, ...Array.from({ length: 7 }, () => ({ exerciseMin: 150 }))])
    expect(recentExerciseMin(logs)).toBe(150)
  })
  it('is 0 with no logs', () => expect(recentExerciseMin([])).toBe(0))
})

describe('baselineRt (SPEC 4.1)', () => {
  it('is the mean of the first 3 PVT medians, skipping days without PVT', () => {
    const logs = makeDays(5, [
      { pvt: { medianMs: 240, lapses: 0, falseStarts: 0 } },
      {},
      { pvt: { medianMs: 250, lapses: 0, falseStarts: 0 } },
      { pvt: { medianMs: 260, lapses: 0, falseStarts: 0 } },
      { pvt: { medianMs: 900, lapses: 9, falseStarts: 0 } },
    ])
    expect(baselineRt(logs)).toBe(250)
  })
  it('uses the PVTs available when fewer than 3 exist', () => {
    const logs = makeDays(2, [{ pvt: { medianMs: 240, lapses: 0, falseStarts: 0 } }, {}])
    expect(baselineRt(logs)).toBe(240)
  })
  it('is undefined with no PVT ever', () => expect(baselineRt([makeLog()])).toBeUndefined())
})

describe('computeReadiness', () => {
  it('returns null with no logs', () => expect(computeReadiness([], 10)).toBeNull())

  it('S = 100 and says so when no reaction test exists', () => {
    const r = computeReadiness([makeLog({ day: 10 })], 10)!
    expect(r.S).toBe(100)
    expect(r.drivers.find((d) => d.axis === 'S')?.text).toBe('No reaction test yet')
  })

  it('uses the most recent PVT when today has none', () => {
    const logs = makeDays(5, [
      { pvt: { medianMs: 250, lapses: 0, falseStarts: 0 } },
      { pvt: { medianMs: 250, lapses: 0, falseStarts: 0 } },
      { pvt: { medianMs: 250, lapses: 0, falseStarts: 0 } },
      { pvt: { medianMs: 300, lapses: 1, falseStarts: 0 } },
      {},
    ])
    expect(round2(computeReadiness(logs, 5)!.S)).toBe(65)
  })

  it('returns one driver per axis, in M, S, V order', () => {
    const r = computeReadiness([makeLog({ day: 10 })], 10)!
    expect(r.drivers.map((d) => d.axis)).toEqual(['M', 'S', 'V'])
    expect(r.drivers[2].text).toBe('All vitals in range')
  })

  it('names the worst vitals in the V driver', () => {
    const r = computeReadiness([makeLog({ day: 10, sleepHours: 5.5, mood: 2, heartRate: 105 })], 10)!
    expect(r.drivers[2].text).toBe('Red: sleep, mood')
    expect(r.indicatorStatus).toEqual(statuses({ hr: 'yellow', sleep: 'red', mood: 'red' }))
  })
})
