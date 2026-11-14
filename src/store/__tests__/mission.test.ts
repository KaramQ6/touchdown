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
})
