import { describe, expect, it } from 'vitest'
import { PVT_DURATION_S } from '../constants'
import { nextStimulusDelayMs, summarizePvt, type PvtResponse } from '../pvt'

describe('PVT protocol: SPEC M2', () => {
  it('full mode is 60 s, demo mode is 15 s', () => expect(PVT_DURATION_S).toEqual({ full: 60, demo: 15 }))

  it('stimulus delay spans 2-10 s', () => {
    expect(nextStimulusDelayMs(() => 0)).toBe(2000)
    expect(nextStimulusDelayMs(() => 0.5)).toBe(6000)
    const top = nextStimulusDelayMs(() => 0.999999)
    expect(top).toBeLessThan(10000)
    expect(top).toBeGreaterThanOrEqual(9999)
  })
})

const rt = (ms: number): PvtResponse => ({ kind: 'rt', ms })
const falseStart: PvtResponse = { kind: 'false-start' }

describe('summarizePvt: SPEC M2', () => {
  it('median of an odd number of RTs', () => {
    expect(summarizePvt([rt(300), rt(200), rt(250)])?.medianMs).toBe(250)
  })

  it('median of an even number of RTs is the mean of the middle two', () => {
    expect(summarizePvt([rt(200), rt(300), rt(260), rt(240)])?.medianMs).toBe(250)
  })

  it('counts lapses as RT >= 500 ms', () => {
    expect(summarizePvt([rt(499), rt(500), rt(800), rt(250)])?.lapses).toBe(2)
  })

  it('counts false starts separately and never as RT', () => {
    const s = summarizePvt([rt(200), falseStart, rt(300), falseStart, rt(250)])
    expect(s).toEqual({ medianMs: 250, lapses: 0, falseStarts: 2 })
  })

  it('returns null when there are no valid RTs', () => {
    expect(summarizePvt([falseStart, falseStart])).toBeNull()
    expect(summarizePvt([])).toBeNull()
  })

  it('does not mutate the input', () => {
    const input = [rt(300), rt(200)]
    summarizePvt(input)
    expect(input).toEqual([rt(300), rt(200)])
  })
})
