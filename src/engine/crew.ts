import { evaluateEscalation } from './escalation'
import { computeReadiness } from './score'
import type { Band, Escalation, Mission } from './types'

export interface CrewRow {
  id: string
  name: string
  role: string
  /** Null when the astronaut has no check-in yet. */
  R: number | null
  band: Band | null
  level: Escalation['level']
  rule: string
}

/** SPEC C1: one row per astronaut, in crew order, from the same engine functions as the single-astronaut screens. */
export function crewSummary(mission: Mission): CrewRow[] {
  return mission.crew.map(({ id, name, role, logs }) => {
    const readiness = computeReadiness(logs, mission.currentDay)
    const { level, rule } = evaluateEscalation(logs)
    return { id, name, role, R: readiness?.R ?? null, band: readiness?.band ?? null, level, rule }
  })
}
