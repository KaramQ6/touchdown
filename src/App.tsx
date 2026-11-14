import { lazy, Suspense, useState, type ComponentType } from 'react'
import { Nav, type ScreenId, type ScreenProps } from './components/Nav'
import { ErrorBoundary } from './components/ErrorBoundary'
import { Home } from './screens/Home'
import { CheckIn } from './screens/CheckIn'
import { ReactionTest } from './screens/ReactionTest'
import { BodyMap } from './screens/BodyMap'
import { Escalation } from './screens/Escalation'
import { Crew } from './screens/Crew'
import { useMission } from './store/mission'

// Chart screens pull in Recharts; load them on demand (the service worker still precaches the chunks).
const Projection = lazy(() => import('./screens/Projection').then((m) => ({ default: m.Projection })))
const Trends = lazy(() => import('./screens/Trends').then((m) => ({ default: m.Trends })))

const SCREEN_COMPONENTS: Record<ScreenId, ComponentType<ScreenProps>> = {
  home: Home,
  checkin: CheckIn,
  reaction: ReactionTest,
  projection: Projection,
  bodymap: BodyMap,
  trends: Trends,
  escalation: Escalation,
  crew: Crew,
}

function TopBar() {
  const { currentDay, landingDay, crew, activeId } = useMission((s) => s.mission)
  const isDemo = useMission((s) => s.isDemo)
  const setActive = useMission((s) => s.setActive)
  const resetDemo = useMission((s) => s.resetDemo)

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b md:gap-4 border-line bg-panel px-4 md:px-6">
      <span className="font-mono text-sm font-semibold tracking-[0.3em] text-accent">TOUCHDOWN</span>
      <span className="hidden whitespace-nowrap font-mono text-xs text-dim md:inline">
        Day <span className="text-ink tabular-nums">{currentDay}</span> / <span className="tabular-nums">{landingDay}</span>
      </span>
      {isDemo && (
        <span className="shrink-0 whitespace-nowrap rounded-sm border border-dashed border-warn/60 px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] text-warn uppercase">
          Demo data
        </span>
      )}
      <div className="ml-auto flex min-w-0 items-center gap-2">
        <label htmlFor="astronaut" className="sr-only">
          Astronaut
        </label>
        <select
          id="astronaut"
          value={activeId}
          onChange={(e) => setActive(e.target.value)}
          className="min-w-0 max-w-36 border md:max-w-44 border-edge bg-space px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-accent"
        >
          {crew.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name} · {a.role}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={resetDemo}
          className="shrink-0 whitespace-nowrap border border-edge px-3 py-1.5 font-mono text-xs text-dim transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          Reset demo
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home')
  const activeId = useMission((s) => s.mission.activeId)
  const Screen = SCREEN_COMPONENTS[screen]

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Nav active={screen} onSelect={setScreen} />
        <main className="min-w-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          {/* Keyed by astronaut so a screen's local state (e.g. a Check-in draft) never carries over to another astronaut. */}
          {/* Keyed so switching screen or astronaut retries after an error. */}
          <ErrorBoundary key={`${screen}-${activeId}`}>
            <Suspense fallback={<p className="p-10 font-mono text-sm text-dim">Loading</p>}>
              <Screen key={activeId} onNavigate={setScreen} />
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
