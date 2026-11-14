import { COMM_DELAY_DEFAULT_MIN, LANDING_DAY_DEFAULT } from '../engine/constants'
import type { Astronaut, DailyLog, Mission } from '../engine/types'

// DEMO DATA: 4 astronauts x 120 logged days ending on mission day 140. Fully deterministic.

/** "Demo: fever" button value, above the level 3 temperature threshold (SPEC 4.6, PROMPTS 5). */
export const DEMO_FEVER_C = 38.6

const CURRENT_DAY = 140
const LOGGED_DAYS = 120
const FIRST_DAY = CURRENT_DAY - LOGGED_DAYS + 1 // 21

/** Small seeded PRNG (mulberry32). Same seed, same sequence; never Math.random. */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Profile {
  id: string
  name: string
  role: string
  seed: number
  /** Day-21 baselines. */
  base: { hr: number; systolic: number; diastolic: number; glucose: number; temp: number; sleep: number; mood: number; exercise: number; rt: number }
  /** Total change from day 21 to day 140 (gentle linear trend). */
  drift: { hr: number; glucose: number; sleep: number; exercise: number; rt: number }
  /** Fixed values for specific days, applied after generation. */
  patch?: Record<number, Partial<DailyLog>>
}

const pvt = (medianMs: number, lapses: number, falseStarts: number) => ({ medianMs, lapses, falseStarts })

/**
 * SPEC 4.5 hero story. Everything that moves R in the demo is fixed, not random:
 * baseline PVTs (RT0 = 250), the last 7 days of exercise (mean 60 min), and all of day 140.
 */
const HERO_PATCH: Record<number, Partial<DailyLog>> = {
  21: { pvt: pvt(245, 0, 0) },
  22: { pvt: pvt(250, 0, 0) },
  23: { pvt: pvt(255, 0, 0) },
  134: { exerciseMin: 55 },
  135: { exerciseMin: 65 },
  136: { exerciseMin: 60 },
  137: { exerciseMin: 50 },
  138: { exerciseMin: 70 },
  139: { exerciseMin: 60 },
  140: { exerciseMin: 60, heartRate: 104, sleepHours: 5.5, mood: 2, pvt: pvt(333, 4, 1) },
}

const PROFILES: Profile[] = [
  {
    id: 'noor',
    name: 'Noor Haddad',
    role: 'Flight Engineer',
    seed: 1401,
    base: { hr: 68, systolic: 116, diastolic: 75, glucose: 88, temp: 36.7, sleep: 7.6, mood: 4, exercise: 110, rt: 250 },
    drift: { hr: 4, glucose: 0, sleep: -0.5, exercise: -20, rt: 20 },
    patch: HERO_PATCH,
  },
  {
    id: 'daniel',
    name: 'Daniel Okoro',
    role: 'Commander',
    seed: 1402,
    base: { hr: 63, systolic: 118, diastolic: 76, glucose: 90, temp: 36.6, sleep: 7.6, mood: 4.3, exercise: 115, rt: 240 },
    drift: { hr: 2, glucose: 0, sleep: -0.2, exercise: 0, rt: 5 },
  },
  {
    id: 'elena',
    name: 'Elena Vasquez',
    role: 'Crew Medical Officer',
    seed: 1403,
    base: { hr: 72, systolic: 122, diastolic: 78, glucose: 92, temp: 36.7, sleep: 7.1, mood: 3.9, exercise: 95, rt: 260 },
    drift: { hr: 6, glucose: 2, sleep: -0.4, exercise: -15, rt: 25 },
  },
  {
    id: 'kenji',
    name: 'Kenji Mori',
    role: 'Mission Specialist',
    seed: 1404,
    base: { hr: 66, systolic: 112, diastolic: 72, glucose: 92, temp: 36.8, sleep: 7.8, mood: 4.2, exercise: 120, rt: 235 },
    drift: { hr: 2, glucose: 8, sleep: -0.3, exercise: -10, rt: 10 },
  },
]

const round1 = (x: number) => Math.round(x * 10) / 10
const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))

function buildAstronaut(p: Profile): Astronaut {
  const rand = mulberry32(p.seed)
  const noise = (amp: number) => (rand() * 2 - 1) * amp
  const logs: DailyLog[] = []
  for (let i = 0; i < LOGGED_DAYS; i++) {
    const day = FIRST_DAY + i
    const t = i / (LOGGED_DAYS - 1)
    const generated: DailyLog = {
      day,
      heartRate: Math.round(p.base.hr + p.drift.hr * t + noise(3)),
      hrSource: 'manual',
      systolic: Math.round(p.base.systolic + noise(5)),
      diastolic: Math.round(p.base.diastolic + noise(4)),
      glucose: Math.round(p.base.glucose + p.drift.glucose * t + noise(5)),
      tempC: round1(p.base.temp + noise(0.2)),
      tempSource: 'manual',
      sleepHours: round1(p.base.sleep + p.drift.sleep * t + noise(0.4)),
      mood: clamp(Math.round(p.base.mood + noise(0.7)), 1, 5) as DailyLog['mood'],
      exerciseMin: Math.max(0, Math.round((p.base.exercise + p.drift.exercise * t + noise(15)) / 5) * 5),
      pvt: pvt(Math.round(p.base.rt + p.drift.rt * t + noise(10)), rand() < 0.15 ? 1 : 0, rand() < 0.2 ? 1 : 0),
    }
    logs.push({ ...generated, ...p.patch?.[day] })
  }
  return { id: p.id, name: p.name, role: p.role, logs }
}

/** A fresh seeded mission. Called on first launch and by "Reset demo". */
export function createSeedMission(): Mission {
  const crew = PROFILES.map(buildAstronaut)
  return {
    currentDay: CURRENT_DAY,
    landingDay: LANDING_DAY_DEFAULT,
    commDelayMin: COMM_DELAY_DEFAULT_MIN,
    crew,
    activeId: crew[0].id,
  }
}
