import { describe, expect, it } from 'vitest'
import { createSeedMission } from '../../data/seed-crew'
import { crewSummary } from '../crew'
import { evaluateEscalation } from '../escalation'
import { computeReadiness } from '../score'
import { round2 } from './helpers'

const mission = createSeedMission()

describe('crewSummary (SPEC C1)', () => {
  it('has one row per astronaut, in crew order', () => {
    expect(crewSummary(mission).map((r) => r.id)).toEqual(mission.crew.map((a) => a.id))
  })

  it('hero row: R 54.99, Limited, escalation level 2', () => {
    const hero = crewSummary(mission)[0]
    expect(hero.name).toBe(mission.crew[0].name)
    expect(round2(hero.R!)).toBe(54.99)
    expect(hero.band).toBe('limited')
    expect(hero.level).toBe(2)
  })

  it('every row matches the per-astronaut engine functions exactly', () => {
    const rows = crewSummary(mission)
    mission.crew.forEach((a, i) => {
      const r = computeReadiness(a.logs, mission.currentDay)!
      const e = evaluateEscalation(a.logs)
      expect(rows[i]).toEqual({ id: a.id, name: a.name, role: a.role, R: r.R, band: r.band, level: e.level, rule: e.rule })
    })
  })

  it('an astronaut with no check-in has no R or band, and level 0', () => {
    const empty = { ...mission, crew: [{ ...mission.crew[0], logs: [] }] }
    expect(crewSummary(empty)[0]).toMatchObject({ R: null, band: null, level: 0 })
  })
})
