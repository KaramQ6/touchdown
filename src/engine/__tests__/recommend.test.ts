import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { RECOMMEND } from '../constants'
import { projectLanding } from '../projection'
import { commitmentMet, describeChange, recommend, type Recommendation } from '../recommend'
import type { DailyLog } from '../types'
import { makeDays, makeLog, round2 } from './helpers'

// Spy on every projection so tests can check which what-if values the engine evaluated.
vi.mock('../projection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../projection')>()
  return { ...actual, projectLanding: vi.fn(actual.projectLanding) }
})

const { projectLanding: realProjectLanding } = await vi.importActual<typeof import('../projection')>('../projection')

const projection = vi.mocked(projectLanding)
const mission = { currentDay: 140, landingDay: 210 }

// Block bodies: vitest treats a function returned from a hook as a teardown.
beforeEach(() => {
  projection.mockClear()
})
afterEach(() => {
  projection.mockImplementation(realProjectLanding)
})

/** Every what-if lands `gain` points above a no-change R of 40. */
function fixedGain(gain: number) {
  projection.mockImplementation((_logs, opts) => ({
    rLand: 40 + (opts.whatIf ? gain : 0),
    band: 'not-ready',
    curve: [],
  }))
}

/** The what-if values the engine evaluated, in order (the no-change baseline is skipped). */
const evaluated = () =>
  projection.mock.calls.map(([, opts]) => opts.whatIf).filter((w): w is NonNullable<typeof w> => w !== undefined)

function asChange(rec: Recommendation | null) {
  if (rec?.kind !== 'change') throw new Error(`expected a change, got ${rec?.kind ?? 'null'}`)
  return rec
}

const pvt = (medianMs: number, lapses = 0) => ({ medianMs, lapses, falseStarts: 0 })

/** SPEC 4.5 story on day 140: RT0 = 250, RT = 333, L = 4, E = 0.5, sleep 5.5 h, mood 2, HR yellow. */
function storyLogs(): DailyLog[] {
  const baseline = [{ pvt: pvt(250) }, { pvt: pvt(250) }, { pvt: pvt(250) }]
  const week = Array.from({ length: 7 }, () => ({ exerciseMin: 60 }))
  const logs = makeDays(140, [...baseline, ...week])
  logs[logs.length - 1] = { ...logs[logs.length - 1], heartRate: 105, sleepHours: 5.5, mood: 2, pvt: pvt(333, 4) }
  return logs
}

/** Seven logged days on day 140 built from the same overrides. */
const lastWeek = (overrides: Partial<DailyLog>) => makeDays(140, Array.from({ length: 7 }, () => overrides))

describe('recommend: SPEC 4.5 story', () => {
  it('picks exercise 120 and sleep 7 as the change', () => {
    expect(asChange(recommend(storyLogs(), mission)).change).toEqual({ exerciseMin: 120, sleepHours: 7 })
  })

  it('before is Not Ready at 48.86, after is Limited at 58.32', () => {
    const rec = asChange(recommend(storyLogs(), mission))
    expect(round2(rec.before.rLand)).toBe(48.86)
    expect(rec.before.band).toBe('not-ready')
    expect(round2(rec.after.rLand)).toBe(58.32)
    expect(rec.after.band).toBe('limited')
  })

  it('gain is after minus before (about 9.46) and text describes the change', () => {
    const rec = asChange(recommend(storyLogs(), mission))
    expect(rec.gain).toBeCloseTo(rec.after.rLand - rec.before.rLand, 10)
    expect(Math.abs(rec.gain - 9.46)).toBeLessThanOrEqual(0.01)
    expect(rec.text).toBe('Exercise 120 min a day and sleep 7 h a night')
  })
})

describe('recommend: evaluation order and tie-break', () => {
  it('evaluates singles (exercise asc, then sleep asc) before combos (exercise asc, then sleep asc)', () => {
    recommend(storyLogs(), mission)
    expect(evaluated()).toEqual([
      { exerciseMin: 90 },
      { exerciseMin: 120 },
      { sleepHours: 7 },
      { sleepHours: 8 },
      { exerciseMin: 90, sleepHours: 7 },
      { exerciseMin: 90, sleepHours: 8 },
      { exerciseMin: 120, sleepHours: 7 },
      { exerciseMin: 120, sleepHours: 8 },
    ])
  })

  it('on an exact tie the smaller change wins: sleep 7 beats sleep 8', () => {
    // Sleep 7 and sleep 8 are both green, so (120, 7) and (120, 8) project to the same R.
    expect(asChange(recommend(storyLogs(), mission)).change.sleepHours).toBe(7)
  })
})

describe('recommend: never recommend less', () => {
  it('drops candidates that are not strictly greater than today (exercise 150, sleep 8.5)', () => {
    const logs = makeDays(140, Array.from({ length: 7 }, () => ({ exerciseMin: 150, sleepHours: 8.5 })))
    const rec = recommend(logs, mission)
    expect(evaluated()).toEqual([{ exerciseMin: 180 }])
    expect(rec).toMatchObject({ kind: 'hold', text: 'Hold course' })
  })

  it('all-green high adherence holds the course', () => {
    const rec = recommend(lastWeek({}), mission)
    expect(rec).toMatchObject({ kind: 'hold', text: 'Hold course', before: { band: 'ready' } })
  })
})

describe('recommend: candidate generation', () => {
  it('caps the exercise candidate at 180 min (base 170 gives 180, never 200)', () => {
    const rec = recommend(lastWeek({ exerciseMin: 170 }), mission)
    expect(evaluated()).toEqual([{ exerciseMin: 180 }])
    expect(rec).toMatchObject({ kind: 'hold' })
  })

  it('rounds the +30 candidate to whole minutes (mean 60.86 gives 91, not 90.86)', () => {
    const logs = lastWeek({ exerciseMin: 60 })
    logs[0] = { ...logs[0], exerciseMin: 66 }
    recommend(logs, mission)
    expect(evaluated()[0]).toEqual({ exerciseMin: 91 })
  })

  it('deduplicates equal exercise candidates (base 90: base+30 and target are both 120)', () => {
    const rec = asChange(recommend(lastWeek({ exerciseMin: 90 }), mission))
    expect(evaluated()).toEqual([{ exerciseMin: 120 }])
    expect(rec.change).toEqual({ exerciseMin: 120 })
    expect(rec.text).toBe('Exercise 120 min a day')
  })
})

describe('recommend: minGain boundary', () => {
  it('a best gain exactly equal to minGain is recommended', () => {
    fixedGain(RECOMMEND.minGain)
    const rec = asChange(recommend(lastWeek({}), mission))
    expect(rec.gain).toBe(RECOMMEND.minGain)
  })

  it('a best gain just below minGain holds the course', () => {
    fixedGain(0.99)
    expect(recommend(lastWeek({}), mission)).toMatchObject({ kind: 'hold', text: 'Hold course' })
  })
})

describe('recommend: no logs', () => {
  it('returns null with no logs', () => {
    expect(recommend([], mission)).toBeNull()
  })
})

describe('describeChange', () => {
  it('exercise only', () => expect(describeChange({ exerciseMin: 120 })).toBe('Exercise 120 min a day'))

  it('sleep only', () => expect(describeChange({ sleepHours: 7 })).toBe('Sleep 7 h a night'))

  it('exercise and sleep', () =>
    expect(describeChange({ exerciseMin: 120, sleepHours: 7 })).toBe('Exercise 120 min a day and sleep 7 h a night'))

  it('sleep shows up to 1 decimal with no trailing .0', () => {
    expect(describeChange({ sleepHours: 7.5 })).toBe('Sleep 7.5 h a night')
    expect(describeChange({ sleepHours: 8 })).toBe('Sleep 8 h a night')
  })
})

describe('commitmentMet', () => {
  const change = { exerciseMin: 120, sleepHours: 7 }

  it('is true when exercise and sleep both reach the change', () =>
    expect(commitmentMet(change, makeLog({ exerciseMin: 120, sleepHours: 7 }))).toBe(true))

  it('is false when exercise is short', () =>
    expect(commitmentMet(change, makeLog({ exerciseMin: 119, sleepHours: 8 }))).toBe(false))

  it('is false when sleep is short', () =>
    expect(commitmentMet(change, makeLog({ exerciseMin: 150, sleepHours: 6.9 }))).toBe(false))

  it('checks only the keys the change sets (partial change)', () => {
    expect(commitmentMet({ sleepHours: 7 }, makeLog({ exerciseMin: 0, sleepHours: 7 }))).toBe(true)
    expect(commitmentMet({ exerciseMin: 120 }, makeLog({ exerciseMin: 120, sleepHours: 3 }))).toBe(true)
  })

  it('an empty change is always met', () =>
    expect(commitmentMet({}, makeLog({ exerciseMin: 0, sleepHours: 0 }))).toBe(true))
})
