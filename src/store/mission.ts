import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createSeedMission } from '../data/seed-crew'
import type { Astronaut, DailyLog, Mission, PvtResult } from '../engine/types'

export const STORAGE_KEY = 'touchdown-mission'

/** Projection slider overrides (SPEC 4.3). Session only, never persisted. */
export interface WhatIf {
  exerciseMin?: number
  sleepHours?: number
}

interface MissionState {
  mission: Mission
  /** True while the crew data comes from the seed (shows the DEMO DATA chip). */
  isDemo: boolean
  whatIf: WhatIf
  /** Saves a log for the active astronaut. Same day replaces, keeping that day's PVT if the new log has none. */
  addLog: (log: DailyLog) => void
  /** Saves a reaction test on the active astronaut's log for today. False if there is no check-in today. */
  setTodayPvt: (pvt: PvtResult) => boolean
  setActive: (id: string) => void
  setWhatIf: (whatIf: WhatIf) => void
  resetDemo: () => void
}

/** Returns new logs with `log` placed by day. O(n). */
function upsertLog(logs: readonly DailyLog[], log: DailyLog): DailyLog[] {
  const i = logs.findIndex((l) => l.day >= log.day)
  if (i === -1) return [...logs, log]
  if (logs[i].day !== log.day) return [...logs.slice(0, i), log, ...logs.slice(i)]
  return logs.map((l, j) => (j === i ? { ...log, pvt: log.pvt ?? l.pvt } : l))
}

export const useMission = create<MissionState>()(
  persist(
    (set, get) => ({
      mission: createSeedMission(),
      isDemo: true,
      whatIf: {},
      addLog: (log) =>
        set(({ mission }) => ({
          mission: {
            ...mission,
            crew: mission.crew.map((a) => (a.id === mission.activeId ? { ...a, logs: upsertLog(a.logs, log) } : a)),
          },
        })),
      setTodayPvt: (pvt) => {
        const { mission, addLog } = get()
        const today = selectActive(get()).logs.find((l) => l.day === mission.currentDay)
        if (!today) return false
        addLog({ ...today, pvt })
        return true
      },
      setActive: (id) =>
        set(({ mission }) =>
          mission.crew.some((a) => a.id === id) ? { mission: { ...mission, activeId: id }, whatIf: {} } : {},
        ),
      setWhatIf: (whatIf) => set({ whatIf }),
      resetDemo: () => set({ mission: createSeedMission(), isDemo: true, whatIf: {} }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ mission, isDemo }) => ({ mission, isDemo }),
    },
  ),
)

export const selectActive = (s: Pick<MissionState, 'mission'>): Astronaut =>
  s.mission.crew.find((a) => a.id === s.mission.activeId) ?? s.mission.crew[0]

export const useActiveAstronaut = () => useMission(selectActive)
