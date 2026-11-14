# TOUCHDOWN: Mars Ops Research (Curiosity)

Date of research: 2026-11-14. Status legend:
- **FETCHED**: page or PDF text was read in this session.
- **SEARCH-ONLY**: seen only in search-result snippets; not opened (fetch failed or PDF unreadable).
- **UNVERIFIED**: claim from a secondary or third-party source; do not present as NASA fact without checking.

Fetch notes: spaceappschallenge.org returned "unable to get local issuer certificate" (environment TLS issue, not a 404). Several NASA NTRS PDFs returned raw binary, so their text could not be read. These are marked SEARCH-ONLY.

---

## a) NASA Space Apps 2026 challenge

**Facts**
- Challenge title: "Create Health Monitoring Software for Astronauts on Space Missions". Status: SEARCH-ONLY.
- Challenge URL: https://www.spaceappschallenge.org/2026/challenges/health-monitoring-software/ (SEARCH-ONLY; the page itself was not fetched).
- Event page: https://www.spaceappschallenge.org/2026/ (SEARCH-ONLY). Search snippet says registration runs until the hackathon closes on **November 15**. Team size max 6.
- Objectives, listed datasets, and judging criteria: **NOT VERIFIED**. The brief page could not be read. Check it directly before finalizing.
- **Update (orchestrator, FETCHED via in-app browser, 2026-11-14):** the page opened. Paraphrased:
  - Goal: software that gathers health indicators so astronauts can evaluate and act on their own health status.
  - Indicators named as useful: blood pressure, heart rate, blood sugar, body temperature, daily sleep hours, mood (exactly TOUCHDOWN's six).
  - Objective: a visual tool for self-assessment that also gives guidance on treatments and health improvements.
  - Questions to consider: which measurements work in space, when a result needs crew or flight-surgeon attention, what actions prevent a critical condition.
  - UI suggestion: a clickable human figure showing each body part's function and status (TOUCHDOWN Body Map).
  - Optional ideas: different environments (spacecraft, base on another planet), prompts for routine measurements, gamification, dynamic charts over time, color coding, simple instructions.
  - Resources tab lists only: NASA 5 Hazards, NASA Risks of Human Spaceflight, Ongoing HRP Research, CSA radiation monitoring, CSA why science in space (already covered in research/raw/01-05).
  - Page banner says the hackathon "is happening now". No judging criteria on this page.
- Other 2026 team pages in search results that overlap the same topic: AstroGuard AI (AI-powered health monitoring and early warning). Use only as a competitive reference, not as a source of requirements.

**Use in demo/slides**
- Confirm the challenge brief on the official page before the deck, since the snippet lacks requirements. Registration may close Nov 15, so check urgency with the team.
- Cite the challenge title exactly as the official page shows it.

---

## b) Mars mission parameters

### b1. Earth-Mars one-way light time
- Range commonly cited: about **3 to 22 minutes** one-way (about 3 min at closest approach, about 22 min at farthest). Status: UNVERIFIED as a NASA primary figure.
- Sources in search results:
  - https://ntrs.nasa.gov/api/citations/20250003885/downloads/NASA%20TM20250003885.pdf (NASA TM 2025-003885, "Assessment of the State of Communication Delay"). SEARCH-ONLY. Snippet says up to 22 min one-way (44 min round trip). PDF text not readable.
  - https://arxiv.org/pdf/2304.01150 (third party). Says "between 3 and 22 minutes". Not NASA.
  - https://mars.nasa.gov/mgs/faqs/faq_mplan.html (Mars Global Surveyor FAQ). SEARCH-ONLY. Snippet: as little as 4 min (78 million km), up to 21 min (377 million km). Older mission figure; use to show the lower bound varies by source.
- NASA Mars comm study snippet (SEARCH-ONLY): longest delay just over 20 min one-way, about 100 days after Mars arrival.
- Team SPEC uses 3 to 22 min (SPEC section 7). This is consistent with the sources above. The lower bound is 3 min in most sources, 4 min in the older MGS FAQ.

**Use in demo/slides**
- Keep the 3-22 min range in the UI, with a footnote saying the value depends on orbital position.
- Before the pitch, pull the figure from the TM 2025-003885 PDF in a browser to replace SEARCH-ONLY wording.

### b2. Mars surface gravity (0.38 g)
- Mars surface gravity is about 3/8 of Earth's (0.38 g). Status: FETCHED.
- Source (FETCHED): https://www.nasa.gov/humans-in-space/walk-the-line-nasa-studies-physical-performance-after-spaceflight. Page says Mars is "62 percent lower gravity than Earth". This matches 0.38 g.
- Source (FETCHED): https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/. Says Mars gravity is "about three-eighths of Earth's".
- Gap (per SPEC, VERIFIED earlier by team): effects of 0.38 g are not directly studied in humans. Source: NASA HRP gap GapMA-101 (not fetched in this session).

**Use in demo/slides**
- Use "three-eighths of Earth gravity" (NASA wording) for the Mars-walk slide. Cite the 2022 NASA article.

### b3. Transit duration and conjunction-class timeline (DRA 5.0)
- DRA 5.0 conjunction-class architecture: six crew per opportunity, three consecutive opportunities, long-stay trajectories. Status: SEARCH-ONLY.
- Transit to Mars about **180 days** each way (crew transit ~180 d). Status: SEARCH-ONLY.
- Surface stay: **conflicting** figures in search snippets. Executive summary table says about **540 days**; companion presentation says about **500 days**. Not resolved. Status: UNVERIFIED.
- Sources (SEARCH-ONLY):
  - https://ntrs.nasa.gov/api/citations/20090010571/downloads/20090010571.pdf
  - https://www.nasa.gov/pdf/373669main_2008-12-04_Mars_DRA5_Executive_Summary-Presentation.pdf
- Team SPEC uses 6 months (~180 d) transit and landing day T = 210 (demo-only mission day, not a DRA figure).

**Use in demo/slides**
- Say "about six months transit" with a source. Do not state the surface-stay number until the conflict is resolved.
- Note that the app's landing day (210) is an app parameter, not a NASA value.

---

## c) Post-landing operations and unassisted tasks

### c1. Readiness tests after landing (FETCHED)
- Source: https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/ (NASA article, dated Apr 12, 2022, FETCHED).
- Quote (13 words): "need to be ready to act without much feedback from operators on Earth."
- Simulated capsule egress: a few hours after landing. Crew unfurl and secure a ladder, climb, descend, and walk about 25 feet without described outside help.
- Simulated planetary spacewalk: about one day after landing, in a Mars-gravity ARGOS offload system. Crew don a suit unassisted before the walk.
- Measured: verbal feedback, exertion surveys, heart rate and energy expenditure, pre/post video comparison.
- Article: "Those shifts in posture are the hardest things for crew to do." (FETCHED.)

**Use in demo/slides**
- Timeline graphic: "egress ~hours after landing, Mars walk ~1 day after" for the Level 1 and Level 2 framing in TOUCHDOWN.
- Justify the "handle it myself" default for posture and balance tasks, citing this article.

### c2. Balance and functional performance after flight (FETCHED)
- Source: https://www.nasa.gov/humans-in-space/nasas-one-year-mission-investigates-how-space-affects-astronauts-functional-performance (FETCHED).
- Tasks that depend on balance "changed the most as a result of spaceflight." (Quoted, 7 words.)
- Tasks with lower balance demand "showed little reduction in performance." (Quoted, 8 words.)
- Article does not say how long recovery takes.
- Source: https://www.nasa.gov/humans-in-space/walk-the-line-nasa-studies-physical-performance-after-spaceflight (FETCHED). Post-landing impairments listed include loss of postural stability and vision/perception problems. Duration of deficits not stated.

**Use in demo/slides**
- Post-landing balance is the biggest risk. Map this to the body-map "inner ear/balance" region.

### c3. Time before assistance / CIPHER egress study (SEARCH-ONLY)
- NASA CIPHER Egress Fitness study (IWS 2024): https://ntrs.nasa.gov/api/citations/20240001296/downloads/H3PO_CIPHER%20Egress%20Fitness_IWS%202024.pdf. SEARCH-ONLY. Post-flight capsule egress 1-4 h after landing; planetary EVA sim 18-36 h after landing; follow-ups R+1, R+4, R+8.
- Pilot study: baseline and post-flight testing done on four crewmembers. Status: SEARCH-ONLY.
- "Up to 1 week" functional deficit after long-duration ISS flight. Status: UNVERIFIED (search summary; source Frontiers in Physiology 2022 link not opened).

**Use in demo/slides**
- Use the 1-4 h and 18-36 h windows as "time before any outside help is possible" only if the NTRS PDF is confirmed. Until then, cite the 2022 NASA article.

---

## d) Earth Independent Medical Operations (EIMO) and in-mission medical autonomy

### d1. HRP risk: in-mission medical conditions (FETCHED)
- Risk title: "Risk of Adverse Health Outcomes and Decrements in Performance Due to Medical Conditions" (Human Research Roadmap, risk i=95). Source: https://humanresearchroadmap.nasa.gov/Risks/?i=95. Page last published 05/13/25 (FETCHED).
- Quote (fetched, 9 words): "designed for use in progressively Earth Independent Medical Operations (EIMO)"
- Quote (fetched, 12 words): "tools and training that enable astronauts to perform medical functions autonomously."
- Page states past medical systems relied on real-time telemedical support, which deep-space missions will lack. Paraphrase, FETCHED.
- Page cites "reduced communication with Earth" as a challenge beyond low Earth orbit. Paraphrase, FETCHED.
- Integrated Medical Model (IMM) provides probabilistic risk estimates for in-mission medical risk. Paraphrase, FETCHED. Note: the search snippet of the HRR says the IMM covers about 100 conditions. Status: UNVERIFIED.
- Note: the risk title in the brief ("...that occur in Mission") did not match the fetched page exactly. The fetched title is shorter. Use the official wording from the page.

**Use in demo/slides**
- Slide quote: "progressively Earth Independent Medical Operations" (NASA HRP, fetched). Supports the Level 3 "Contact Earth" design.

### d2. Communication delay for medical emergencies (SEARCH-ONLY / UNVERIFIED)
- Surface-stay delay of 20 to 40 min one-way. Source: NASA-hosted slide/decadal material (https://ntrs.nasa.gov/api/citations/20210023828/downloads/...). SEARCH-ONLY. Status: UNVERIFIED.
- Snippet quote: "In-flight medical emergencies under time-delayed communication conditions represent a significant risk for mission failure." Source not opened. Status: UNVERIFIED; verify before quoting.
- HRP 2025 IWS communication-delay material (https://ntrs.nasa.gov/api/citations/20250000703/downloads/2025%20HRP%20IWS%20Comm%20Delay.pdf): the PDF was unreadable via fetch. SEARCH-ONLY.
- Assessment of the State of Communication Delay Research (NASA TM 2025-003885): snippet says small samples and limited repeatability in delay research. SEARCH-ONLY.
- ISS behavioral study: 3 ISS crew and 18 support personnel, tasks with and without a 50 s one-way delay. Snippet only. SEARCH-ONLY.

**Use in demo/slides**
- Comm-delay timer slide: cite the 20-40 min figure only after the source PDF is read.
- Use the ISS 50 s delay study as a note that delay affects teamwork (SEARCH-ONLY).

### d3. Decision support (SEARCH-ONLY)
- HRP Exploration Medical Capability (ExMC) covers software diagnostic and treatment aids and onboard decision support. Status: SEARCH-ONLY (HRR evidence/explore pages in search results).
- 2024 HRP-linked piece on clinical decision support for EIMO: https://phys.org/news/2024-04-clinical-decision-earth-independent-medical.pdf. SEARCH-ONLY.
- NASA and Google AI medical assistant for Mars-bound crews (TechCrunch, 2025-08-08). SEARCH-ONLY. Ejenta snippet says NASA is not developing in-flight software for it. Treat as UNVERIFIED.

**Use in demo/slides**
- Positioning: TOUCHDOWN is an offline decision-support aid, not a diagnostic tool. Cite the HRR ExMC decision-support goal (SEARCH-ONLY).
- Avoid claiming NASA builds this software; the Ejenta snippet says it does not.

---

## 5 pitch-ready facts

1. Mars surface gravity is "about three-eighths of Earth's." Source: NASA, New Tests Evaluate Mission Readiness of Astronauts Upon Landing, https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/ (FETCHED).
2. Crews must "be ready to act without much feedback from operators on Earth." Source: same NASA article (FETCHED).
3. NASA's HRP says deep-space medical systems must be built for "progressively Earth Independent Medical Operations." Source: https://humanresearchroadmap.nasa.gov/Risks/?i=95 (FETCHED; page dated 05/13/25).
4. Capsule egress is tested a few hours after landing and the Mars-gravity walk about a day after. Source: NASA article above (FETCHED; 2022).
5. Earth-Mars one-way light time runs about 3 to 22 minutes, which is the basis for the comm-delay timer. Source: NASA TM 2025-003885, https://ntrs.nasa.gov/api/citations/20250003885/downloads/NASA%20TM20250003885.pdf (SEARCH-ONLY; confirm the figure before using as a NASA quote).

---

## Open items
- Confirm the Space Apps challenge brief (objectives, data, judging). Registration may close Nov 15.
- Resolve the DRA 5.0 surface-stay conflict (540 vs 500 days).
- Read the NASA TM 2025-003885 PDF and the HRP IWS communication-delay PDF in a browser, then replace SEARCH-ONLY items.
- Verify the 20-40 min surface-stay delay figure and the "up to 1 week" deficit claim.
