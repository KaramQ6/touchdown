import { useCallback, useRef, useState } from 'react'
import { SourceSheet } from './SourceSheet'

interface SourceBadgeProps {
  /** What the number is, shown as the sheet title. */
  title: string
  ids: readonly string[]
}

/** SPEC M9: tap to see where a number comes from. */
export function SourceBadge({ title, ids }: SourceBadgeProps) {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const close = useCallback(() => {
    setOpen(false)
    buttonRef.current?.focus()
  }, [])

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Why this number? ${title}`}
        title="Why this number?"
        className="inline-flex size-5 shrink-0 items-center justify-center rounded-full border border-edge font-mono text-[11px] text-dim transition-colors hover:border-accent hover:text-accent focus-visible:outline-2 focus-visible:outline-accent"
      >
        ?
      </button>
      {open && <SourceSheet title={title} ids={ids} onClose={close} />}
    </>
  )
}
