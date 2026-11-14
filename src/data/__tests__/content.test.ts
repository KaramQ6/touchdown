import { describe, expect, it } from 'vitest'
import constantsSource from '../../engine/constants.ts?raw'
import { INDICATORS } from '../../engine/constants'
import { ACTION_LEVEL_CARDS, INDICATOR_GUIDANCE } from '../action-cards'
import { BODY_REGIONS } from '../body-regions'
import { SOURCES, sourceById } from '../sources'

// SPEC section 7, statuses exactly as given (updated after the research pass, 2026-11-14).
const SPEC_7: [string, 'VERIFIED' | 'ASSUMPTION' | 'VERIFY'][] = [
  ['bone_loss', 'VERIFIED'],
  ['calf_strength', 'VERIFY'],
  ['balance_most_affected', 'VERIFIED'],
  ['landing_readiness_tests', 'VERIFIED'],
  ['no_combined_model', 'VERIFIED'],
  ['hrp_risks', 'VERIFIED'],
  ['hrp_hazards', 'VERIFIED'],
  ['exercise_halves_loss', 'ASSUMPTION'],
  ['exercise_target', 'VERIFIED'],
  ['weights', 'ASSUMPTION'],
  ['coefficients', 'ASSUMPTION'],
  ['pvt_lapse', 'VERIFIED'],
  ['transit', 'VERIFIED'],
  ['comm_delay', 'VERIFY'],
  ['vitals_ranges', 'VERIFY'],
  ['partial_gravity_gap', 'VERIFY'],
]

describe('sources.ts', () => {
  it.each(SPEC_7)('%s is present with status %s', (id, status) => {
    expect(sourceById(id)?.status).toBe(status)
  })

  it('has unique ids', () => {
    expect(new Set(SOURCES.map((s) => s.id)).size).toBe(SOURCES.length)
  })

  it('every source id cited next to a constant in engine/constants.ts exists (CLAUDE.md rule 3)', () => {
    const cited = [...constantsSource.matchAll(/^[^/\n]*[^\s/][^/\n]*\/\/ ([a-z_]+)/gm)].map((m) => m[1])
    expect(cited.length).toBeGreaterThan(10)
    for (const id of new Set(cited)) expect(sourceById(id), id).toBeDefined()
  })

  it('VERIFIED rows backed by a page carry an https link', () => {
    for (const s of SOURCES.filter((s) => s.url)) expect(s.url).toMatch(/^https:\/\//)
  })

  it('every VERIFIED row has a link to the page it was checked against', () => {
    for (const s of SOURCES.filter((s) => s.status === 'VERIFIED')) expect(s.url, s.id).toBeDefined()
  })
})

describe('body-regions.ts: SPEC section 10', () => {
  it.each([
    ['bones', 'M', 'Risk of Spaceflight-Induced Bone Changes'],
    ['calves', 'M', 'Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness'],
    ['balance', 'S', 'Risk of Altered Sensorimotor and Vestibular Function'],
    ['heart', 'V', 'Risk of Cardiovascular Adaptations'],
    [
      'mind',
      'V',
      'Risk of Inadequate Sleep and Irregular Schedules; Risk of Behavioral Changes and Psychiatric Disorders',
    ],
  ])('%s links axis %s and names "%s"', (id, axis, risk) => {
    const region = BODY_REGIONS.find((r) => r.id === id)
    expect(region).toMatchObject({ axis, riskName: risk })
  })

  it('has exactly 5 regions, each citing existing sources', () => {
    expect(BODY_REGIONS).toHaveLength(5)
    for (const r of BODY_REGIONS) for (const id of r.sourceIds) expect(sourceById(id), id).toBeDefined()
  })
})

describe('action-cards.ts', () => {
  it('has a card for every escalation level 0-3', () => {
    for (const level of [0, 1, 2, 3] as const) expect(ACTION_LEVEL_CARDS[level].steps.length).toBeGreaterThan(0)
  })

  it('has guidance for every indicator', () => {
    for (const k of INDICATORS) expect(INDICATOR_GUIDANCE[k].steps.length).toBeGreaterThan(0)
  })
})

describe('UI copy rules (CLAUDE.md rules 6 and 10)', () => {
  const copy = JSON.stringify([SOURCES, BODY_REGIONS, ACTION_LEVEL_CARDS, INDICATOR_GUIDANCE])
  it('has no em dashes', () => expect(copy).not.toContain('—'))
  it('never says diagnosis', () => expect(copy.toLowerCase()).not.toContain('diagnos'))
})
