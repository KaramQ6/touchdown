import { describe, expect, it, vi } from 'vitest'
import { evaluateEscalation } from '../../engine/escalation'
import { projectLanding } from '../../engine/projection'
import { recommend } from '../../engine/recommend'
import { baselineRt, computeReadiness, exerciseAdherence } from '../../engine/score'
import { indicatorStatuses, validateVitals } from '../../engine/thresholds'
import { round2 } from '../../engine/__tests__/helpers'
import { DEMO_FEVER_C, createSeedMission } from '../seed-crew'

const mission = createSeedMission()
const hero = mission.crew[0]
const days = { currentDay: mission.currentDay, landingDay: mission.landingDay }

describe('seed mission shape', () => {
  it('is day 140 of 210 with a 12 min one-way delay, hero active', () => {
    expect(mission).toMatchObject({ currentDay: 140, landingDay: 210, commDelayMin: 12, activeId: hero.id })
  })

  it('has 4 astronauts with 120 consecutive logged days, 21 to 140', () => {
    expect(mission.crew).toHaveLength(4)
    for (const a of mission.crew) {
      expect(a.logs).toHaveLength(120)
      a.logs.forEach((l, i) => expect(l.day).toBe(21 + i))
    }
  })

  it('has unique astronaut ids', () => {
    expect(new Set(mission.crew.map((a) => a.id)).size).toBe(4)
  })

  it('passes input validation on every log', () => {
    for (const a of mission.crew) for (const l of a.logs) expect(validateVitals(l), `${a.id} day ${l.day}`).toEqual({})
  })

  it('is deterministic and never calls Math.random', () => {
    const spy = vi.spyOn(Math, 'random')
    expect(createSeedMission()).toEqual(createSeedMission())
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('returns a fresh copy each call', () => {
    const a = createSeedMission()
    a.crew[0].logs.pop()
    expect(createSeedMission().crew[0].logs).toHaveLength(120)
  })
})

describe('hero astronaut matches SPEC 4.5', () => {
  it('RT0 = 250 ms from the first 3 PVTs', () => expect(baselineRt(hero.logs)).toBe(250))

  it('E = 0.5 (60 min/day over the last 7 days)', () => expect(exerciseAdherence(hero.logs)).toBe(0.5))

  it('today: PVT 333 ms with 4 lapses, sleep 5.5 h, mood 2, HR yellow, rest green', () => {
    const today = hero.logs.at(-1)!
    expect(today.pvt).toMatchObject({ medianMs: 333, lapses: 4 })
    expect(today.sleepHours).toBe(5.5)
    expect(today.mood).toBe(2)
    expect(indicatorStatuses(today)).toEqual({
      hr: 'yellow',
      bp: 'green',
      glucose: 'green',
      temp: 'green',
      sleep: 'red',
      mood: 'red',
    })
  })

  it('yesterday (day 139) has no red indicator', () => {
    const yesterday = hero.logs.at(-2)!
    expect(yesterday.day).toBe(139)
    expect(Object.values(indicatorStatuses(yesterday))).not.toContain('red')
  })

  it('starts at escalation level 2, not 3', () => expect(evaluateEscalation(hero.logs).level).toBe(2))

  it('demo fever on today raises the hero to level 3', () => {
    const logs = [...hero.logs.slice(0, -1), { ...hero.logs.at(-1)!, tempC: DEMO_FEVER_C }]
    expect(evaluateEscalation(logs)).toMatchObject({ level: 3, indicator: 'temp' })
  })
})

describe('demo story targets (SPEC 4.5, PROMPTS 2)', () => {
  it('R_now is Limited at exactly 54.99', () => {
    const r = computeReadiness(hero.logs, mission.currentDay)!
    expect(r.band).toBe('limited')
    expect(round2(r.R)).toBe(54.99)
  })

  it('R_land is Not Ready at exactly 48.86', () => {
    const p = projectLanding(hero.logs, days)!
    expect(p.band).toBe('not-ready')
    expect(round2(p.rLand)).toBe(48.86)
  })

  it('R_land with what-if (exercise 120, sleep 8) is Limited at exactly 58.32', () => {
    const p = projectLanding(hero.logs, { ...days, whatIf: { exerciseMin: 120, sleepHours: 8 } })!
    expect(p.band).toBe('limited')
    expect(round2(p.rLand)).toBe(58.32)
  })
})

describe('hero Today\'s Action (recommend, SPEC 4.5)', () => {
  it('suggests exercise 120 + sleep 7, after at exactly 58.32, Limited', () => {
    const rec = recommend(hero.logs, days)
    expect(rec?.kind).toBe('change')
    if (rec?.kind !== 'change') return
    expect(rec.change).toEqual({ exerciseMin: 120, sleepHours: 7 })
    expect(rec.after.band).toBe('limited')
    expect(round2(rec.after.rLand)).toBe(58.32)
  })
})
