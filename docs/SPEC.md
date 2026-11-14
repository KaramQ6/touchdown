# TOUCHDOWN: Build Spec

Rename to `SPEC.md` and put it in `docs/` in the repo. This is the single source of truth for Claude Code.

---

## 1. Product in one paragraph
An astronaut in Mars transit spends 2 minutes a day in TOUCHDOWN. They log 6 vitals plus exercise minutes, run a 60-second
reaction test, and get a Landing Readiness score R (0-100) split into 3 sub-scores. The app projects R to landing day,
lets them move sliders (exercise, sleep) to see how today's decisions change landing-day readiness, and escalates red
flags in 3 levels (handle it myself / alert crew / contact Earth) with a live comm-delay timer. Everything runs offline.

## 2. Users
- Primary: astronaut in transit, not a doctor, 2-3 minutes per day.
- Secondary: Crew Medical Officer (CMO), sees the whole crew.
- Tertiary: flight surgeon on Earth, receives a delayed summary.

## 3. Scope
### Must (demo fails without these)
| ID | Feature | Acceptance criteria |
|---|---|---|
| M1 | Daily Check-in: HR, systolic/diastolic BP, fasting glucose, temp, sleep hours, mood 1-5, exercise minutes | Completes in under 90 s. Each field validated against plausible range (table 6.3). Saved locally. Recomputes R immediately. |
| M2 | Reaction Test (PVT) | 60 s full mode, 15 s demo mode (toggle). Random stimulus interval 2-10 s. Records median RT (ms) and lapses (RT >= 500 ms). False starts (tap before stimulus) counted separately, not as RT. |
| M3 | Readiness: R ring + M, S, V sub-scores | Updates after check-in. Each sub-score shows its biggest driver in one line. Band label: Ready / Limited / Not Ready. |
| M4 | Landing Projection + what-if | Line chart of projected R from today to landing day. Sliders: exercise minutes/day (0-180), sleep hours (4-9). Moving a slider updates R_land live. Shows band change if it crosses 50 or 75. |
| M5 | Escalation | Current level 0-3, rule that triggered it, action card. Level 3 shows comm-delay timer (one-way and round trip). Level 2 shows a 4-hour re-measure countdown and a "Re-measure now" button that opens Check-in. |
| M6 | Body Map | Original simple SVG silhouette (no copyrighted art), 5 tappable regions: bones, calf muscles, inner ear/balance, heart, mind. Each opens status, plain explanation, source badge. |
| M7 | Trends | One chart per indicator across mission days. 120 seeded days visible on first launch. |
| M8 | Offline-first PWA | Full app works with Wi-Fi off after first load. |
| M9 | Source badges | Every number on screen has a "Why this number?" tap that opens its `sources.ts` entry with status and link. |
| M10 | Today's Action | Home shows one recommended change (best of: exercise +30 min/day capped at 180, exercise to 120, sleep to 7 h, sleep to 8 h, or the best exercise+sleep pair) with before -> after R_land and band chips, or "Hold course" if no candidate gains >= 1 point. "Commit" stores {day, change, targetRLand}. The next check-in after a commitment shows "done / not done" by comparing that log's sleep and exercise to the commitment (done = every committed value met or exceeded). |

### Should
| ID | Feature | Acceptance criteria |
|---|---|---|
| S1 | Wearable (simulated) data source | Toggle in Check-in: "Wearable (simulated)". Fills HR and temp from a seeded stream with small noise. Fields show a `SIMULATED` chip. Manual entry always available. |
| S2 | Camera HR (rPPG) | Only if the team's spike test passed. Falls back to manual on low signal quality. If not built, hide the button. |
| S3 | Streak on Home | Consecutive check-in days. |

### Could
| C1 | Crew view (CMO) | Table of 4 astronauts: R, band, escalation level. |
| C2 | Arabic / English toggle with RTL | |
| C3 | Local explainer model | Small on-device model explains why R changed using only fixed text from `sources.ts` and `body-regions.ts`. No diagnosis. Build last, only if everything else is done. |

### Non-goals
Medical diagnosis, medication advice, real wearable pairing, accounts, backend, pharmacy module, generic chatbot.

---

## 4. Scientific model (implement exactly)

### 4.1 Inputs
- `d` = current mission day. `T` = landing day (default 210, range 180-270).
- `E` = exercise adherence = mean(exerciseMin over last 7 logged days) / 120, clipped to [0, 1].
- `RT0` = personal baseline = mean of the first 3 PVT median RTs. `RT` = today's median RT. `L` = today's lapses.

### 4.2 Formulas
```
clip(x) = min(100, max(0, x))

B(d)  = 1.25 * (d / 30) * (1 - 0.5 * E)                 // bone density loss, %
Mu(d) = min(30, 20 * (d / 180) * (1 - 0.5 * E))         // calf strength loss, %
M     = clip(100 - 3 * B - 1.5 * Mu)

S     = clip(100 - 150 * max(0, (RT - RT0) / RT0) - 5 * L)

V     = mean of the 6 indicator scores (green = 100, yellow = 60, red = 20)

R     = 0.40 * M + 0.35 * S + 0.25 * V

Band: R >= 75 Ready | 50 <= R < 75 Limited | R < 50 Not Ready
```
If no PVT exists yet, S uses the most recent PVT; if none ever, S = 100 and the UI shows "No reaction test yet".

### 4.3 Projection
`R_land` = same formula with `d = T`, using current S and V, and current E.
What-if: exercise slider replaces E (slider / 120, clipped). Sleep slider replaces today's sleep value and recomputes V.
The projection curve is R computed for every day from today to T with those values.
Honest note shown under the chart: "Exercise changes M only. S and V are held at today's values."

### 4.4 Golden test values (must pass exactly, rounded to 2 decimals)
| Case | Expected |
|---|---|
| M(d=210, E=0) | 38.75 |
| M(d=210, E=0.5) | 54.06 |
| M(d=210, E=1) | 69.38 |
| M(d=140, E=0.5) | 69.38 |
| S(RT=1.2*RT0, L=1) | 65.00 |
| S(RT=RT0, L=0) | 100.00 |
| S(RT=0.9*RT0, L=0) | 100.00 (faster than baseline is not a bonus) |
| V(all green) | 100.00 |
| R(M=100, S=100, V=100) | 100.00 |
| band(74.99) / band(75) / band(49.99) / band(50) | limited / ready / not-ready / limited |

### 4.5 Demo story targets (seed must produce these, test them)
Hero astronaut on day 140 of 210, E = 0.5 (60 min/day):
- R_now in Limited (target about 55).
- R_land with current values is Not Ready (target about 49).
- R_land with exercise slider at 120 and sleep slider at 8 is Limited (target about 58).

Verified example that hits the targets: RT0 = 250 ms, RT = 333 ms, L = 4 gives S = 30.20;
V from HR yellow, BP green, glucose green, temp green, sleep red (5.5 h), mood red (2) gives V = 66.67.
Then R_now = 54.99, R_land = 48.86, R_land(what-if: exercise 120, sleep 8) = 58.32.
(Exercise slider alone: R_land = 54.99.)
Exercise alone moves R_land by about 6 points; exercise + sleep crosses the 50 line. That band crossing is the demo moment.
Do not change formulas to make the story bigger. Tune seed data only.

### 4.6 Escalation rules
| Condition | Level | Action card |
|---|---|---|
| All green | 0 | "All clear." |
| Any yellow today | 1: Handle it myself | Guidance card for that indicator, re-check tomorrow |
| Any red today, or same indicator not green (yellow or red) 3 days in a row | 2: Alert crew | Notify CMO, re-measure within 4 h |
| Temp >= 38.5, or systolic >= 160, or glucose < 54, or same indicator red 2 days in a row | 3: Contact Earth | Summary for flight surgeon + comm-delay timer |

Highest triggered level wins. Show which rule fired.

Level 2 re-measure clock: starts the first time the app shows level 2 for that astronaut, persists across navigation and reloads, and is cleared by the next check-in.

### 4.7 Communication delay
`commDelayMin` one-way, default 12, allowed range 3-22 (physical Earth-Mars light time). Round trip = 2x.
Level 3 timer counts down the round trip: "Earliest reply from Earth in mm:ss".

### 4.8 Today's Action (recommendation)
Candidates (exactly these, no others):
- Exercise +30 min/day, capped at 180
- Exercise to 120 min/day
- Sleep to 7 h
- Sleep to 8 h
- Best exercise+sleep pair: one exercise candidate combined with one sleep candidate, the combination with the highest R_land

Rules:
1. Drop any candidate that would lower the current value (e.g. exercise to 120 when current is 150; sleep to 7 when current is 8).
2. Evaluate each remaining candidate with the 4.3 projection (S and V held, what-if exercise and sleep values applied).
3. Gain = R_land(candidate) - R_land(current). Rank by gain, highest first.
4. Exact ties go to the smaller change: singles before pairs, lower values first.
5. If the top gain is < 1 point, show "Hold course". Otherwise show the top candidate with before -> after R_land and band chips.

Demo target: seed hero (day 140 of 210, exercise 60 min/day, sleep 5.5 h) shows "Exercise 120 min a day and sleep 7 h a night", 48.86 Not Ready -> 58.32 Limited.

**Decisions**
- A check-in on the same mission day counts as the next check-in (the demo keeps the mission day fixed at 140).
- With the demo seed, sleep 7 h is chosen over 8 h because both make sleep green, so R_land is identical and the tie goes to the smaller change.

---

## 5. Data model
```ts
type Status = 'green' | 'yellow' | 'red';
type Source = 'manual' | 'wearable-sim' | 'camera';

interface DailyLog {
  day: number;
  heartRate: number;  hrSource: Source;
  systolic: number;   diastolic: number;
  glucose: number;
  tempC: number;      tempSource: Source;
  sleepHours: number;
  mood: 1 | 2 | 3 | 4 | 5;
  exerciseMin: number;
  pvt?: { medianMs: number; lapses: number; falseStarts: number };
}

interface Astronaut { id: string; name: string; role: string; logs: DailyLog[] }

interface Mission {
  currentDay: number;
  landingDay: number;     // default 210
  commDelayMin: number;   // one-way, default 12
  crew: Astronaut[];
  activeId: string;
}

interface Commitment {
  day: number;
  change: { exerciseMin?: number; sleepHours?: number };
  targetRLand: number;
  checkIn?: DailyLog;
}

interface Readiness {
  R: number; M: number; S: number; V: number;
  band: 'ready' | 'limited' | 'not-ready';
  drivers: { axis: 'M' | 'S' | 'V'; text: string }[];
  indicatorStatus: Record<'hr' | 'bp' | 'glucose' | 'temp' | 'sleep' | 'mood', Status>;
}

interface Escalation { level: 0 | 1 | 2 | 3; rule: string; action: string }

interface SourceEntry {
  id: string; label: string; value: string;
  status: 'VERIFIED' | 'ASSUMPTION' | 'VERIFY';
  citation: string; url?: string; note?: string;
}
```

Mission state keeps commitments and re-measure due times (epoch ms) as maps keyed by astronaut id.

## 6. Thresholds

### 6.1 Vitals (general adult references, not spaceflight-specific; say so in UI)
| Indicator | Green | Yellow | Red |
|---|---|---|---|
| Resting HR (bpm) | 60-100 | 50-59 or 101-110 | < 50 or > 110 |
| Systolic BP (mmHg) | 90-129 | 130-139 | < 90 or >= 140 |
| Fasting glucose (mg/dL) | 70-99 | 100-125 | < 70 or >= 126 |
| Temp (C) | 36.1-37.2 | 37.3-37.9, or 35.5-36.0 | < 35.5 or >= 38.0 |
| Sleep (h) | >= 7 | 6-6.9 | < 6 |
| Mood (1-5) | 4-5 | 3 | 1-2 |

### 6.2 Boundaries are inclusive as written. Write a test per boundary.

### 6.3 Input validation (reject outside, show message)
HR 30-220, systolic 60-250, diastolic 30-150, glucose 30-500, temp 33-42, sleep 0-16, exercise 0-300.

---

## 7. sources.ts (seed content; team will confirm links marked VERIFY)
Updated 2026-11-14 after the research pass: every VERIFIED row below was opened and checked against its page. See `docs/research/`.

| id | Value | Status | Citation / URL |
|---|---|---|---|
| bone_loss | 1-1.5%/month, model uses 1.25 | VERIFIED | NASA, Risk of Spaceflight-Induced Bone Changes. https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ . Note: varies by site (hip ~1.4-1.5%, spine ~0.9%, Lang et al. 2004). |
| calf_strength | model uses 20% (upper-end value) | VERIFY | Fitts et al. 2010, J Physiol. https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/ . The paper reports soleus type I fibre atrophy 20% and single-fibre peak force down 35% after ~180 days (n=9). It does not give a whole-muscle 7-20% figure; a whole-muscle source is still needed. |
| balance_most_affected | balance-dependent tasks changed most (qualitative) | VERIFIED | NASA One-Year Mission functional performance. https://www.nasa.gov/humans-in-space/nasas-one-year-mission-investigates-how-space-affects-astronauts-functional-performance/ |
| landing_readiness_tests | qualitative | VERIFIED | NASA, New tests evaluate mission readiness of astronauts upon landing. https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/ |
| no_combined_model | predicting post-landing performance is still being studied (qualitative) | VERIFIED | Wood SJ et al., Assessing the Relationships Between Sensorimotor Biomarkers and Post-Landing Functional Task Performance, NASA HRP IWS 2024 (NTRS 20230014343). https://ntrs.nasa.gov/citations/20230014343 |
| hrp_risks | official risk names | VERIFIED | NASA HRP Risks. https://www.nasa.gov/hrp/risks/ |
| hrp_hazards | Gravity fields; Distance from Earth | VERIFIED | NASA HRP Hazards. https://www.nasa.gov/hrp/hazards/ |
| exercise_halves_loss | factor 0.5 | ASSUMPTION | Team design choice, editable. |
| exercise_target | 120 min/day | VERIFIED | NASA, Astronaut Exercise: ISS crews average about two hours of exercise per day. https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/ |
| weights | 0.40 / 0.35 / 0.25 | ASSUMPTION | Justified by FTT findings, not validated. |
| coefficients | 3, 1.5, 150, 5 | ASSUMPTION | Calibrated to give a sensible 0-100 range. |
| pvt_lapse | 500 ms | VERIFIED | Basner M, Dinges DF. Maximizing Sensitivity of the PVT to Sleep Loss. Sleep 2011;34(5):581-591. https://pmc.ncbi.nlm.nih.gov/articles/PMC3079937/ . Defined for the 10-minute PVT; our test is shorter. |
| transit | ~6 months weightless transit | VERIFIED | NASA HRP, Hazard: Gravity Fields ("six-month trek"). https://www.nasa.gov/hrp/hazard-gravity-fields/ |
| comm_delay | 3-22 min one-way | VERIFY | Physics: Earth-Mars light time at closest/farthest distance (about 3.1 min at 56 million km, 22.3 min at 401 million km). No published page cited yet. |
| vitals_ranges | table 6.1 | VERIFY | AHA (HR, BP), ADA (glucose), AASM/SRS (sleep >= 7 h), MedlinePlus (temp). Green temp 36.1-37.2 C matches MedlinePlus and green HR 60-100 matches AHA; yellow and red edges are team choices. AHA calls systolic 120-129 "elevated", while table 6.1 keeps it green. |
| partial_gravity_gap | long-duration effects at 0.38 g not studied in humans | VERIFY | NASA Human Research Roadmap (gap ID not confirmed). Short partial-gravity exposures have been tested, so the claim is limited to long stays. Shown as an honest limitation. |
| recommend_rules | candidates and 1-point minimum gain | ASSUMPTION | Team design choice for decision support. |

---

## 8. Repo structure
```
touchdown/
  docs/SPEC.md
  CLAUDE.md
  src/
    engine/            # pure TS, no React
      constants.ts
      types.ts
      thresholds.ts    # indicator status + validation
      score.ts         # M, S, V, R, band, drivers
      projection.ts    # R_land, curve, what-if
      escalation.ts    # level + rule + action
      pvt.ts           # median, lapses, false starts
      __tests__/
    data/
      seed-crew.ts     # 4 astronauts x 120 days, deterministic (seeded RNG)
      sources.ts
      body-regions.ts
      action-cards.ts
    store/mission.ts   # Zustand + persist, "Reset demo" action
    screens/  Home, CheckIn, ReactionTest, Projection, BodyMap, Trends, Escalation, (Crew)
    components/ ScoreRing, AxisCard, StatusChip, SourceBadge, SourceSheet, DelayTimer, SimChip, Nav
  public/ icons, manifest
```

## 9. Screens
1. Home: big R ring with band, M/S/V cards (number + driver line), "Day 140 of 210, 70 days to landing", escalation pill, streak. Today's Action card under the ring (sentence, before -> after R_land with band chips, Commit), and a commitment outcome line after the next check-in.
2. Check-in: 7 inputs, source chips, wearable-sim toggle, submit returns to Home with animated R change.
3. Reaction Test: full/demo toggle, tap target, results card (median, lapses, new S).
4. Projection: curve today to T, band zones shaded (red < 50, amber 50-75, green >= 75), 2 sliders, R_land big number, honest note.
5. Body Map: SVG, 5 regions colored by status, side panel with explanation + SourceBadge.
6. Trends: indicator picker, line chart with green/amber/red bands.
7. Escalation: level, fired rule, action card, DelayTimer at level 3.
Global: top bar with mission day, astronaut switcher, "Reset demo", "DEMO DATA" chip.

## 10. Body map region content (body-regions.ts)
| Region | Linked axis | NASA risk name (exact) |
|---|---|---|
| Bones | M (B) | Risk of Spaceflight-Induced Bone Changes |
| Calf muscles | M (Mu) | Risk of Reduced Cardiorespiratory and Musculoskeletal Fitness |
| Inner ear / balance | S | Risk of Altered Sensorimotor and Vestibular Function |
| Heart | V (HR, BP) | Risk of Cardiovascular Adaptations |
| Mind | V (sleep, mood) | Risk of Inadequate Sleep and Irregular Schedules; Risk of Behavioral Changes and Psychiatric Disorders |

## 11. Hardware concept (not built by Claude Code)
Concept wristband shown on one slide as "Phase 2". Parts for the KiCad design: nRF52840 (or ESP32-C3) MCU + BLE,
MAX30101 PPG (HR/SpO2), BMI270 IMU (sway after landing), MAX30205 skin temp, small LiPo + MCP73831 charger.
The app consumes it only through the `wearable-sim` source, always labeled SIMULATED.
