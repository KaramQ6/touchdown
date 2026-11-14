import { useMemo } from 'react'
import { ACTION_LEVEL_CARDS } from '../data/action-cards'
import { evaluateEscalation } from '../engine/escalation'
import { computeReadiness } from '../engine/score'
import { AxisCard } from '../components/AxisCard'
import type { ScreenProps } from '../components/Nav'
import { ScoreRing } from '../components/ScoreRing'
import { SourceBadge } from '../components/SourceBadge'
import { BAND_LABEL, BAND_TONE, LEVEL_TONE, StatusChip, TONE_TEXT } from '../components/StatusChip'
import { TodayAction } from '../components/TodayAction'
import { useActiveAstronaut, useMission } from '../store/mission'
import type { Axis } from '../engine/types'

const AXES: Record<Axis, { title: string; sourceIds: string[]; note?: string }> = {
  M: {
    title: 'Musculoskeletal',
    sourceIds: ['bone_loss', 'calf_strength', 'exercise_halves_loss', 'exercise_target', 'exercise_window', 'coefficients', 'calf_loss_cap'],
  },
  S: { title: 'Alertness', sourceIds: ['pvt_lapse', 'pvt_baseline', 'coefficients'] },
  V: {
    title: 'Vitals',
    sourceIds: ['vitals_ranges', 'score_bands'],
    note: 'General adult references, not spaceflight-specific.',
  },
}

/** SPEC 9.1 */
export function Home({ onNavigate }: ScreenProps) {
  const { currentDay, landingDay } = useMission((s) => s.mission)
  const astronaut = useActiveAstronaut()
  const readiness = useMemo(() => computeReadiness(astronaut.logs, currentDay), [astronaut.logs, currentDay])
  const escalation = useMemo(() => evaluateEscalation(astronaut.logs), [astronaut.logs])

  if (!readiness) {
    return (
      <section className="p-6 md:p-10">
        <p className="text-dim">No check-in yet.</p>
        <button type="button" onClick={() => onNavigate('checkin')} className="mt-4 border border-accent px-4 py-2 text-accent focus-visible:outline-2 focus-visible:outline-accent">
          Start check-in
        </button>
      </section>
    )
  }

  const levelTone = LEVEL_TONE[escalation.level]

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col items-center gap-10 border border-line bg-panel/80 p-8 lg:flex-row lg:items-center">
        <ScoreRing value={readiness.R} id={astronaut.id} />

        <div className="flex min-w-0 flex-1 flex-col gap-5">
          <div className="flex items-center gap-3">
            <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Landing readiness · R</p>
            <SourceBadge title="Landing readiness R" ids={['weights', 'score_bands', 'no_combined_model', 'landing_readiness_tests']} />
          </div>
          <div>
            <StatusChip tone={BAND_TONE[readiness.band]}>{BAND_LABEL[readiness.band]}</StatusChip>
            <h1 className="mt-3 max-w-xl text-2xl leading-snug font-semibold text-balance md:text-3xl">
              If we landed on Mars today, could {astronaut.name.split(' ')[0]} walk out and work alone?
            </h1>
          </div>

          <div className="flex items-center gap-3 font-mono text-sm">
            <span>
              Day <span className="text-ink tabular-nums">{currentDay}</span> of <span className="tabular-nums">{landingDay}</span>
              <span className="text-dim"> · </span>
              <span className="tabular-nums">{landingDay - currentDay}</span> days to landing
            </span>
            <SourceBadge title="Mission timeline" ids={['transit', 'hrp_hazards']} />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('escalation')}
              className="flex min-w-0 items-center gap-3 border border-edge px-4 py-2 text-left transition-colors hover:border-dim focus-visible:outline-2 focus-visible:outline-accent"
            >
              <span className={`font-mono text-xs font-semibold tracking-[0.15em] uppercase ${TONE_TEXT[levelTone]}`}>
                Level {escalation.level} · {ACTION_LEVEL_CARDS[escalation.level].title}
              </span>
              <span className="truncate text-sm text-dim">{escalation.rule}</span>
            </button>
            <SourceBadge title="Escalation rules" ids={['escalation_rules', 'vitals_ranges']} />
          </div>
        </div>
      </div>

      <TodayAction onNavigate={onNavigate} />

      <div className="grid gap-4 lg:grid-cols-3">
        {readiness.drivers.map(({ axis, text }) => (
          <AxisCard key={axis} axis={axis} value={readiness[axis]} driver={text} {...AXES[axis]} />
        ))}
      </div>
    </section>
  )
}
