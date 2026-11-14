import { useMemo, useState, type FormEvent } from 'react'
import { VALIDATION_RANGES } from '../engine/constants'
import { validateVitals, type VitalField, type VitalsErrors, type VitalsInput } from '../engine/thresholds'
import type { DailyLog, Source } from '../engine/types'
import { wearableReading } from '../engine/wearable'
import type { ScreenProps } from '../components/Nav'
import { SimChip } from '../components/SimChip'
import { useActiveAstronaut, useMission } from '../store/mission'

const NUMBER_FIELDS: { field: Exclude<VitalField, 'mood'>; step: number }[] = [
  { field: 'heartRate', step: 1 },
  { field: 'systolic', step: 1 },
  { field: 'diastolic', step: 1 },
  { field: 'glucose', step: 1 },
  { field: 'tempC', step: 0.1 },
  { field: 'sleepHours', step: 0.1 },
  { field: 'exerciseMin', step: 5 },
]
const FIELD_ORDER = [...NUMBER_FIELDS.map((f) => f.field), 'mood'] as VitalField[]
const MOODS = [1, 2, 3, 4, 5] as const

type Draft = Record<VitalField, string>
type SensorField = 'heartRate' | 'tempC'
type Sources = Record<SensorField, Source>

const isSensor = (f: VitalField): f is SensorField => f === 'heartRate' || f === 'tempC'

const toDraft = (log: DailyLog | undefined): Draft =>
  Object.fromEntries(FIELD_ORDER.map((f) => [f, log ? String(log[f]) : ''])) as Draft

/** Empty input is "missing", not zero. */
const parse = (draft: Draft): VitalsInput =>
  Object.fromEntries(FIELD_ORDER.map((f) => [f, draft[f].trim() === '' ? Number.NaN : Number(draft[f])])) as VitalsInput

/** SPEC 9.2 / M1. Prefilled with today's values so a single change is quick. */
export function CheckIn({ onNavigate }: ScreenProps) {
  const currentDay = useMission((s) => s.mission.currentDay)
  const addLog = useMission((s) => s.addLog)
  const astronaut = useActiveAstronaut()
  const today = astronaut.logs.find((l) => l.day === currentDay)
  const [draft, setDraft] = useState<Draft>(() => toDraft(today ?? astronaut.logs.at(-1)))
  // Only today's own entry carries its sources over; anything else starts as manual.
  const [sources, setSources] = useState<Sources>(() => ({
    heartRate: today?.hrSource ?? 'manual',
    tempC: today?.tempSource ?? 'manual',
  }))
  const [errors, setErrors] = useState<VitalsErrors | null>(null)
  const reading = useMemo(() => wearableReading(astronaut.logs, currentDay, astronaut.id), [astronaut.logs, astronaut.id, currentDay])
  const wearableOn = sources.heartRate === 'wearable-sim' || sources.tempC === 'wearable-sim'

  const applyDraft = (next: Draft) => {
    setDraft(next)
    if (errors) setErrors(validateVitals(parse(next)))
  }

  const update = (field: VitalField, value: string) => {
    // Typing over a simulated value makes it a manual entry.
    if (isSensor(field)) setSources((s) => ({ ...s, [field]: 'manual' }))
    applyDraft({ ...draft, [field]: value })
  }

  const toggleWearable = () => {
    if (wearableOn || !reading) return setSources({ heartRate: 'manual', tempC: 'manual' })
    setSources({ heartRate: 'wearable-sim', tempC: 'wearable-sim' })
    applyDraft({ ...draft, heartRate: String(reading.heartRate), tempC: String(reading.tempC) })
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const input = parse(draft)
    const found = validateVitals(input)
    setErrors(found)
    const firstInvalid = FIELD_ORDER.find((f) => found[f])
    if (firstInvalid) {
      document.getElementById(`field-${firstInvalid}`)?.focus()
      return
    }
    addLog({
      ...input,
      day: currentDay,
      mood: input.mood as DailyLog['mood'],
      hrSource: sources.heartRate,
      tempSource: sources.tempC,
    })
    onNavigate('home')
  }

  return (
    <section className="mx-auto max-w-3xl p-6 md:p-10">
      <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Day {currentDay} · {astronaut.name}</p>
      <h1 className="mt-1 text-2xl font-semibold">Daily check-in</h1>

      <form onSubmit={submit} noValidate className="mt-8 flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-line bg-panel/80 p-4">
          <button
            type="button"
            aria-pressed={wearableOn}
            aria-describedby="wearable-hint"
            disabled={!reading}
            onClick={toggleWearable}
            className={`flex items-center gap-3 border px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent ${
              wearableOn ? 'border-accent bg-accent/10 text-accent' : 'border-edge text-dim hover:text-ink'
            }`}
          >
            <span aria-hidden className={`size-2 rounded-full ${wearableOn ? 'bg-accent' : 'bg-edge'}`} />
            Wearable (simulated)
          </button>
          <p id="wearable-hint" className="flex-1 text-sm text-dim">
            {reading
              ? 'Fills heart rate and temperature from a simulated wristband. You can still type your own values.'
              : 'Needs at least one earlier check-in to simulate a reading.'}
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {NUMBER_FIELDS.map(({ field, step }) => {
            const { label, unit, min, max } = VALIDATION_RANGES[field]
            const error = errors?.[field]
            return (
              <div key={field} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2">
                  <label htmlFor={`field-${field}`} className="text-sm">
                    {label} <span className="text-dim">({unit})</span>
                  </label>
                  {isSensor(field) &&
                    (sources[field] === 'manual' ? (
                      <span className="rounded-sm border border-line px-1.5 py-0.5 font-mono text-[10px] tracking-[0.15em] text-dim uppercase">
                        Manual
                      </span>
                    ) : (
                      <SimChip source={sources[field]} />
                    ))}
                </div>
                <input
                  id={`field-${field}`}
                  type="number"
                  inputMode="decimal"
                  step={step}
                  min={min}
                  max={max}
                  value={draft[field]}
                  onChange={(e) => update(field, e.target.value)}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? `error-${field}` : undefined}
                  className={`border bg-space px-3 py-2.5 font-mono text-lg tabular-nums outline-none focus-visible:border-accent ${
                    error ? 'border-bad' : 'border-edge'
                  }`}
                />
                {error && (
                  <p id={`error-${field}`} className="text-sm text-bad">
                    {error}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="text-sm">
            Mood <span className="text-dim">(1 low, 5 high)</span>
          </legend>
          <div role="group" aria-label="Mood" aria-describedby={errors?.mood ? 'error-mood' : undefined} className="flex gap-2">
            {MOODS.map((m) => {
              const checked = draft.mood === String(m)
              return (
                <button
                  key={m}
                  id={m === 1 ? 'field-mood' : undefined}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => update('mood', String(m))}
                  className={`size-12 border font-mono text-lg tabular-nums transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
                    checked ? 'border-accent bg-accent/10 text-accent' : 'border-edge text-dim hover:text-ink'
                  }`}
                >
                  {m}
                </button>
              )
            })}
          </div>
          {errors?.mood && (
            <p id="error-mood" className="text-sm text-bad">
              {errors.mood}
            </p>
          )}
        </fieldset>

        <button
          type="submit"
          className="self-start border border-accent bg-accent/10 px-6 py-3 font-mono text-sm font-semibold tracking-[0.2em] text-accent uppercase transition-colors hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent"
        >
          Save check-in
        </button>
      </form>
    </section>
  )
}
