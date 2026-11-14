import { useMemo } from 'react'
import { ACTION_LEVEL_CARDS } from '../data/action-cards'
import { crewSummary } from '../engine/crew'
import type { ScreenProps } from '../components/Nav'
import { SourceBadge } from '../components/SourceBadge'
import { BAND_LABEL, BAND_TONE, LEVEL_TONE, StatusChip } from '../components/StatusChip'
import { useMission } from '../store/mission'

/** SPEC C1: crew view for the Crew Medical Officer. Tap a row to open that astronaut. */
export function Crew({ onNavigate }: ScreenProps) {
  const mission = useMission((s) => s.mission)
  const setActive = useMission((s) => s.setActive)
  const rows = useMemo(() => crewSummary(mission), [mission])

  const open = (id: string) => {
    setActive(id)
    onNavigate('home')
  }

  return (
    <section className="mx-auto flex max-w-5xl flex-col gap-6 p-6 md:p-10">
      <header>
        <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Day {mission.currentDay} · Crew Medical Officer</p>
        <div className="mt-1 flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Crew</h1>
          <SourceBadge title="Crew readiness and escalation" ids={['score_bands', 'escalation_rules']} />
        </div>
      </header>

      <div className="overflow-x-auto border border-line bg-panel/80">
        <table className="w-full min-w-[40rem] text-left text-sm">
          <caption className="sr-only">Landing readiness and escalation level for each astronaut. Select a name to open that astronaut.</caption>
          <thead className="border-b border-line font-mono text-[11px] tracking-[0.2em] text-dim uppercase">
            <tr>
              <th scope="col" className="px-5 py-3 font-normal">Astronaut</th>
              <th scope="col" className="px-5 py-3 text-right font-normal">R</th>
              <th scope="col" className="px-5 py-3 font-normal">Band</th>
              <th scope="col" className="px-5 py-3 font-normal">Escalation</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const viewing = r.id === mission.activeId
              return (
                <tr
                  key={r.id}
                  onClick={() => open(r.id)}
                  className={`cursor-pointer border-b border-line last:border-b-0 transition-colors hover:bg-line/60 ${viewing ? 'bg-line/40' : ''}`}
                >
                  <th scope="row" className="px-5 py-4 font-normal">
                    {/* The real control for keyboard and screen readers; the row click is a larger target. */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        open(r.id)
                      }}
                      aria-current={viewing ? 'true' : undefined}
                      className="text-left focus-visible:outline-2 focus-visible:outline-accent"
                    >
                      <span className="block font-semibold text-ink">{r.name}</span>
                      <span className="block text-xs text-dim">
                        {r.role}
                        {viewing && <span className="text-accent"> · Viewing</span>}
                      </span>
                    </button>
                  </th>
                  <td className="px-5 py-4 text-right font-mono text-2xl font-semibold tabular-nums">
                    {r.R === null ? <span className="text-sm font-normal text-dim">No check-in</span> : Math.round(r.R)}
                  </td>
                  <td className="px-5 py-4">{r.band && <StatusChip tone={BAND_TONE[r.band]}>{BAND_LABEL[r.band]}</StatusChip>}</td>
                  <td className="px-5 py-4">
                    <StatusChip tone={LEVEL_TONE[r.level]}>
                      Level {r.level} · {ACTION_LEVEL_CARDS[r.level].title}
                    </StatusChip>
                    <p className="mt-1.5 text-xs text-dim">{r.rule}</p>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
