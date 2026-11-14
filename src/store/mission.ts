import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createSeedMission } from '../data/seed-crew'
import type { Astronaut, DailyLog, Mission, PvtResult } from '../engine/types'
import { ESCALATION } from '../engine/constants'
import { restoreState, type PersistedState } from './persisted'

export const STORAGE_KEY = 'touchdown-mission'

const HOUR_MS = 3_600_000

/** Projection slider overrides (SPEC 4.3). Session only, never persisted. */
export interface WhatIf {
  exerciseMin?: number
  sleepHours?: number
}

/** A committed what-if change. `checkIn` is the first check-in saved after committing. */
export interface Commitment {
  day: number
  change: WhatIf
  targetRLand: number
  checkIn?: DailyLog
}

interface MissionState {
  mission: Mission
  /** True while the crew data comes from the seed (shows the DEMO DATA chip). */
  isDemo: boolean
  whatIf: WhatIf
  /** Commitment per astronaut id. */
  commitments: Record<string, Commitment>
  /** Re-measure deadline per astronaut id, epoch ms. */
  remeasureDueAt: Record<string, number>
  /** Saves a log for the active astronaut. Same day replaces, keeping that day's PVT if the new log has none. */
  addLog: (log: DailyLog) => void
  /** Saves a reaction test on the active astronaut's log for today. False if there is no check-in today. */
  setTodayPvt: (pvt: PvtResult) => boolean
  setActive: (id: string) => void
  setWhatIf: (whatIf: WhatIf) => void
  /** Commits a change for the active astronaut, replacing any previous commitment. */
  commit: (c: { day: number; change: WhatIf; targetRLand: number }) => void
  /** Starts the re-measure clock for the active astronaut. No-op if already running. */
  armRemeasure: (now: number) => void
  resetDemo: () => void
}

/** Returns new logs with `log` placed by day. O(n). */
function upsertLog(logs: readonly DailyLog[], log: DailyLog): DailyLog[] {
  const i = logs.findIndex((l) => l.day >= log.day)
  if (i === -1) return [...logs, log]
  if (logs[i].day !== log.day) return [...logs.slice(0, i), log, ...logs.slice(i)]
  return logs.map((l, j) => (j === i ? { ...log, pvt: log.pvt ?? l.pvt } : l))
}

/**
 * Writes `log` for the active astronaut. Only a check-in (`isCheckIn`) records the
 * first post-commit log and clears the re-measure clock; other writes (PVT) do neither.
 */
function saveLog(s: MissionState, log: DailyLog, isCheckIn: boolean): Partial<MissionState> {
  const { activeId } = s.mission
  const crew = s.mission.crew.map((a) => (a.id === activeId ? { ...a, logs: upsertLog(a.logs, log) } : a))
  const next: Partial<MissionState> = { mission: { ...s.mission, crew } }
  if (!isCheckIn) return next

  const stored = crew.find((a) => a.id === activeId)?.logs.find((l) => l.day === log.day)
  const c = s.commitments[activeId]
  if (c && !c.checkIn && stored) next.commitments = { ...s.commitments, [activeId]: { ...c, checkIn: stored } }

  const remeasureDueAt = { ...s.remeasureDueAt }
  delete remeasureDueAt[activeId]
  next.remeasureDueAt = remeasureDueAt
  return next
}

const seedState = (): PersistedState => ({ mission: createSeedMission(), isDemo: true, commitments: {}, remeasureDueAt: {} })

export const useMission = create<MissionState>()(
  persist(
    (set, get) => ({
      mission: createSeedMission(),
      isDemo: true,
      whatIf: {},
      commitments: {},
      remeasureDueAt: {},
      addLog: (log) => set((s) => saveLog(s, log, true)),
      setTodayPvt: (pvt) => {
        const s = get()
        const today = selectActive(s).logs.find((l) => l.day === s.mission.currentDay)
        if (!today) return false
        set(saveLog(s, { ...today, pvt }, false))
        return true
      },
      setActive: (id) =>
        set(({ mission }) =>
          mission.crew.some((a) => a.id === id) ? { mission: { ...mission, activeId: id }, whatIf: {} } : {},
        ),
      setWhatIf: (whatIf) => set({ whatIf }),
      commit: (c) => set((s) => ({ commitments: { ...s.commitments, [s.mission.activeId]: { ...c } } })),
      armRemeasure: (now) =>
        set((s) => {
          const id = s.mission.activeId
          if (s.remeasureDueAt[id] !== undefined) return {}
          return { remeasureDueAt: { ...s.remeasureDueAt, [id]: now + ESCALATION.remeasureHours * HOUR_MS } }
        }),
      resetDemo: () => set({ ...seedState(), whatIf: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ mission, isDemo, commitments, remeasureDueAt }) => ({
        mission,
        isDemo,
        commitments,
        remeasureDueAt,
      }),
      merge: (saved, current) => ({ ...current, ...restoreState(saved, seedState) }),
    },
  ),
)

export const selectActive = (s: Pick<MissionState, 'mission'>): Astronaut =>
  s.mission.crew.find((a) => a.id === s.mission.activeId) ?? s.mission.crew[0]

export const useActiveAstronaut = () => useMission(selectActive)
