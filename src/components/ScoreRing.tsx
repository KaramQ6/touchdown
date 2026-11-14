import { animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useEffect } from 'react'
import { BAND_LIMITED_MIN, BAND_READY_MIN } from '../engine/constants'

const SIZE = 260
const STROKE = 12
const RADIUS = (SIZE - STROKE) / 2
const CIRC = 2 * Math.PI * RADIUS

/** Last value shown per astronaut, so returning to Home animates from the old R to the new one. */
const lastShown = new Map<string, number>()

function tick(value: number) {
  const a = (value / 100) * 2 * Math.PI - Math.PI / 2
  const r1 = RADIUS - STROKE
  const r2 = RADIUS + STROKE
  const c = SIZE / 2
  return { x1: c + r1 * Math.cos(a), y1: c + r1 * Math.sin(a), x2: c + r2 * Math.cos(a), y2: c + r2 * Math.sin(a) }
}

interface ScoreRingProps {
  value: number
  /** Whose score this is; keeps the animation start point per astronaut. */
  id: string
}

/** Fixed-size ring: the number animates, the layout never moves. */
export function ScoreRing({ value, id }: ScoreRingProps) {
  const reduce = useReducedMotion()
  const mv = useMotionValue(lastShown.get(id) ?? 0)
  const offset = useTransform(mv, (v) => CIRC * (1 - v / 100))
  const label = useTransform(mv, (v) => Math.round(v).toString())

  useEffect(() => {
    const controls = animate(mv, value, { duration: reduce ? 0 : 1.4, ease: [0.22, 1, 0.36, 1] })
    lastShown.set(id, value)
    return () => controls.stop()
  }, [id, value, mv, reduce])

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }} role="img" aria-label={`Landing readiness ${Math.round(value)} of 100`}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} aria-hidden>
        <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="var(--color-line)" strokeWidth={STROKE} />
        <motion.circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={STROKE}
          strokeLinecap="butt"
          strokeDasharray={CIRC}
          style={{ strokeDashoffset: offset, rotate: -90, transformOrigin: '50% 50%', filter: 'drop-shadow(0 0 10px rgb(76 201 240 / 0.35))' }}
        />
        {[BAND_LIMITED_MIN, BAND_READY_MIN].map((t) => (
          <line key={t} {...tick(t)} stroke="var(--color-dim)" strokeWidth={2} />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span className="font-mono text-7xl font-semibold tabular-nums">{label}</motion.span>
        <span className="mt-1 font-mono text-[11px] tracking-[0.25em] text-dim uppercase">of 100</span>
      </div>
    </div>
  )
}
