import { describe, expect, it } from 'vitest'

// Every non-test source file, as raw text (CLAUDE.md rules 6 and 10 apply to all UI copy).
const sources = Object.entries(
  import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/__tests__/**'], { query: '?raw', import: 'default', eager: true }),
)

describe('UI copy rules across src', () => {
  it('scans the whole app', () => expect(sources.length).toBeGreaterThan(30))

  it.each(sources)('%s has no em dash', (_, text) => expect(text).not.toContain('—'))

  it.each(sources)('%s never says diagnosis', (_, text) => expect(text.toLowerCase()).not.toMatch(/diagnos/))
})
