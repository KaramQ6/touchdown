export const SCREENS = [
  { id: 'home', label: 'Home' },
  { id: 'checkin', label: 'Check-in' },
  { id: 'reaction', label: 'Reaction Test' },
  { id: 'projection', label: 'Projection' },
  { id: 'bodymap', label: 'Body Map' },
  { id: 'trends', label: 'Trends' },
  { id: 'escalation', label: 'Escalation' },
  { id: 'crew', label: 'Crew' },
] as const

export type ScreenId = (typeof SCREENS)[number]['id']

export interface ScreenProps {
  onNavigate: (id: ScreenId) => void
}

interface NavProps {
  active: ScreenId
  onSelect: (id: ScreenId) => void
}

export function Nav({ active, onSelect }: NavProps) {
  return (
    <nav
      aria-label="Screens"
      className="fixed inset-x-0 bottom-0 z-10 flex overflow-x-auto border-t border-line bg-panel md:static md:w-52 md:flex-col md:border-t-0 md:border-r md:py-4"
    >
      {SCREENS.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          aria-current={active === id ? 'page' : undefined}
          className={`shrink-0 px-4 py-3 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-accent ${
            active === id ? 'text-accent md:bg-line' : 'text-dim hover:text-ink'
          }`}
        >
          {label}
        </button>
      ))}
    </nav>
  )
}
