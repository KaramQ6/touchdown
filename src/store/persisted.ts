import { validateVitals, type VitalsInput } from '../engine/thresholds'
import type { DailyLog, Mission } from '../engine/types'
import type { Commitment } from './mission'

// localStorage is a trust boundary: anything read back is checked before the app uses it.

export interface PersistedState {
  mission: Mission
  isDemo: boolean
  commitments: Record<string, Commitment>
  remeasureDueAt: Record<string, number>
}

type Rec = Record<string, unknown>
const isRecord = (x: unknown): x is Rec => typeof x === 'object' && x !== null && !Array.isArray(x)
const finite = (x: unknown): x is number => typeof x === 'number' && Number.isFinite(x)
const optionalFinite = (x: unknown) => x === undefined || finite(x)
const SOURCES = new Set<unknown>(['manual', 'wearable-sim', 'camera'])

function isValidLog(l: unknown): l is DailyLog {
  if (!isRecord(l) || !Number.isInteger(l.day) || !SOURCES.has(l.hrSource) || !SOURCES.has(l.tempSource)) return false
  if (Object.keys(validateVitals(l as unknown as VitalsInput)).length > 0) return false
  const { pvt } = l
  return pvt === undefined || (isRecord(pvt) && finite(pvt.medianMs) && finite(pvt.lapses) && finite(pvt.falseStarts))
}

function isValidMission(m: unknown): m is Mission {
  return (
    isRecord(m) &&
    Number.isInteger(m.currentDay) &&
    Number.isInteger(m.landingDay) &&
    finite(m.commDelayMin) &&
    typeof m.activeId === 'string' &&
    Array.isArray(m.crew) &&
    m.crew.length > 0 &&
    m.crew.every(
      (a) =>
        isRecord(a) &&
        typeof a.id === 'string' &&
        typeof a.name === 'string' &&
        typeof a.role === 'string' &&
        Array.isArray(a.logs) &&
        a.logs.every(isValidLog),
    )
  )
}

function isValidCommitment(c: unknown): c is Commitment {
  return (
    isRecord(c) &&
    finite(c.day) &&
    finite(c.targetRLand) &&
    isRecord(c.change) &&
    optionalFinite(c.change.exerciseMin) &&
    optionalFinite(c.change.sleepHours) &&
    (c.checkIn === undefined || isValidLog(c.checkIn))
  )
}

/** Keeps only the entries of a plain object that pass `ok`; anything else becomes {}. */
function keepValid<T>(x: unknown, ok: (v: unknown) => v is T): Record<string, T> {
  if (!isRecord(x)) return {}
  return Object.fromEntries(Object.entries(x).filter((e): e is [string, T] => ok(e[1])))
}

/**
 * Returns the saved state if its mission is usable, else `fallback` (the seed).
 * An unknown activeId is repaired to the first astronaut, so writes land on the astronaut the screens show.
 */
export function restoreState(saved: unknown, fallback: () => PersistedState): PersistedState {
  const s = isRecord(saved) ? saved : {}
  if (!isValidMission(s.mission)) return fallback()
  const m = s.mission
  return {
    mission: m.crew.some((a) => a.id === m.activeId) ? m : { ...m, activeId: m.crew[0].id },
    isDemo: typeof s.isDemo === 'boolean' ? s.isDemo : true,
    commitments: keepValid(s.commitments, isValidCommitment),
    remeasureDueAt: keepValid(s.remeasureDueAt, finite),
  }
}
