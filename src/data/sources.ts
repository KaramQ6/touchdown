import type { SourceEntry } from '../engine/types'

/**
 * SPEC section 7. Statuses are exactly as given: VERIFY rows stay VERIFY until the team adds a link.
 * Rows after the SPEC 7 block cover engine constants that SPEC 7 does not list (CLAUDE.md rule 3).
 */
export const SOURCES: readonly SourceEntry[] = [
  {
    id: 'bone_loss',
    label: 'Bone density loss',
    value: '1-1.5%/month, model uses 1.25',
    status: 'VERIFIED',
    citation: 'NASA, Risk of Spaceflight-Induced Bone Changes.',
    url: 'https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/',
    note: 'Varies by site (hip ~1.4-1.5%, spine ~0.9%, Lang et al. 2004).',
  },
  {
    id: 'calf_strength',
    label: 'Calf strength loss',
    value: '7-20% peak force loss after ~6 months, model uses 20',
    status: 'VERIFIED',
    citation: 'Fitts et al. 2010, J Physiol.',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/',
  },
  {
    id: 'balance_most_affected',
    label: 'Balance is the most affected function after flight',
    value: 'qualitative',
    status: 'VERIFIED',
    citation: 'NASA One-Year Mission functional performance.',
    url: 'https://nasa.gov/humans-in-space/nasas-one-year-mission-investigates-how-space-affects-astronauts-functional-performance',
  },
  {
    id: 'landing_readiness_tests',
    label: 'Landing readiness tests',
    value: 'qualitative',
    status: 'VERIFIED',
    citation: 'NASA, New tests evaluate mission readiness of astronauts upon landing.',
    url: 'https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/',
  },
  {
    id: 'no_combined_model',
    label: 'No combined readiness model exists yet',
    value: 'qualitative',
    status: 'VERIFIED',
    citation: 'Wood et al., NASA NTRS.',
    url: 'https://ntrs.nasa.gov/api/citations/20230014343/downloads/NSL%20IWS24%20Wood%20Predictors.pdf',
  },
  {
    id: 'hrp_risks',
    label: 'NASA Human Research Program risks',
    value: 'official risk names',
    status: 'VERIFIED',
    citation: 'NASA HRP Risks.',
    url: 'https://www.nasa.gov/hrp/risks/',
  },
  {
    id: 'hrp_hazards',
    label: 'NASA Human Research Program hazards',
    value: 'Gravity fields; Distance from Earth',
    status: 'VERIFIED',
    citation: 'NASA HRP Hazards.',
    url: 'https://www.nasa.gov/hrp/hazards/',
  },
  {
    id: 'exercise_halves_loss',
    label: 'Exercise protection factor',
    value: 'factor 0.5',
    status: 'ASSUMPTION',
    citation: 'Team design choice, editable.',
  },
  {
    id: 'exercise_target',
    label: 'Daily exercise target',
    value: '120 min/day',
    status: 'VERIFY',
    citation: 'NASA states ISS crew exercise about 2 h/day; team adds link.',
  },
  {
    id: 'weights',
    label: 'Sub-score weights M / S / V',
    value: '0.40 / 0.35 / 0.25',
    status: 'ASSUMPTION',
    citation: 'Justified by FTT findings, not validated.',
  },
  {
    id: 'coefficients',
    label: 'Score coefficients',
    value: '3, 1.5, 150, 5',
    status: 'ASSUMPTION',
    citation: 'Calibrated to give a sensible 0-100 range.',
  },
  {
    id: 'pvt_lapse',
    label: 'Reaction test lapse threshold',
    value: '500 ms',
    status: 'VERIFY',
    citation: 'Standard PVT lapse threshold (Basner & Dinges 2011, Sleep). Team adds link.',
  },
  {
    id: 'transit',
    label: 'Transit duration',
    value: '~6 months weightless transit',
    status: 'VERIFY',
    citation: 'NASA HRP Gravity Fields hazard page. Team adds link.',
  },
  {
    id: 'comm_delay',
    label: 'Earth-Mars communication delay',
    value: '3-22 min one-way',
    status: 'VERIFIED',
    citation: 'Physics: Earth-Mars light time at closest/farthest distance.',
  },
  {
    id: 'vitals_ranges',
    label: 'Vital sign ranges',
    value: 'General adult references, not spaceflight-specific',
    status: 'VERIFY',
    citation: 'AHA (HR, BP), ADA (glucose), AASM/SRS (sleep >= 7 h). Team adds links.',
  },
  {
    id: 'partial_gravity_gap',
    label: 'Partial gravity is not directly studied',
    value: 'effects of 0.38 g not directly studied in humans',
    status: 'VERIFIED',
    citation: 'NASA HRP gap (GapMA-101). Shown as an honest limitation.',
  },

  // --- Not in SPEC 7: engine constants that need a source entry (rule 3). Team design choices. ---
  {
    id: 'calf_loss_cap',
    label: 'Calf strength loss cap',
    value: '30%',
    status: 'ASSUMPTION',
    citation: 'Team design choice: keeps M bounded on long missions.',
  },
  {
    id: 'score_bands',
    label: 'Status points and readiness bands',
    value: 'green 100, yellow 60, red 20; Ready >= 75, Limited 50-75, Not Ready < 50',
    status: 'ASSUMPTION',
    citation: 'Team design choice, not validated.',
  },
  {
    id: 'pvt_baseline',
    label: 'Personal reaction time baseline',
    value: 'mean of the first 3 reaction tests',
    status: 'ASSUMPTION',
    citation: 'Team design choice.',
  },
  {
    id: 'pvt_protocol',
    label: 'Reaction test protocol',
    value: '60 s test (15 s demo mode), random 2-10 s wait before each stimulus',
    status: 'ASSUMPTION',
    citation: 'Shortened from the standard 10 min PVT for a 2 minute daily routine. Team design choice.',
  },
  {
    id: 'exercise_window',
    label: 'Exercise adherence window',
    value: 'last 7 logged days',
    status: 'ASSUMPTION',
    citation: 'Team design choice.',
  },
  {
    id: 'input_validation',
    label: 'Input validation ranges',
    value: 'HR 30-220, systolic 60-250, diastolic 30-150, glucose 30-500, temp 33-42, sleep 0-16, exercise 0-300',
    status: 'ASSUMPTION',
    citation: 'Team design choice: plausible-value limits that catch typing errors.',
  },
  {
    id: 'escalation_rules',
    label: 'Escalation rules',
    value: 'Temp >= 38.5 C, systolic >= 160, glucose < 54; red 2 days or yellow 3 days in a row; re-measure within 4 h',
    status: 'ASSUMPTION',
    citation: 'Team design choice for decision support, not a clinical protocol.',
  },
  {
    id: 'recommend_rules',
    label: 'Today\'s Action candidates',
    value: 'exercise +30 min/day (max 180) or to 120 min/day; sleep 7 h or 8 h; best single or exercise+sleep pair; ignored if gain < 1 point',
    status: 'ASSUMPTION',
    citation: 'Team design choice for decision support.',
  },
  {
    id: 'wearable_sim',
    label: 'Simulated wearable stream',
    value: 'HR and temp = own 7-day average + seeded noise (up to 3 bpm, 0.1 C)',
    status: 'ASSUMPTION',
    citation: 'Team design choice. No real device is paired; every value from this stream is labeled SIMULATED.',
  },
]

const BY_ID = new Map(SOURCES.map((s) => [s.id, s]))

export const sourceById = (id: string): SourceEntry | undefined => BY_ID.get(id)
