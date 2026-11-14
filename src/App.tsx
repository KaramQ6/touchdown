import { useState, type ComponentType } from 'react'
import { Nav, type ScreenId, type ScreenProps } from './components/Nav'
import { Home } from './screens/Home'
import { CheckIn } from './screens/CheckIn'
import { ReactionTest } from './screens/ReactionTest'
import { Projection } from './screens/Projection'
import { BodyMap } from './screens/BodyMap'
import { Trends } from './screens/Trends'
import { Escalation } from './screens/Escalation'
import { useMission } from './store/mission'

const SCREEN_COMPONENTS: Record<ScreenId, ComponentType<ScreenProps>> = {
  home: Home,
  checkin: CheckIn,
  reaction: ReactionTest,
  projection: Projection,
  bodymap: BodyMap,
  trends: Trends,
  escalation: Escalation,
}

function TopBar() {
  const { currentDay, landingDay, crew, activeId } = useMission((s) => s.mission)
  const isDemo = useMission((s) => s.isDemo)
  const setActive = useMission((s) => s.setActive)
  const resetDemo = useMission((s) => s.resetDemo)

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-panel px-4 md:px-6">
      <span className="font-mono text-sm font-semibold tracking-[0.3em] text-accent">TOUCHDOWN</span>
      <span className="hidden font-mono text-xs text-dim sm:inline">
        Day <span className="text-ink tabular-nums">{currentDay}</span> / <span className="tabular-nums">{landingDay}</span>
      </span>
      {isDemo && (
        <span className="rounded-sm border border-dashed border-warn/60 px-2 py-0.5 font-mono text-[10px] tracking-[0.2em] text-warn uppercase">
          Demo data
        </span>
      )}
      <div className="ml-auto flex items-center gap-2">
        <label htmlFor="astronaut" className="sr-only">
          Astronaut
        </label>
        <select
          id="astronaut"
          value={activeId}
          onChange={(e) => setActive(e.target.value)}
          className="max-w-44 border border-line bg-space px-2 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-accent"
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
          className="border border-line px-3 py-1.5 font-mono text-xs text-dim transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          Reset demo
        </button>
      </div>
    </header>
  )
}

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('home')
  const Screen = SCREEN_COMPONENTS[screen]

  return (
    <div className="flex h-full flex-col">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <Nav active={screen} onSelect={setScreen} />
        <main className="min-w-0 flex-1 overflow-y-auto pb-16 md:pb-0">
          <Screen onNavigate={setScreen} />
        </main>
      </div>
    </div>
  )
}
