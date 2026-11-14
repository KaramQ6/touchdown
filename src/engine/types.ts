// SPEC section 5: data model.

export type Status = 'green' | 'yellow' | 'red'
export type Source = 'manual' | 'wearable-sim' | 'camera'
export type IndicatorKey = 'hr' | 'bp' | 'glucose' | 'temp' | 'sleep' | 'mood'
export type Band = 'ready' | 'limited' | 'not-ready'
export type Axis = 'M' | 'S' | 'V'

export interface PvtResult {
  medianMs: number
  lapses: number
  falseStarts: number
}

export interface DailyLog {
  day: number
  heartRate: number
  hrSource: Source
  systolic: number
  diastolic: number
  glucose: number
  tempC: number
  tempSource: Source
  sleepHours: number
  mood: 1 | 2 | 3 | 4 | 5
  exerciseMin: number
  pvt?: PvtResult
}

export interface Astronaut {
  id: string
  name: string
  role: string
  logs: DailyLog[]
}

export interface Mission {
  currentDay: number
  landingDay: number // default 210
  commDelayMin: number // one-way, default 12
  crew: Astronaut[]
  activeId: string
}

export interface Readiness {
  R: number
  M: number
  S: number
  V: number
  band: Band
  drivers: { axis: Axis; text: string }[]
  indicatorStatus: Record<IndicatorKey, Status>
}

export interface Escalation {
  level: 0 | 1 | 2 | 3
  rule: string
  action: string
  /** Indicator that fired the rule, so the UI can pick its action card. */
  indicator?: IndicatorKey
}

export interface SourceEntry {
  id: string
  label: string
  value: string
  status: 'VERIFIED' | 'ASSUMPTION' | 'VERIFY'
  citation: string
  url?: string
  note?: string
}
