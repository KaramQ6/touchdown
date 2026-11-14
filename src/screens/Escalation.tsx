import { useEffect, useMemo } from 'react'
import { ACTION_LEVEL_CARDS, INDICATOR_GUIDANCE, type ActionCard } from '../data/action-cards'
import { DEMO_FEVER_C } from '../data/seed-crew'
import { ESCALATION } from '../engine/constants'
import { evaluateEscalation } from '../engine/escalation'
import { indicatorSource } from '../engine/thresholds'
import type { Escalation as EscalationResult } from '../engine/types'
import { DelayTimer } from '../components/DelayTimer'
import { SimChip } from '../components/SimChip'
import { formatDuration, useNow } from '../components/Countdown'
import type { ScreenProps } from '../components/Nav'
import { SourceBadge } from '../components/SourceBadge'
import { LEVEL_TONE, TONE_TEXT } from '../components/StatusChip'
import { useActiveAstronaut, useMission } from '../store/mission'

const LEVELS = [0, 1, 2, 3] as const satisfies readonly EscalationResult['level'][]

function Card({ card, label }: { card: ActionCard; label: string }) {
  return (
    <article className="flex flex-col gap-3 border border-line bg-panel/80 p-6">
      <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">{label}</p>
      <h2 className="text-lg font-semibold">{card.title}</h2>
      <ol className="list-decimal space-y-1.5 pl-5 text-sm">
        {card.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
    </article>
  )
}

function RemeasureCard({ dueAt, onNavigate }: { dueAt: number; onNavigate: ScreenProps['onNavigate'] }) {
  const now = useNow()
  const left = (dueAt - now) / 1000
  const overdue = left <= 0

  return (
    <div className="flex flex-col gap-4 border border-warn/40 bg-warn/5 p-6">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Re-measure</p>
        <SourceBadge title="Re-measure window" ids={['escalation_rules']} />
      </div>
      <p className={overdue ? 'text-sm text-warn' : 'text-sm'}>
        {overdue ? 'Re-measure is overdue' : `Re-measure within ${ESCALATION.remeasureHours} h`}
      </p>
      <p className="font-mono text-6xl font-semibold tabular-nums" role="timer" aria-live="off">
        {formatDuration(left)}
      </p>
      <button
        type="button"
        onClick={() => onNavigate('checkin')}
        className="self-start border border-accent bg-accent/10 px-5 py-2.5 font-mono text-xs font-semibold tracking-[0.2em] text-accent uppercase hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent"
      >
        Re-measure now
      </button>
    </div>
  )
}

/** SPEC 4.6 / 4.7 / 9.7 */
export function Escalation({ onNavigate }: ScreenProps) {
  const { currentDay, commDelayMin } = useMission((s) => s.mission)
  const isDemo = useMission((s) => s.isDemo)
  const addLog = useMission((s) => s.addLog)
  const armRemeasure = useMission((s) => s.armRemeasure)
  const remeasureDueAt = useMission((s) => s.remeasureDueAt[s.mission.activeId])
  const astronaut = useActiveAstronaut()
  const escalation = useMemo(() => evaluateEscalation(astronaut.logs), [astronaut.logs])
  const today = astronaut.logs.find((l) => l.day === currentDay)
  const tone = TONE_TEXT[LEVEL_TONE[escalation.level]]

  useEffect(() => {
    if (escalation.level === 2) armRemeasure(Date.now())
  }, [escalation.level, armRemeasure])

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Day {currentDay} · {astronaut.name}</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Escalation</h1>
            <SourceBadge title="Escalation rules" ids={['escalation_rules', 'vitals_ranges']} />
          </div>
        </div>
        {isDemo && today && (
          <button
            type="button"
            onClick={() => addLog({ ...today, tempC: DEMO_FEVER_C, tempSource: 'manual' })}
            className="border border-dashed border-warn/60 px-4 py-2 font-mono text-xs tracking-[0.15em] text-warn uppercase hover:bg-warn/10 focus-visible:outline-2 focus-visible:outline-accent"
          >
            Demo: fever {DEMO_FEVER_C} C
          </button>
        )}
      </header>

      <ol className="grid grid-cols-4 gap-2" aria-label="Escalation levels">
        {LEVELS.map((l) => {
          const active = l === escalation.level
          return (
            <li
              key={l}
              aria-current={active ? 'step' : undefined}
              className={`border p-3 ${active ? `border-current ${TONE_TEXT[LEVEL_TONE[l]]}` : 'border-line text-dim'}`}
            >
              <p className="font-mono text-2xl font-semibold tabular-nums">{l}</p>
              <p className="text-xs">{ACTION_LEVEL_CARDS[l].title}</p>
            </li>
          )
        })}
      </ol>

      <div className="border border-line bg-panel/80 p-6">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Rule that fired</p>
          {today && escalation.indicator && <SimChip source={indicatorSource(escalation.indicator, today)} />}
        </div>
        <p className={`mt-2 text-xl font-semibold ${tone}`}>{escalation.rule}</p>
        <p className="mt-1 text-sm">{escalation.action}</p>
      </div>

      <div className={`grid gap-4 ${escalation.level >= 2 ? 'lg:grid-cols-[1fr_1fr_minmax(0,22rem)]' : 'md:grid-cols-2'}`}>
        <Card card={ACTION_LEVEL_CARDS[escalation.level]} label={`Level ${escalation.level} action`} />
        {escalation.indicator && <Card card={INDICATOR_GUIDANCE[escalation.indicator]} label="Indicator guidance" />}
        {escalation.level === 2 && remeasureDueAt !== undefined && (
          <RemeasureCard dueAt={remeasureDueAt} onNavigate={onNavigate} />
        )}
        {escalation.level === 3 && <DelayTimer oneWayMin={commDelayMin} />}
      </div>
    </section>
  )
}
