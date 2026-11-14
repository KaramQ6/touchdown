import { boneLoss, calfLoss, exerciseAdherence, scoreStatus } from '../engine/score'
import type { Axis, DailyLog, IndicatorKey, Readiness, Status } from '../engine/types'

export type BodyRegionId = 'bones' | 'calves' | 'balance' | 'heart' | 'mind'

export interface BodyRegion {
  id: BodyRegionId
  label: string
  axis: Axis
  /** What on that axis this region reflects. */
  driver: string
  /** Vitals behind this region, when the region maps to V. */
  indicators?: IndicatorKey[]
  /** Exact NASA HRP risk name(s). */
  riskName: string
  explanation: string
  sourceIds: string[]
}

/** SPEC section 10. */
export const BODY_REGIONS: readonly BodyRegion[] = [
  {
    id: 'bones',
    label: 'Bones',
    axis: 'M',
    driver: 'Bone density loss (B)',
    riskName: 'Risk of Spaceflight-Induced Bone Changes',
    explanation:
      'Without gravity, bones carry less load and slowly lose density. Daily resistance exercise slows the loss. Weaker bones raise the chance of a fracture after landing.',
    sourceIds: ['bone_loss', 'exercise_halves_loss', 'hrp_risks'],
  },
  {
    id: 'calves',
    label: 'Calf muscles',
    axis: 'M',
    driver: 'Calf strength loss (Mu)',
    riskName: 'Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness',
    explanation:
      'Calf muscles hold you upright and push you off the ground. In weightlessness they lose strength fast. Exercise keeps more of it for walking out on landing day.',
    sourceIds: ['calf_strength', 'exercise_halves_loss', 'hrp_risks'],
  },
  {
    id: 'balance',
    label: 'Inner ear / balance',
    axis: 'S',
    driver: 'Reaction time and lapses',
    riskName: 'Risk of Altered Sensorimotor and Vestibular Function',
    explanation:
      'The inner ear adapts to weightlessness and has to readapt to gravity. Balance is one of the functions most affected after landing. The reaction test tracks alertness and response speed as a proxy.',
    sourceIds: ['balance_most_affected', 'pvt_lapse', 'hrp_risks'],
  },
  {
    id: 'heart',
    label: 'Heart',
    axis: 'V',
    driver: 'Heart rate and blood pressure',
    indicators: ['hr', 'bp'],
    riskName: 'Risk of Cardiovascular Adaptations',
    explanation:
      'Fluids shift toward the head in weightlessness and the heart adapts to a lighter workload. On landing, gravity pulls blood back down, which can make standing up harder.',
    sourceIds: ['vitals_ranges', 'hrp_risks'],
  },
  {
    id: 'mind',
    label: 'Mind',
    axis: 'V',
    driver: 'Sleep and mood',
    indicators: ['sleep', 'mood'],
    riskName: 'Risk of Inadequate Sleep and Irregular Schedules; Risk of Behavioral Changes and Psychiatric Disorders',
    explanation:
      'Isolation, confinement and shifting schedules wear down sleep and mood. Both affect focus and decisions, which matter most during landing and the first hours on the surface.',
    sourceIds: ['vitals_ranges', 'hrp_risks'],
  },
]

const SEVERITY: Record<Status, number> = { green: 0, yellow: 1, red: 2 }

/**
 * Region colour: V regions take the worst of their vitals; M and S regions read their sub-score
 * through the R bands (>= 75 green, 50-75 yellow, < 50 red). No thresholds beyond SPEC 4.2 / 6.1.
 */
export function regionStatus(region: BodyRegion, readiness: Readiness): Status {
  if (region.indicators) {
    return region.indicators.map((k) => readiness.indicatorStatus[k]).reduce((a, b) => (SEVERITY[b] > SEVERITY[a] ? b : a))
  }
  return scoreStatus(readiness[region.axis])
}

export interface RegionContext {
  logs: readonly DailyLog[]
  day: number
  readiness: Readiness
}

/** One line with the number behind the region's colour. */
export function regionDetail(region: BodyRegion, { logs, day, readiness }: RegionContext): string {
  const today = logs.at(-1)
  switch (region.id) {
    case 'bones':
      return `Bone density down ${boneLoss(day, exerciseAdherence(logs)).toFixed(1)}% (model)`
    case 'calves':
      return `Calf strength down ${calfLoss(day, exerciseAdherence(logs)).toFixed(1)}% (model)`
    case 'balance':
      return readiness.drivers.find((d) => d.axis === 'S')?.text ?? ''
    case 'heart':
      return today ? `HR ${today.heartRate} bpm, BP ${today.systolic}/${today.diastolic} mmHg` : ''
    case 'mind':
      return today ? `Sleep ${today.sleepHours} h, mood ${today.mood} of 5` : ''
  }
}
