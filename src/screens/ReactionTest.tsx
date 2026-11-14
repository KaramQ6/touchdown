import { AnimatePresence, motion } from 'framer-motion'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { PVT_DURATION_S, PVT_LAPSE_MS } from '../engine/constants'
import { nextStimulusDelayMs, summarizePvt, type PvtResponse } from '../engine/pvt'
import { computeReadiness } from '../engine/score'
import type { PvtResult } from '../engine/types'
import type { ScreenProps } from '../components/Nav'
import { SourceBadge } from '../components/SourceBadge'
import { useActiveAstronaut, useMission } from '../store/mission'

type Mode = keyof typeof PVT_DURATION_S
type Phase = 'idle' | 'wait' | 'stimulus' | 'done'
type Flash = { kind: 'rt'; ms: number } | { kind: 'early' } | null

interface Result {
  summary: PvtResult | null
  saved: boolean
}

/** SPEC M2 / 9.3: psychomotor vigilance test with false-start detection. */
export function ReactionTest({ onNavigate }: ScreenProps) {
  const currentDay = useMission((s) => s.mission.currentDay)
  const setTodayPvt = useMission((s) => s.setTodayPvt)
  const astronaut = useActiveAstronaut()

  const [mode, setMode] = useState<Mode>('full')
  const [phase, setPhaseState] = useState<Phase>('idle')
  const [secondsLeft, setSecondsLeft] = useState<number>(PVT_DURATION_S.full)
  const [flash, setFlash] = useState<Flash>(null)
  const [result, setResult] = useState<Result | null>(null)

  const responses = useRef<PvtResponse[]>([])
  const stimulusAt = useRef(0)
  const endAt = useRef(0)
  const timers = useRef<{ stimulus?: number; end?: number; tick?: number }>({})
  // Mirrors `phase` synchronously, so a tap between a timer firing and the next render reads the true phase.
  const phaseRef = useRef<Phase>('idle')
  const setPhase = useCallback((next: Phase) => {
    phaseRef.current = next
    if (next === 'stimulus') stimulusAt.current = performance.now()
    setPhaseState(next)
  }, [])

  const clearTimers = () => {
    window.clearTimeout(timers.current.stimulus)
    window.clearTimeout(timers.current.end)
    window.clearInterval(timers.current.tick)
  }
  useEffect(() => clearTimers, [])

  const scheduleStimulus = useCallback(() => {
    window.clearTimeout(timers.current.stimulus)
    setPhase('wait')
    timers.current.stimulus = window.setTimeout(() => setPhase('stimulus'), nextStimulusDelayMs(Math.random))
  }, [setPhase])

  // Stamped when the timer fires (setPhase), then refined to the painted frame.
  useLayoutEffect(() => {
    if (phase !== 'stimulus') return
    const frame = requestAnimationFrame(() => (stimulusAt.current = performance.now()))
    return () => cancelAnimationFrame(frame)
  }, [phase])

  const finish = useCallback(() => {
    clearTimers()
    const summary = summarizePvt(responses.current)
    setResult({ summary, saved: summary ? setTodayPvt(summary) : false })
    setPhase('done')
  }, [setTodayPvt, setPhase])

  const start = () => {
    responses.current = []
    setResult(null)
    setFlash(null)
    const durationMs = PVT_DURATION_S[mode] * 1000
    endAt.current = performance.now() + durationMs
    setSecondsLeft(PVT_DURATION_S[mode])
    timers.current.end = window.setTimeout(finish, durationMs)
    timers.current.tick = window.setInterval(
      () => setSecondsLeft(Math.max(0, Math.ceil((endAt.current - performance.now()) / 1000))),
      250,
    )
    scheduleStimulus()
  }

  const respond = useCallback(() => {
    const phase = phaseRef.current
    if (phase === 'wait') {
      responses.current.push({ kind: 'false-start' })
      setFlash({ kind: 'early' })
      scheduleStimulus()
    } else if (phase === 'stimulus') {
      const ms = Math.round(performance.now() - stimulusAt.current)
      responses.current.push({ kind: 'rt', ms })
      setFlash({ kind: 'rt', ms })
      scheduleStimulus()
    }
  }, [scheduleStimulus])

  useEffect(() => {
    if (phase !== 'wait' && phase !== 'stimulus') return
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      if (!e.repeat) respond()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [phase, respond])

  const readiness = useMemo(() => computeReadiness(astronaut.logs, currentDay), [astronaut.logs, currentDay])
  const running = phase === 'wait' || phase === 'stimulus'

  return (
    <section className="mx-auto flex max-w-4xl flex-col gap-6 p-6 md:p-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-dim uppercase">Day {currentDay} · {astronaut.name}</p>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-2xl font-semibold">Reaction test</h1>
            <SourceBadge title="Reaction test" ids={['pvt_protocol', 'pvt_lapse', 'pvt_baseline']} />
          </div>
        </div>
        <div role="group" aria-label="Test length" className="flex border border-edge">
          {(Object.keys(PVT_DURATION_S) as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              disabled={running}
              onClick={() => {
                setMode(m)
                setSecondsLeft(PVT_DURATION_S[m])
              }}
              className={`px-4 py-2 font-mono text-xs tracking-[0.15em] uppercase transition-colors disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-accent ${
                mode === m ? 'bg-accent/10 text-accent' : 'text-dim hover:text-ink'
              }`}
            >
              {m} · {PVT_DURATION_S[m]} s
            </button>
          ))}
        </div>
      </header>

      <div
        role="button"
        tabIndex={running ? 0 : -1}
        aria-label={phase === 'stimulus' ? 'Signal on. Tap now.' : 'Wait for the signal, then tap or press space.'}
        onPointerDown={running ? respond : undefined}
        onKeyDown={(e) => {
          // Space is handled by the window listener; Enter completes the keyboard contract of role="button".
          if (running && e.key === 'Enter' && !e.repeat) {
            e.preventDefault()
            respond()
          }
        }}
        className={`relative grid h-80 touch-none place-items-center overflow-hidden border select-none ${
          phase === 'stimulus' ? 'cursor-pointer border-accent bg-accent/15' : 'border-line bg-panel/80'
        } ${running ? 'cursor-pointer' : ''}`}
      >
        {phase === 'idle' && (
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="max-w-sm text-sm text-dim">
              When the signal appears, tap this area or press space as fast as you can. Tapping before it appears counts as a false start.
            </p>
            <button
              type="button"
              onClick={start}
              className="border border-accent bg-accent/10 px-6 py-3 font-mono text-sm font-semibold tracking-[0.2em] text-accent uppercase hover:bg-accent/20 focus-visible:outline-2 focus-visible:outline-accent"
            >
              Start {PVT_DURATION_S[mode]} s test
            </button>
          </div>
        )}

        {running && (
          <>
            <span className="absolute top-4 right-4 font-mono text-sm text-dim tabular-nums">{secondsLeft} s</span>
            {phase === 'stimulus' ? (
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.06 }}
                className="size-32 rounded-full bg-accent shadow-[0_0_60px_rgb(76_201_240/0.6)]"
              />
            ) : (
              <span className="font-mono text-sm tracking-[0.25em] text-dim uppercase">Wait for the signal</span>
            )}
            <AnimatePresence>
              {flash && phase === 'wait' && (
                <motion.span
                  key={responses.current.length}
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 0, y: -12 }}
                  transition={{ duration: 1.2 }}
                  className={`absolute bottom-6 font-mono text-lg tabular-nums ${
                    flash.kind === 'early' ? 'text-warn' : flash.ms >= PVT_LAPSE_MS ? 'text-warn' : 'text-ink'
                  }`}
                >
                  {flash.kind === 'early' ? 'Too early' : `${flash.ms} ms`}
                </motion.span>
              )}
            </AnimatePresence>
          </>
        )}

        {phase === 'done' && result && (
          <div className="flex w-full max-w-xl flex-col items-center gap-5 px-6 text-center">
            {result.summary ? (
              <dl className="grid w-full grid-cols-2 gap-4 sm:grid-cols-4">
                <Stat label="Median" value={`${result.summary.medianMs} ms`} />
                <Stat label="Lapses" value={String(result.summary.lapses)} />
                <Stat label="False starts" value={String(result.summary.falseStarts)} />
                <Stat label="New S" value={result.saved && readiness ? String(Math.round(readiness.S)) : 'n/a'} />
              </dl>
            ) : (
              <p className="text-sm text-dim">No valid responses. Try again.</p>
            )}
            {result.summary && !result.saved && (
              <p className="text-sm text-warn">
                Not saved: there is no check-in for day {currentDay}.{' '}
                <button type="button" onClick={() => onNavigate('checkin')} className="underline">
                  Check in first
                </button>
              </p>
            )}
            {result.saved && <p className="text-sm text-dim">Saved to today's log. Lapse means a reaction of {PVT_LAPSE_MS} ms or slower.</p>}
            <button
              type="button"
              onClick={() => setPhase('idle')}
              className="border border-edge px-4 py-2 font-mono text-xs tracking-[0.15em] text-dim uppercase hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
            >
              Run again
            </button>
          </div>
        )}
      </div>
    </section>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line bg-space/60 p-3">
      <dt className="font-mono text-[10px] tracking-[0.2em] text-dim uppercase">{label}</dt>
      <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}
