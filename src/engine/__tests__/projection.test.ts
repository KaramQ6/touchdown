import { describe, expect, it } from 'vitest'
import { projectLanding } from '../projection'
import { computeReadiness } from '../score'
import type { DailyLog } from '../types'
import { makeDays, round2 } from './helpers'

const pvt = (medianMs: number, lapses = 0) => ({ medianMs, lapses, falseStarts: 0 })

/**
 * SPEC 4.5 verified example on day 140: RT0 = 250, RT = 333, L = 4, E = 0.5,
 * HR yellow, sleep red (5.5 h), mood red (2), everything else green.
 */
function storyLogs(): DailyLog[] {
  const baseline = [{ pvt: pvt(250) }, { pvt: pvt(250) }, { pvt: pvt(250) }]
  const week = Array.from({ length: 7 }, () => ({ exerciseMin: 60 }))
  const logs = makeDays(140, [...baseline, ...week])
  logs[logs.length - 1] = { ...logs[logs.length - 1], heartRate: 105, sleepHours: 5.5, mood: 2, pvt: pvt(333, 4) }
  return logs
}

const mission = { currentDay: 140, landingDay: 210 }

describe('SPEC 4.5 demo story (engine level)', () => {
  it('R_now = 54.99, Limited', () => {
    const r = computeReadiness(storyLogs(), 140)!
    expect(round2(r.S)).toBe(30.2)
    expect(round2(r.V)).toBe(66.67)
    expect(round2(r.R)).toBe(54.99)
    expect(r.band).toBe('limited')
  })

  it('R_land = 48.86, Not Ready', () => {
    const p = projectLanding(storyLogs(), mission)!
    expect(round2(p.rLand)).toBe(48.86)
    expect(p.band).toBe('not-ready')
  })

  it('R_land with exercise 120 and sleep 8 = 58.32, Limited', () => {
    const p = projectLanding(storyLogs(), { ...mission, whatIf: { exerciseMin: 120, sleepHours: 8 } })!
    expect(round2(p.rLand)).toBe(58.32)
    expect(p.band).toBe('limited')
  })

  it('exercise slider alone: R_land = 54.99', () => {
    const p = projectLanding(storyLogs(), { ...mission, whatIf: { exerciseMin: 120 } })!
    expect(round2(p.rLand)).toBe(54.99)
  })

  it('exercise slider is clipped at 120 min (E <= 1)', () => {
    const at120 = projectLanding(storyLogs(), { ...mission, whatIf: { exerciseMin: 120 } })!
    const at180 = projectLanding(storyLogs(), { ...mission, whatIf: { exerciseMin: 180 } })!
    expect(at180.rLand).toBe(at120.rLand)
  })
})

describe('projection curve: SPEC 4.3', () => {
  it('returns null when landing day is before today (nothing to project)', () => {
    expect(projectLanding(storyLogs(), { currentDay: 140, landingDay: 139 })).toBeNull()
  })

  it('landing today is a one-point curve equal to today', () => {
    const p = projectLanding(storyLogs(), { currentDay: 140, landingDay: 140 })!
    expect(p.curve).toHaveLength(1)
    expect(p.rLand).toBe(p.curve[0].R)
  })

  it('has one point per day from currentDay to landingDay inclusive', () => {
    const { curve } = projectLanding(storyLogs(), mission)!
    expect(curve).toHaveLength(71)
    expect(curve[0].day).toBe(140)
    expect(curve[70].day).toBe(210)
  })

  it('starts at R_now and ends at R_land', () => {
    const p = projectLanding(storyLogs(), mission)!
    expect(round2(p.curve[0].R)).toBe(54.99)
    expect(p.curve[70].R).toBe(p.rLand)
  })

  it('never rises without a what-if change', () => {
    const { curve } = projectLanding(storyLogs(), mission)!
    for (let i = 1; i < curve.length; i++) expect(curve[i].R).toBeLessThanOrEqual(curve[i - 1].R)
  })

  it('returns null with no logs', () => expect(projectLanding([], mission)).toBeNull())
})
