import { describe, expect, it } from 'vitest'
import { evaluateEscalation, roundTripMin } from '../escalation'
import { makeDays, makeLog } from './helpers'

const YELLOW_HR = { heartRate: 105 }
const RED_SLEEP = { sleepHours: 5 }

describe('evaluateEscalation: SPEC 4.6', () => {
  it('level 0 when all green', () => {
    const e = evaluateEscalation([makeLog()])
    expect(e.level).toBe(0)
    expect(e.action).toBe('All clear.')
  })

  it('level 0 with no logs', () => expect(evaluateEscalation([]).level).toBe(0))

  it('level 1 for any yellow today, naming the indicator', () => {
    const e = evaluateEscalation([makeLog(YELLOW_HR)])
    expect(e.level).toBe(1)
    expect(e.indicator).toBe('hr')
    expect(e.rule).toMatch(/heart rate/i)
  })

  it('level 2 for any red today', () => {
    const e = evaluateEscalation([makeLog(RED_SLEEP)])
    expect(e.level).toBe(2)
    expect(e.indicator).toBe('sleep')
  })

  it('level 2 for the same indicator yellow 3 days in a row', () => {
    const e = evaluateEscalation(makeDays(12, [YELLOW_HR, YELLOW_HR, YELLOW_HR]))
    expect(e.level).toBe(2)
    expect(e.rule).toMatch(/3 days in a row/)
  })

  it('level 2 rule says "not green", since a red day can sit inside the run', () => {
    const e = evaluateEscalation(makeDays(12, [YELLOW_HR, YELLOW_HR, YELLOW_HR]))
    expect(e.rule).toMatch(/not green 3 days in a row/)
    expect(e.rule).not.toMatch(/yellow/)
  })

  it('stays level 1 when yellow only 2 days in a row', () => {
    expect(evaluateEscalation(makeDays(12, [{}, YELLOW_HR, YELLOW_HR])).level).toBe(1)
  })

  it('stays level 1 when the 3 yellow days are not consecutive days', () => {
    const logs = [makeLog({ day: 8, ...YELLOW_HR }), makeLog({ day: 10, ...YELLOW_HR }), makeLog({ day: 11, ...YELLOW_HR })]
    expect(evaluateEscalation(logs).level).toBe(1)
  })

  it('stays level 1 when 3 yellow days are on different indicators', () => {
    const logs = makeDays(12, [YELLOW_HR, { glucose: 110 }, { tempC: 37.5 }])
    expect(evaluateEscalation(logs).level).toBe(1)
  })

  it('level 3 for temp >= 38.5', () => {
    expect(evaluateEscalation([makeLog({ tempC: 38.5 })]).level).toBe(3)
    expect(evaluateEscalation([makeLog({ tempC: 38.4 })]).level).toBe(2)
  })

  it('level 3 for systolic >= 160', () => {
    expect(evaluateEscalation([makeLog({ systolic: 160 })]).level).toBe(3)
    expect(evaluateEscalation([makeLog({ systolic: 159 })]).level).toBe(2)
  })

  it('level 3 for glucose < 54', () => {
    expect(evaluateEscalation([makeLog({ glucose: 53 })]).level).toBe(3)
    expect(evaluateEscalation([makeLog({ glucose: 54 })]).level).toBe(2)
  })

  it('level 3 for the same indicator red 2 days in a row', () => {
    const e = evaluateEscalation(makeDays(12, [RED_SLEEP, RED_SLEEP]))
    expect(e.level).toBe(3)
    expect(e.rule).toMatch(/2 days in a row/)
  })

  it('stays level 2 when red today but not yesterday', () => {
    expect(evaluateEscalation(makeDays(12, [{}, RED_SLEEP])).level).toBe(2)
  })

  it('highest triggered level wins', () => {
    const e = evaluateEscalation([makeLog({ ...YELLOW_HR, ...RED_SLEEP, tempC: 38.6 })])
    expect(e.level).toBe(3)
    expect(e.indicator).toBe('temp')
  })

  it('judges today by the latest log, not array order', () => {
    const logs = [makeLog({ day: 12 }), makeLog({ day: 11, ...RED_SLEEP })]
    expect(evaluateEscalation(logs).level).toBe(0)
  })
})

describe('roundTripMin: SPEC 4.7', () => {
  it('is 2x the one-way delay', () => expect(roundTripMin(12)).toBe(24))
  it('accepts the physical range 3-22', () => {
    expect(roundTripMin(3)).toBe(6)
    expect(roundTripMin(22)).toBe(44)
  })
  it('rejects one-way delays outside 3-22', () => {
    expect(() => roundTripMin(2)).toThrow(RangeError)
    expect(() => roundTripMin(23)).toThrow(RangeError)
  })
})
