import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState, type KeyboardEvent } from 'react'
import { BODY_REGIONS, regionDetail, regionStatus, type BodyRegion, type BodyRegionId } from '../data/body-regions'
import { computeReadiness } from '../engine/score'
import { indicatorSource } from '../engine/thresholds'
import type { Status } from '../engine/types'
import type { ScreenProps } from '../components/Nav'
import { SimChip } from '../components/SimChip'
import { SourceBadge } from '../components/SourceBadge'
import { StatusChip } from '../components/StatusChip'
import { useActiveAstronaut, useMission } from '../store/mission'

const STATUS_LABEL: Record<Status, string> = { green: 'On track', yellow: 'Watch', red: 'Act' }
const STATUS_FILL: Record<Status, string> = { green: 'var(--color-ok)', yellow: 'var(--color-warn)', red: 'var(--color-bad)' }
const SEVERITY: Record<Status, number> = { green: 0, yellow: 1, red: 2 }

// Original silhouette, drawn from simple shapes (no external art). viewBox 0 0 200 480.
const BODY = [
  'M92 72h16v16H92z', // neck
  'M60 90Q100 80 140 90L146 200Q100 214 54 200Z', // torso
  'M62 94L50 98L32 238L44 242L64 144Z', // left arm
  'M138 94L150 98L168 238L156 242L136 144Z', // right arm
  'M58 470h32v8H58zM110 470h32v8h-32z', // feet
]

/** Ears sit on top of the head, so the head is drawn first. */
const DRAW_ORDER: BodyRegionId[] = ['bones', 'calves', 'mind', 'balance', 'heart']

/** Tappable region shapes. */
const REGION_SHAPES: Record<BodyRegionId, { d?: string; circles?: { cx: number; cy: number; r: number }[] }> = {
  mind: { circles: [{ cx: 100, cy: 46, r: 26 }] },
  balance: { circles: [{ cx: 72, cy: 50, r: 7 }, { cx: 128, cy: 50, r: 7 }] },
  heart: { d: 'M112 124c-4-8-17-6-15 5c2 9 15 15 15 20c0-5 13-11 15-20c2-11-11-13-15-5Z' },
  bones: { d: 'M56 200Q100 216 144 200L146 250L138 352H106L100 262L94 352H62L54 250Z' },
  calves: { d: 'M62 356H94L90 466H68ZM106 356H138L132 466H110Z' },
}

function RegionShape({ id, status, selected }: { id: BodyRegionId; status: Status; selected: boolean }) {
  const shape = REGION_SHAPES[id]
  const common = {
    fill: STATUS_FILL[status],
    fillOpacity: selected ? 0.55 : 0.3,
    stroke: selected ? 'var(--color-ink)' : STATUS_FILL[status],
    strokeWidth: selected ? 2 : 1.25,
    className: 'transition-[fill-opacity,stroke] duration-200',
  }
  return (
    <>
      {shape.d && <path d={shape.d} {...common} />}
      {shape.circles?.map((c) => <circle key={c.cx} {...c} {...common} />)}
      {/* Generous invisible hit area for the small ear targets. */}
      {id === 'balance' && shape.circles?.map((c) => <circle key={`hit-${c.cx}`} cx={c.cx} cy={c.cy} r={16} fill="transparent" />)}
    </>
  )
}

/** SPEC M6 / 9.5 / 10 */
export function BodyMap(_: ScreenProps) {
  const currentDay = useMission((s) => s.mission.currentDay)
  const astronaut = useActiveAstronaut()
  const readiness = useMemo(() => computeReadiness(astronaut.logs, currentDay), [astronaut.logs, currentDay])
  const statuses = useMemo(
    () => (readiness ? Object.fromEntries(BODY_REGIONS.map((r) => [r.id, regionStatus(r, readiness)])) : null) as
      | Record<BodyRegionId, Status>
      | null,
    [readiness],
  )
  // Default to the region that needs the most attention.
  const worst = useMemo(
    () => (statuses ? BODY_REGIONS.reduce((a, b) => (SEVERITY[statuses[b.id]] > SEVERITY[statuses[a.id]] ? b : a)).id : 'bones'),
    [statuses],
  )
  const [picked, setPicked] = useState<BodyRegionId | null>(null)

  if (!readiness || !statuses) return <p className="p-10 text-dim">No check-in yet.</p>

  const selectedId = picked ?? worst
  const selected = BODY_REGIONS.find((r) => r.id === selectedId) as BodyRegion
  const today = astronaut.logs.find((l) => l.day === currentDay)
  const simulated = !!today && !!selected.indicators?.some((k) => indicatorSource(k, today) === 'wearable-sim')
  const onKey = (id: BodyRegionId) => (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      setPicked(id)
    }
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
      <header>
        <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Day {currentDay} · {astronaut.name}</p>
        <h1 className="mt-1 text-2xl font-semibold">Body map</h1>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
        <div className="flex flex-col items-center gap-4 border border-line bg-panel/80 p-6">
          <svg viewBox="0 0 200 480" className="h-[28rem] w-auto" role="group" aria-label="Body regions">
            <g fill="var(--color-line)" stroke="var(--color-dim)" strokeOpacity={0.35} strokeWidth={1}>
              {BODY.map((d) => (
                <path key={d} d={d} />
              ))}
            </g>
            {DRAW_ORDER.map((id) => BODY_REGIONS.find((r) => r.id === id) as BodyRegion).map((r) => (
              <g
                key={r.id}
                role="button"
                tabIndex={0}
                aria-label={`${r.label}: ${STATUS_LABEL[statuses[r.id]]}`}
                aria-pressed={selectedId === r.id}
                onClick={() => setPicked(r.id)}
                onKeyDown={onKey(r.id)}
                className="cursor-pointer outline-none [&:focus-visible>*]:stroke-accent"
              >
                <RegionShape id={r.id} status={statuses[r.id]} selected={selectedId === r.id} />
              </g>
            ))}
          </svg>
          <ul className="flex w-full flex-wrap justify-center gap-2">
            {BODY_REGIONS.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setPicked(r.id)}
                  aria-pressed={selectedId === r.id}
                  className={`flex items-center gap-2 border px-2.5 py-1 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    selectedId === r.id ? 'border-ink text-ink' : 'border-edge text-dim hover:text-ink'
                  }`}
                >
                  <span aria-hidden className="size-2 rounded-full" style={{ background: STATUS_FILL[statuses[r.id]] }} />
                  {r.label}
                  <span className="text-dim">· {STATUS_LABEL[statuses[r.id]]}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <AnimatePresence mode="wait">
          <motion.article
            key={selected.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-5 border border-line bg-panel/80 p-8"
            aria-live="polite"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold">{selected.label}</h2>
              <div className="flex items-center gap-2">
                <StatusChip tone={statuses[selected.id]}>{STATUS_LABEL[statuses[selected.id]]}</StatusChip>
                <SourceBadge title={selected.label} ids={selected.sourceIds} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="font-mono text-lg">{regionDetail(selected, { logs: astronaut.logs, day: currentDay, readiness })}</p>
              {simulated && <SimChip source="wearable-sim" />}
            </div>
            <p className="text-sm text-dim">
              Feeds sub-score <span className="text-ink">{selected.axis}</span>: {selected.driver}
            </p>
            <p className="leading-relaxed">{selected.explanation}</p>
            <div className="border-t border-line pt-4">
              <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">NASA risk</p>
              <p className="mt-1">{selected.riskName}</p>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </section>
  )
}
