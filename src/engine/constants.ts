// Every engine constant lives here. The source id in each comment points at src/data/sources.ts.
import type { IndicatorKey, Status } from './types'

// --- Musculoskeletal model (SPEC 4.2) ---
export const BONE_LOSS_PCT_PER_MONTH = 1.25 // bone_loss
export const DAYS_PER_MONTH = 30 // bone_loss
export const CALF_LOSS_PCT_AT_REF = 20 // calf_strength
export const CALF_REF_DAYS = 180 // calf_strength (~6 months)
export const CALF_LOSS_CAP_PCT = 30 // calf_loss_cap
export const EXERCISE_PROTECTION = 0.5 // exercise_halves_loss
export const EXERCISE_TARGET_MIN = 120 // exercise_target
export const EXERCISE_WINDOW_DAYS = 7 // exercise_window

// --- Score coefficients (SPEC 4.2) ---
export const COEF_BONE = 3 // coefficients
export const COEF_CALF = 1.5 // coefficients
export const COEF_RT = 150 // coefficients
export const COEF_LAPSE = 5 // coefficients
export const WEIGHTS = { M: 0.4, S: 0.35, V: 0.25 } as const // weights
export const STATUS_SCORE: Record<Status, number> = { green: 100, yellow: 60, red: 20 } // score_bands
export const BAND_READY_MIN = 75 // score_bands
export const BAND_LIMITED_MIN = 50 // score_bands

// --- PVT (SPEC M2, 4.1) ---
export const PVT_LAPSE_MS = 500 // pvt_lapse
export const PVT_BASELINE_COUNT = 3 // pvt_baseline
export const PVT_DURATION_S = { full: 60, demo: 15 } as const // pvt_protocol
export const PVT_DELAY_MS = { min: 2000, max: 10000 } as const // pvt_protocol

// --- Mission (SPEC 4.1, 4.7) ---
export const LANDING_DAY_DEFAULT = 210 // transit
export const LANDING_DAY_RANGE = { min: 180, max: 270 } as const // transit
export const COMM_DELAY_DEFAULT_MIN = 12 // comm_delay
export const COMM_DELAY_RANGE_MIN = { min: 3, max: 22 } as const // comm_delay

// --- Vital thresholds (SPEC 6.1), general adult references ---
// Written ranges are inclusive. Between two written ranges there is no gap:
// a value belongs to the band whose written edge it has not yet passed (e.g. temp 37.25 is green).
export const VITALS = {
  hr: { greenMin: 60, greenMax: 100, yellowMin: 50, yellowMax: 110 }, // vitals_ranges
  systolic: { redBelow: 90, yellowFrom: 130, redFrom: 140 }, // vitals_ranges
  glucose: { redBelow: 70, yellowFrom: 100, redFrom: 126 }, // vitals_ranges
  temp: { redBelow: 35.5, greenFrom: 36.1, yellowFrom: 37.3, redFrom: 38.0 }, // vitals_ranges
  sleep: { yellowFrom: 6, greenFrom: 7 }, // vitals_ranges
  mood: { yellowFrom: 3, greenFrom: 4 }, // vitals_ranges
} as const

// --- Input validation (SPEC 6.3) ---
export const VALIDATION_RANGES = { // input_validation
  heartRate: { min: 30, max: 220, unit: 'bpm', label: 'Heart rate' },
  systolic: { min: 60, max: 250, unit: 'mmHg', label: 'Systolic BP' },
  diastolic: { min: 30, max: 150, unit: 'mmHg', label: 'Diastolic BP' },
  glucose: { min: 30, max: 500, unit: 'mg/dL', label: 'Glucose' },
  tempC: { min: 33, max: 42, unit: 'C', label: 'Temperature' },
  sleepHours: { min: 0, max: 16, unit: 'h', label: 'Sleep' },
  mood: { min: 1, max: 5, unit: '', label: 'Mood' },
  exerciseMin: { min: 0, max: 300, unit: 'min', label: 'Exercise' },
} as const

// --- Escalation (SPEC 4.6) ---
export const ESCALATION = { // escalation_rules
  tempFrom: 38.5,
  systolicFrom: 160,
  glucoseBelow: 54,
  yellowStreakDays: 3,
  redStreakDays: 2,
  remeasureHours: 4,
} as const

export const INDICATOR_LABEL: Record<IndicatorKey, string> = {
  hr: 'heart rate',
  bp: 'blood pressure',
  glucose: 'glucose',
  temp: 'temperature',
  sleep: 'sleep',
  mood: 'mood',
}

/** Fixed order for iterating indicators (V average, drivers, escalation). */
export const INDICATORS: readonly IndicatorKey[] = ['hr', 'bp', 'glucose', 'temp', 'sleep', 'mood']
