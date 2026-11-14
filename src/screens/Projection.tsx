import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useId, useMemo } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { BAND_LIMITED_MIN, BAND_READY_MIN } from '../engine/constants'
import { projectLanding } from '../engine/projection'
import { recentExerciseMin } from '../engine/score'
import type { ScreenProps } from '../components/Nav'
import { SourceBadge } from '../components/SourceBadge'
import { BAND_LABEL, BAND_TONE, StatusChip } from '../components/StatusChip'
import { useActiveAstronaut, useMission, type WhatIf } from '../store/mission'

// SPEC M4 slider ranges.
const EXERCISE = { min: 0, max: 180, step: 5 }
const SLEEP = { min: 4, max: 9, step: 0.5 }

const clampTo = (x: number, r: { min: number; max: number }) => Math.min(r.max, Math.max(r.min, x))

const BANDS = [
  { y1: 0, y2: BAND_LIMITED_MIN, fill: 'var(--color-bad)', label: 'Not Ready' },
  { y1: BAND_LIMITED_MIN, y2: BAND_READY_MIN, fill: 'var(--color-warn)', label: 'Limited' },
  { y1: BAND_READY_MIN, y2: 100, fill: 'var(--color-ok)', label: 'Ready' },
]

function ChartTooltip({ active, payload, label }: TooltipContentProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="border border-line bg-panel px-3 py-2 font-mono text-xs">
      <p className="text-dim">Day {label}</p>
      <p className="text-ink">R {Number(payload[0].value).toFixed(1)}</p>
    </div>
  )
}

interface SliderProps {
  label: string
  value: number
  range: { min: number; max: number; step: number }
  format: (v: number) => string
  onChange: (v: number) => void
}

function Slider({ label, value, range, format, onChange }: SliderProps) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <label htmlFor={id} className="text-sm">
          {label}
        </label>
        <span className="font-mono text-lg tabular-nums">{format(value)}</span>
      </div>
      <input
        id={id}
        type="range"
        {...range}
        value={value}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-2 w-full cursor-pointer accent-accent"
      />
      <div className="flex justify-between font-mono text-[11px] text-dim tabular-nums">
        <span>{format(range.min)}</span>
        <span>{format(range.max)}</span>
      </div>
    </div>
  )
}

/** SPEC 4.3 / 9.4: R from today to landing day, with what-if sliders. */
export function Projection(_: ScreenProps) {
  const { currentDay, landingDay } = useMission((s) => s.mission)
  const whatIf = useMission((s) => s.whatIf)
  const setWhatIf = useMission((s) => s.setWhatIf)
  const astronaut = useActiveAstronaut()
  const reduce = useReducedMotion()

  const projection = useMemo(
    () => projectLanding(astronaut.logs, { currentDay, landingDay, whatIf }),
    [astronaut.logs, currentDay, landingDay, whatIf],
  )
  const current = useMemo(
    () => ({ exerciseMin: recentExerciseMin(astronaut.logs), sleepHours: astronaut.logs.at(-1)?.sleepHours ?? 0 }),
    [astronaut.logs],
  )

  if (!projection) return <p className="p-10 text-dim">No check-in yet.</p>

  const exercise = whatIf.exerciseMin ?? clampTo(Math.round(current.exerciseMin / EXERCISE.step) * EXERCISE.step, EXERCISE)
  const sleep = whatIf.sleepHours ?? clampTo(current.sleepHours, SLEEP)
  const set = (patch: WhatIf) => setWhatIf({ ...whatIf, ...patch })
  const first = projection.curve[0]

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Landing projection · {astronaut.name}</p>
          <h1 className="mt-1 text-2xl font-semibold">Readiness on landing day {landingDay}</h1>
        </div>

        <div className="flex items-center gap-5 border border-line bg-panel/80 px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">R land</p>
              <SourceBadge
                title="Projected readiness on landing day"
                ids={['weights', 'coefficients', 'exercise_halves_loss', 'exercise_target', 'transit', 'partial_gravity_gap']}
              />
            </div>
            <p className="font-mono text-5xl font-semibold tabular-nums" aria-live="polite">
              {projection.rLand.toFixed(1)}
            </p>
          </div>
          <div className="relative grid h-8 min-w-28 place-items-center">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={projection.band}
                initial={reduce ? false : { opacity: 0, y: 14, scale: 0.85 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -14, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 420, damping: 26 }}
              >
                <StatusChip tone={BAND_TONE[projection.band]}>{BAND_LABEL[projection.band]}</StatusChip>
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </header>

      <div className="border border-line bg-panel/80 p-4 pt-6">
        <div className="h-80" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projection.curve} margin={{ top: 4, right: 16, bottom: 4, left: -8 }}>
              {BANDS.map((b) => (
                <ReferenceArea
                  key={b.label}
                  y1={b.y1}
                  y2={b.y2}
                  fill={b.fill}
                  fillOpacity={0.07}
                  strokeOpacity={0}
                  label={{ value: b.label, position: 'insideTopLeft', fill: 'var(--color-dim)', fontSize: 11 }}
                />
              ))}
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeOpacity={0.6} />
              <ReferenceLine y={BAND_LIMITED_MIN} stroke="var(--color-warn)" strokeOpacity={0.5} strokeDasharray="4 4" />
              <ReferenceLine y={BAND_READY_MIN} stroke="var(--color-ok)" strokeOpacity={0.5} strokeDasharray="4 4" />
              <XAxis
                dataKey="day"
                type="number"
                domain={[currentDay, landingDay]}
                tickCount={8}
                tick={{ fill: 'var(--color-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-line)' }}
                label={{ value: 'Mission day', position: 'insideBottomRight', offset: -2, fill: 'var(--color-dim)', fontSize: 11 }}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, BAND_LIMITED_MIN, BAND_READY_MIN, 100]}
                tick={{ fill: 'var(--color-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={ChartTooltip} cursor={{ stroke: 'var(--color-dim)', strokeDasharray: '3 3' }} />
              <Line
                type="monotone"
                dataKey="R"
                stroke="var(--color-accent)"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: 'var(--color-panel)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="sr-only">
          Projected R goes from {first.R.toFixed(1)} on day {first.day} to {projection.rLand.toFixed(1)} on day {landingDay},{' '}
          {BAND_LABEL[projection.band]}.
        </p>
        <p className="mt-3 px-2 text-sm text-dim">Exercise changes M only. S and V are held at today's values.</p>
      </div>

      <div className="grid gap-8 border border-line bg-panel/80 p-6 md:grid-cols-[1fr_1fr_auto] md:items-center">
        <Slider
          label="Exercise per day"
          value={exercise}
          range={EXERCISE}
          format={(v) => `${v} min`}
          onChange={(v) => set({ exerciseMin: v })}
        />
        <Slider label="Sleep" value={sleep} range={SLEEP} format={(v) => `${v.toFixed(1)} h`} onChange={(v) => set({ sleepHours: v })} />
        <button
          type="button"
          onClick={() => setWhatIf({})}
          disabled={Object.keys(whatIf).length === 0}
          className="border border-line px-4 py-2 font-mono text-xs tracking-[0.15em] text-dim uppercase transition-colors enabled:hover:text-ink disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-accent"
        >
          Reset
        </button>
      </div>
    </section>
  )
}
