import { beforeEach, describe, expect, it, vi } from 'vitest'

// In-memory localStorage for the node test environment (persist needs a Storage).
vi.hoisted(() => {
  const data = new Map<string, string>()
  const storage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
    key: (i: number) => [...data.keys()][i] ?? null,
    get length() {
      return data.size
    },
  }
  ;(globalThis as unknown as { localStorage: Storage }).localStorage = storage
})

import { computeReadiness } from '../../engine/score'
import { ESCALATION } from '../../engine/constants'
import { createSeedMission } from '../../data/seed-crew'
import { STORAGE_KEY, selectActive, useMission } from '../mission'

const state = () => useMission.getState()
const today = () => selectActive(state()).logs.at(-1)!

beforeEach(() => state().resetDemo())

describe('mission store', () => {
  it('starts on the seeded mission, flagged as demo data, hero active', () => {
    expect(state().mission).toEqual(createSeedMission())
    expect(state().isDemo).toBe(true)
    expect(selectActive(state()).id).toBe(createSeedMission().crew[0].id)
  })

  it('addLog replaces the same-day log, keeps its PVT, and changes R', () => {
    const before = computeReadiness(selectActive(state()).logs, 140)!.R
    const { pvt, ...vitals } = today()
    state().addLog({ ...vitals, sleepHours: 8 })
    expect(selectActive(state()).logs).toHaveLength(120)
    expect(today()).toMatchObject({ day: 140, sleepHours: 8, pvt })
    expect(computeReadiness(selectActive(state()).logs, 140)!.R).toBeGreaterThan(before)
  })

  it('addLog with a new day appends in day order', () => {
    state().addLog({ ...today(), day: 141 })
    const days = selectActive(state()).logs.map((l) => l.day)
    expect(days.at(-1)).toBe(141)
    expect(days).toHaveLength(121)
  })

  it('addLog keeps per-field sources (SPEC S1) and they survive a reload', () => {
    state().addLog({ ...today(), hrSource: 'wearable-sim', tempSource: 'manual' })
    expect(today()).toMatchObject({ hrSource: 'wearable-sim', tempSource: 'manual' })
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!).state.mission
    const active = saved.crew.find((a: { id: string }) => a.id === saved.activeId)
    expect(active.logs.at(-1)).toMatchObject({ hrSource: 'wearable-sim', tempSource: 'manual' })
  })

  it('addLog only touches the active astronaut', () => {
    const others = state().mission.crew.slice(1)
    state().addLog({ ...today(), sleepHours: 8 })
    expect(state().mission.crew.slice(1)).toEqual(others)
  })

  it('setActive switches astronaut and clears the what-if', () => {
    state().setWhatIf({ exerciseMin: 120 })
    const second = state().mission.crew[1].id
    state().setActive(second)
    expect(selectActive(state()).id).toBe(second)
    expect(state().whatIf).toEqual({})
  })

  it('setActive ignores an unknown id', () => {
    const active = state().mission.activeId
    state().setActive('nobody')
    expect(state().mission.activeId).toBe(active)
  })

  it('setWhatIf replaces the slider values', () => {
    state().setWhatIf({ exerciseMin: 120, sleepHours: 8 })
    state().setWhatIf({ sleepHours: 7 })
    expect(state().whatIf).toEqual({ sleepHours: 7 })
  })

  it('resetDemo restores the seed and clears the what-if', () => {
    state().addLog({ ...today(), sleepHours: 8 })
    state().setWhatIf({ exerciseMin: 120 })
    state().resetDemo()
    expect(state().mission).toEqual(createSeedMission())
    expect(state().whatIf).toEqual({})
  })

  it('setTodayPvt saves the reaction test on today\'s log', () => {
    const pvt = { medianMs: 280, lapses: 1, falseStarts: 2 }
    expect(state().setTodayPvt(pvt)).toBe(true)
    expect(today()).toMatchObject({ day: 140, pvt })
    expect(selectActive(state()).logs).toHaveLength(120)
  })

  it('setTodayPvt refuses when there is no check-in for today', () => {
    useMission.setState(({ mission }) => ({ mission: { ...mission, currentDay: 141 } }))
    const before = state().mission
    expect(state().setTodayPvt({ medianMs: 280, lapses: 0, falseStarts: 0 })).toBe(false)
    expect(state().mission).toBe(before)
  })

  it('persists the mission but not the what-if', () => {
    state().setWhatIf({ exerciseMin: 120 })
    state().addLog({ ...today(), sleepHours: 8 })
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!).state
    expect(saved.mission.crew[0].logs.at(-1).sleepHours).toBe(8)
    expect(saved).not.toHaveProperty('whatIf')
  })

  describe('commitments and re-measure clock', () => {
    const HOUR = 3_600_000
    const activeId = () => state().mission.activeId
    const commitment = { day: 140, change: { exerciseMin: 30 }, targetRLand: 70 }

    it('commit stores a commitment for the active astronaut only', () => {
      const other = state().mission.crew[1].id
      state().commit(commitment)
      expect(state().commitments[activeId()]).toEqual({ ...commitment, checkIn: undefined })
      expect(state().commitments[other]).toBeUndefined()
    })

    it('commit replaces a previous commitment and clears its checkIn', () => {
      state().commit(commitment)
      state().addLog({ ...today(), sleepHours: 8 })
      expect(state().commitments[activeId()].checkIn).toBeDefined()
      state().commit({ ...commitment, targetRLand: 80 })
      expect(state().commitments[activeId()].targetRLand).toBe(80)
      expect(state().commitments[activeId()].checkIn).toBeUndefined()
    })

    it('first check-in after commit sets checkIn to the stored log, and a second one does not overwrite it', () => {
      state().commit(commitment)
      state().addLog({ ...today(), sleepHours: 8 })
      const first = today()
      expect(state().commitments[activeId()].checkIn).toEqual(first)
      state().addLog({ ...today(), sleepHours: 5 })
      expect(state().commitments[activeId()].checkIn).toEqual(first)
    })

    it('check-in without a commitment creates none', () => {
      state().addLog({ ...today(), sleepHours: 8 })
      expect(state().commitments).toEqual({})
    })

    it('setTodayPvt does not set checkIn', () => {
      state().commit(commitment)
      state().setTodayPvt({ medianMs: 280, lapses: 0, falseStarts: 0 })
      expect(state().commitments[activeId()].checkIn).toBeUndefined()
    })

    it('setTodayPvt does not clear the re-measure clock', () => {
      state().armRemeasure(1_000)
      state().setTodayPvt({ medianMs: 280, lapses: 0, falseStarts: 0 })
      expect(state().remeasureDueAt[activeId()]).toBe(1_000 + ESCALATION.remeasureHours * HOUR)
    })

    it('armRemeasure sets now + remeasureHours for the active astronaut', () => {
      state().armRemeasure(1_000)
      expect(state().remeasureDueAt[activeId()]).toBe(1_000 + ESCALATION.remeasureHours * HOUR)
      expect(state().remeasureDueAt[state().mission.crew[1].id]).toBeUndefined()
    })

    it('armRemeasure is idempotent: a second call does not restart the clock', () => {
      state().armRemeasure(1_000)
      state().armRemeasure(9_000_000)
      expect(state().remeasureDueAt[activeId()]).toBe(1_000 + ESCALATION.remeasureHours * HOUR)
    })

    it('addLog clears the clock for the active astronaut only', () => {
      const second = state().mission.crew[1].id
      state().armRemeasure(1_000)
      state().setActive(second)
      state().armRemeasure(2_000)
      state().setActive(state().mission.crew[0].id)
      state().addLog({ ...today(), sleepHours: 8 })
      expect(state().remeasureDueAt[state().mission.crew[0].id]).toBeUndefined()
      expect(state().remeasureDueAt[second]).toBe(2_000 + ESCALATION.remeasureHours * HOUR)
    })

    it('setActive does not touch commitments or the clock', () => {
      const second = state().mission.crew[1].id
      state().commit(commitment)
      state().armRemeasure(1_000)
      const { commitments, remeasureDueAt } = state()
      state().setActive(second)
      expect(state().commitments).toEqual(commitments)
      expect(state().remeasureDueAt).toEqual(remeasureDueAt)
    })

    it('resetDemo clears commitments and the clock', () => {
      state().commit(commitment)
      state().armRemeasure(1_000)
      state().resetDemo()
      expect(state().commitments).toEqual({})
      expect(state().remeasureDueAt).toEqual({})
    })

    it('persists commitments and the clock', () => {
      state().commit(commitment)
      state().armRemeasure(1_000)
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY)!).state
      expect(saved.commitments[activeId()]).toMatchObject(commitment)
      expect(saved.remeasureDueAt[activeId()]).toBe(1_000 + ESCALATION.remeasureHours * HOUR)
    })

    it('hydrates a legacy v1 payload without the new keys with empty maps', async () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ state: { mission: createSeedMission(), isDemo: true }, version: 1 }),
      )
      await useMission.persist.rehydrate()
      expect(state().commitments).toEqual({})
      expect(state().remeasureDueAt).toEqual({})
      expect(state().mission).toEqual(createSeedMission())
    })
  })
})

describe('loading saved state (trust boundary)', () => {
  const save = (state: unknown) => localStorage.setItem(STORAGE_KEY, JSON.stringify({ state, version: 1 }))
  const seeded = () => ({ mission: createSeedMission(), isDemo: true, commitments: {}, remeasureDueAt: {} })
  const reload = async (state: unknown) => {
    save(state)
    await useMission.persist.rehydrate()
  }

  it('keeps a valid saved mission', async () => {
    const saved = seeded()
    const active = saved.mission.crew[0]
    active.logs[active.logs.length - 1] = { ...active.logs.at(-1)!, sleepHours: 8 }
    await reload(saved)
    expect(today().sleepHours).toBe(8)
  })

  it.each([
    ['no crew', (m: ReturnType<typeof createSeedMission>) => ({ ...m, crew: undefined })],
    ['empty crew', (m: ReturnType<typeof createSeedMission>) => ({ ...m, crew: [] })],
    ['logs not a list', (m: ReturnType<typeof createSeedMission>) => ({ ...m, crew: [{ ...m.crew[0], logs: 'x' }, ...m.crew.slice(1)] })],
    [
      'a log value that is not a number',
      (m: ReturnType<typeof createSeedMission>) => {
        const logs = [...m.crew[0].logs]
        logs[logs.length - 1] = { ...logs.at(-1)!, heartRate: null as unknown as number }
        return { ...m, crew: [{ ...m.crew[0], logs }, ...m.crew.slice(1)] }
      },
    ],
    ['no current day', (m: ReturnType<typeof createSeedMission>) => ({ ...m, currentDay: 'x' })],
  ])('falls back to the seed when the saved mission has %s', async (_, breakIt) => {
    state().addLog({ ...today(), sleepHours: 8 })
    await reload({ ...seeded(), mission: breakIt(createSeedMission()) })
    expect(state().mission).toEqual(createSeedMission())
    expect(state().isDemo).toBe(true)
  })

  it('repairs an unknown activeId to the first astronaut, so saves land where the screen reads', async () => {
    const saved = seeded()
    await reload({ ...saved, mission: { ...saved.mission, activeId: 'ghost' } })
    expect(state().mission.activeId).toBe(saved.mission.crew[0].id)
    state().addLog({ ...today(), sleepHours: 8 })
    expect(today().sleepHours).toBe(8)
  })

  it('drops commitments and re-measure clocks that are not plain objects', async () => {
    await reload({ ...seeded(), commitments: 'x', remeasureDueAt: [1] })
    expect(state().commitments).toEqual({})
    expect(state().remeasureDueAt).toEqual({})
  })
})
