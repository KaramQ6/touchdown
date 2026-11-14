import { describe, expect, it } from 'vitest'
import { computeReadiness } from '../../engine/score'
import { BODY_REGIONS, regionDetail, regionStatus, type BodyRegionId } from '../body-regions'
import { createSeedMission } from '../seed-crew'

const mission = createSeedMission()
const hero = mission.crew[0]
const day = mission.currentDay
const readiness = computeReadiness(hero.logs, day)!
const region = (id: BodyRegionId) => BODY_REGIONS.find((r) => r.id === id)!

describe('regionStatus on the hero (M 69, S 30, HR yellow, sleep and mood red)', () => {
  it.each<[BodyRegionId, string]>([
    ['bones', 'yellow'], // M band
    ['calves', 'yellow'], // M band
    ['balance', 'red'], // S band
    ['heart', 'yellow'], // worst of HR yellow, BP green
    ['mind', 'red'], // worst of sleep red, mood red
  ])('%s is %s', (id, status) => expect(regionStatus(region(id), readiness)).toBe(status))
})

describe('regionDetail', () => {
  const ctx = { logs: hero.logs, day, readiness }
  it('bones: modelled bone density loss', () => expect(regionDetail(region('bones'), ctx)).toBe('Bone density down 4.4% (model)'))
  it('calves: modelled calf strength loss', () =>
    expect(regionDetail(region('calves'), ctx)).toBe('Calf strength down 11.7% (model)'))
  it('balance: the S driver line', () =>
    expect(regionDetail(region('balance'), ctx)).toBe('Reaction time 33% slower than baseline'))
  it('heart: today HR and BP', () => expect(regionDetail(region('heart'), ctx)).toMatch(/^HR 104 bpm, BP \d+\/\d+ mmHg$/))
  it('mind: today sleep and mood', () => expect(regionDetail(region('mind'), ctx)).toBe('Sleep 5.5 h, mood 2 of 5'))
})
