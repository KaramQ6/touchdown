import { useMemo, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts'
import { INDICATORS, VALIDATION_RANGES } from '../engine/constants'
import { INDICATOR_FIELD, indicatorBands, indicatorSource, indicatorValue, statusOf, type StatusBand } from '../engine/thresholds'
import type { IndicatorKey, Status } from '../engine/types'
import type { ScreenProps } from '../components/Nav'
import { SimChip } from '../components/SimChip'
import { SourceBadge } from '../components/SourceBadge'
import { StatusChip } from '../components/StatusChip'
import { useActiveAstronaut, useMission } from '../store/mission'

const ZONE_FILL: Record<Status, string> = { green: 'var(--color-ok)', yellow: 'var(--color-warn)', red: 'var(--color-bad)' }
const STATUS_TEXT: Record<Status, string> = { green: 'In range', yellow: 'Watch', red: 'Out of range' }

const meta = (key: IndicatorKey) => VALIDATION_RANGES[INDICATOR_FIELD[key]]
const fmt = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1))

const NICE_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]
const MAX_TICKS = 7

/**
 * Y axis: the data, widened to show the whole green zone when it is bounded on both sides,
 * then rounded out to a clean step so ticks land on round numbers. Mood is a fixed 1-5 scale.
 */
function yAxis(key: IndicatorKey, values: number[], bands: StatusBand[]): { domain: [number, number]; ticks: number[] } {
  const { min, max } = meta(key)
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  let step = 1
  if (key === 'mood') {
    ;[lo, hi] = [min, max]
  } else {
    const green = bands.find((b) => b.status === 'green')
    if (green && green.from > min && green.to < max) {
      lo = Math.min(lo, green.from)
      hi = Math.max(hi, green.to)
    }
    step = NICE_STEPS.find((s) => (hi - lo) / s <= MAX_TICKS - 2) ?? NICE_STEPS.at(-1)!
    lo = Math.max(min, Math.floor(lo / step) * step - (lo % step === 0 ? step : 0))
    hi = Math.min(max, Math.ceil(hi / step) * step + (hi % step === 0 ? step : 0))
  }
  const ticks: number[] = []
  for (let t = lo; t <= hi + step / 1000; t += step) ticks.push(Math.round(t * 100) / 100)
  return { domain: [lo, hi], ticks }
}

/** SPEC M7 / 9.6 */
export function Trends(_: ScreenProps) {
  const currentDay = useMission((s) => s.mission.currentDay)
  const astronaut = useActiveAstronaut()
  const [key, setKey] = useState<IndicatorKey>('hr')

  const data = useMemo(
    () => astronaut.logs.map((l) => ({ day: l.day, value: indicatorValue(key, l), source: indicatorSource(key, l) })),
    [astronaut.logs, key],
  )
  const bands = useMemo(() => indicatorBands(key), [key])
  const y = useMemo(() => yAxis(key, data.map((d) => d.value), bands), [key, data, bands])
  const { label, unit } = meta(key)
  const latest = data.at(-1)

  const ChartTooltip = ({ active, payload, label: day }: TooltipContentProps) => {
    if (!active || !payload?.length) return null
    const v = Number(payload[0].value)
    const simulated = (payload[0].payload as (typeof data)[number]).source === 'wearable-sim'
    return (
      <div className="border border-line bg-panel px-3 py-2 font-mono text-xs">
        <p className="text-dim">Day {day}</p>
        <p className="text-ink">
          {fmt(v)} {unit} · {STATUS_TEXT[statusOf(key, v)]}
        </p>
        {simulated && <p className="text-dim uppercase">Simulated</p>}
      </div>
    )
  }

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">
            {astronaut.name} · {data.length} logged days
          </p>
          <h1 className="mt-1 text-2xl font-semibold">Trends</h1>
        </div>
        <div role="group" aria-label="Indicator" className="flex flex-wrap border border-edge">
          {INDICATORS.map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={key === k}
              onClick={() => setKey(k)}
              className={`px-3 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                key === k ? 'bg-accent/10 text-accent' : 'text-dim hover:text-ink'
              }`}
            >
              {meta(k).label}
            </button>
          ))}
        </div>
      </header>

      <div className="border border-line bg-panel/80 p-4 pt-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 px-2">
          <div className="flex items-baseline gap-3">
            <h2 className="font-semibold">
              {label} <span className="font-normal text-dim">({unit || 'scale 1-5'})</span>
            </h2>
            {latest && (
              <span className="font-mono text-sm text-dim">
                Day {latest.day}: <span className="text-ink tabular-nums">{fmt(latest.value)}</span>
              </span>
            )}
            {latest && <StatusChip tone={statusOf(key, latest.value)}>{STATUS_TEXT[statusOf(key, latest.value)]}</StatusChip>}
            {latest && <SimChip source={latest.source} />}
          </div>
          <SourceBadge title={`${label} ranges`} ids={['vitals_ranges']} />
        </div>

        <div className="h-80" aria-hidden>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 4, right: 16, bottom: 4, left: -4 }}>
              {bands.map((b) => (
                <ReferenceArea
                  key={`${b.from}-${b.to}`}
                  y1={b.from}
                  y2={b.to}
                  fill={ZONE_FILL[b.status]}
                  fillOpacity={0.08}
                  strokeOpacity={0}
                  ifOverflow="hidden"
                />
              ))}
              <CartesianGrid vertical={false} stroke="var(--color-line)" strokeOpacity={0.6} />
              <XAxis
                dataKey="day"
                type="number"
                domain={[data[0]?.day ?? 0, currentDay]}
                tickCount={9}
                tick={{ fill: 'var(--color-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={{ stroke: 'var(--color-line)' }}
              />
              <YAxis
                domain={y.domain}
                ticks={y.ticks}
                allowDataOverflow
                tickFormatter={fmt}
                tick={{ fill: 'var(--color-dim)', fontSize: 11, fontFamily: 'var(--font-mono)' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={ChartTooltip} cursor={{ stroke: 'var(--color-dim)', strokeDasharray: '3 3' }} />
              <Line
                type={key === 'mood' ? 'stepAfter' : 'monotone'}
                dataKey="value"
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
          {label} over {data.length} days, from {fmt(data[0]?.value ?? 0)} on day {data[0]?.day} to {fmt(latest?.value ?? 0)} on day{' '}
          {latest?.day}.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-4 px-2 text-xs text-dim">
          {(['green', 'yellow', 'red'] as const).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span aria-hidden className="size-2.5" style={{ background: ZONE_FILL[s], opacity: 0.6 }} />
              {STATUS_TEXT[s]}
            </span>
          ))}
          <span>General adult references, not spaceflight-specific.</span>
        </div>
      </div>
    </section>
  )
}
