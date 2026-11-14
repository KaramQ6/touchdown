import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { sourceById } from '../data/sources'
import type { SourceEntry } from '../engine/types'

const STATUS_STYLE: Record<SourceEntry['status'], string> = {
  VERIFIED: 'border-ink/40 text-ink',
  ASSUMPTION: 'border-dim/50 text-dim',
  VERIFY: 'border-dashed border-warn/60 text-warn',
}

interface SourceSheetProps {
  title: string
  ids: readonly string[]
  onClose: () => void
}

/** SPEC M9: the "Why this number?" panel listing sources.ts entries. */
export function SourceSheet({ title, ids, onClose }: SourceSheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const entries = ids.map(sourceById).filter((e): e is SourceEntry => e !== undefined)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') return onClose()
      if (e.key !== 'Tab' || !dialogRef.current) return
      // Focus trap: Tab cycles inside the dialog (aria-modal).
      const items = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]')
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <motion.div
        className="absolute inset-0 bg-space/70 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />
      <motion.aside
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="source-sheet-title"
        className="relative flex h-full w-full max-w-md flex-col border-l border-line bg-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        transition={{ type: 'tween', duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <header className="flex items-start justify-between gap-4 border-b border-line p-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.2em] text-dim uppercase">Why this number?</p>
            <h2 id="source-sheet-title" className="mt-1 text-lg font-semibold">
              {title}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="rounded-sm border border-edge px-3 py-1 font-mono text-xs text-dim hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
          >
            Close
          </button>
        </header>
        <ul className="flex-1 space-y-4 overflow-y-auto p-6">
          {entries.map((e) => (
            <li key={e.id} className="border-l-2 border-line pl-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold">{e.label}</h3>
                <span className={`rounded-sm border px-1.5 py-0.5 font-mono text-[10px] tracking-[0.15em] ${STATUS_STYLE[e.status]}`}>
                  {e.status}
                </span>
              </div>
              <p className="mt-1 font-mono text-sm text-accent">{e.value}</p>
              <p className="mt-1 text-sm text-dim">{e.citation}</p>
              {e.note && <p className="mt-1 text-sm text-dim">{e.note}</p>}
              {e.url && (
                <a
                  href={e.url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-block font-mono text-xs break-all text-accent underline-offset-2 hover:underline"
                >
                  {e.url}
                </a>
              )}
            </li>
          ))}
        </ul>
      </motion.aside>
    </div>,
    document.body,
  )
}
