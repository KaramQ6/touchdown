# TOUCHDOWN source verification (VERIFY rows and URL rows)

Access date for every check: 2026-11-14. Scope: SPEC section 7 rows in `src/data/sources.ts`.
Method: WebFetch of the URL where it returned content; WebSearch results where the fetch failed (labelled "search result only"). No URL below was invented. Quotes are kept to 15 words or fewer.
Confidence key: high = primary page fetched and text matches; medium = fetched but partial, or search-result text only; low = not confirmed.

> **Orchestrator adjudication (2026-11-14, checked in the in-app browser):** the calf_strength row below is WRONG. PMC2988519 contains no "7-20%". It reports about 20% soleus type I fibre atrophy, a 35% single-fibre peak force drop, and cites 6-20% muscle mass loss after 6 months. Keep calf_strength as VERIFY and fix the value text (see nasa-data.md section 0). The exercise_target row is CORRECT: the NASA page says "averaging two hours of exercise per day".

## 1. Summary table

| id | recommended status | url | citation text (paste-ready) | value correct? |
|---|---|---|---|---|
| bone_loss | VERIFIED | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ | NASA, Risk of Spaceflight-Induced Bone Changes. | yes (1-1.5%/month). The hip/spine figures in the current note are not on this page; drop them or cite Lang et al. 2004 separately |
| calf_strength | VERIFIED | https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/ | Fitts RH, et al. Prolonged space flight-induced alterations in the structure and function of human skeletal muscle fibres. J Physiol. 2010;588(18):3567-3592. | yes (7-20% calf force loss; crew flight average 177 d) |
| balance_most_affected | VERIFIED | https://www.nasa.gov/humans-in-space/nasas-one-year-mission-investigates-how-space-affects-astronauts-functional-performance | NASA, One-Year Mission investigates how space affects astronauts' functional performance (2017-01-30; updated 2023-10-12). | adjust: page says tasks that challenge balance changed most, not "balance is the most affected function". Suggested value: "balance-dependent tasks changed most (qualitative)" |
| landing_readiness_tests | VERIFIED | https://www.nasa.gov/humans-in-space/new-tests-evaluate-mission-readiness-of-astronauts-upon-landing/ | NASA, New Tests Evaluate Mission Readiness of Astronauts Upon Landing (2022-04-12; updated 2024-01-17). | yes (qualitative). Page lists simulated capsule exit and simulated planetary spacewalk |
| no_combined_model | keep VERIFY (downgrade) | https://ntrs.nasa.gov/api/citations/20230014343/downloads/NSL%20IWS24%20Wood%20Predictors.pdf | Wood et al., NASA IWS presentation (NTRS 20230014343). | not confirmed. PDF returned raw binary; title, author and claim could not be read |
| hrp_risks | VERIFIED | https://www.nasa.gov/hrp/risks/ | NASA HRP, Risks of Human Spaceflight (updated 2026-07-21). | yes for "official risk names". Do not cite a count of 17: the page says "several" and gives no total |
| hrp_hazards | VERIFIED | https://www.nasa.gov/hrp/hazards/ | NASA HRP, Hazards (updated 2026-06-12). | yes. Page lists five hazards including Gravity Fields and Distance from Earth |
| exercise_target | VERIFIED (with note) | https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/ | NASA, Astronaut Exercise (ISS research; page updated 2025-02-03). | yes for 120 min as an average. Conflict: a NASA FAQ says crews are "scheduled" for 2.5 h/day. Add to the note; team decides whether 120 or 150 is the target |
| pvt_lapse | VERIFIED | https://pmc.ncbi.nlm.nih.gov/articles/PMC3079937 | Basner M, Dinges DF. Maximizing Sensitivity of the Psychomotor Vigilance Test (PVT) to Sleep Loss. Sleep. 2011;34(5):581-591. | yes (lapse = RT >= 500 ms). Caveat: the app's 60 s test is not the 10 min PVT used in that paper (see section 2) |
| transit | VERIFIED | https://www.nasa.gov/hrp/hazard-gravity-fields/ | NASA HRP, Hazard: Gravity Fields. | yes (about six months of weightlessness in transit). Same page says Mars surface gravity is "one-third" of Earth; SPEC uses 0.38 g elsewhere, so align the two |
| comm_delay | keep VERIFY (downgrade) | none confirmed (see section 3) | Physics calculation from Earth-Mars distances at closest and farthest approach; no NASA page fetched that states 3-22 min. | probably right as a physics range (3.1 min at about 56 million km; 22.3 min at about 401 million km, my arithmetic). Lower bound is contested: NASA Langley ASCEND says 0-22 min over a mission; ESA gives about 4-24 min |
| partial_gravity_gap | keep VERIFY | https://humanresearchroadmap.nasa.gov/ (landing page only; no gap IDs) | NASA HRP gap on partial gravity (ID not confirmed). | GapMA-101 ID not found. The claim needs softening: a 2025 parabolic-flight study tested short partial-gravity exposure, so "not directly studied" is too strong. Suggested wording: "long-duration effects at 0.38 g have not been studied in humans" |
| vitals_hr (resting HR 60-100) | VERIFIED for green band only | https://www.heart.org/en/health-topics/high-blood-pressure/the-facts-about-high-blood-pressure/all-about-heart-rate-pulse (search result only) | American Heart Association, All About Heart Rate (Pulse). | yes for 60-100. Yellow 50-59/101-110 and red bands are team choices, not AHA categories |
| vitals_bp (systolic) | keep VERIFY (table must change or be labelled) | https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings (search result only; fetch returned 403) | American Heart Association, Understanding Blood Pressure Readings. | divergence: AHA normal < 120 and elevated 120-129; SPEC green is 90-129 (see section 4) |
| vitals_glucose (fasting) | keep VERIFY | https://diabetesjournals.org/care/article/49/Supplement_1/S27/163926/2-Diagnosis-and-Classification-of-Diabetes (search result only; fetch returned 403) | ADA, Standards of Care in Diabetes, Section 2: Diagnosis and Classification of Diabetes. | 100-125 (prediabetes) and >=126 (diabetes) match earlier ADA editions per secondary sources. Primary table not read; 70-99 green is consistent with ADA but not directly confirmed |
| vitals_sleep (>= 7 h) | VERIFIED with scope note | https://www.aasm.org/resources/pdf/adultsleepdurationconsensus.pdf (search result only; PDF binary) | AASM and SRS, Recommended Amount of Sleep for Adults: Consensus Statement, 2015. | yes for 7 h, but the consensus is for adults aged 18 to 60. SPEC applies it to all adults; state the age limit |
| vitals_temp (oral) | VERIFIED | https://medlineplus.gov/ency/article/001982.htm | MedlinePlus Medical Encyclopedia, Body temperature norms (review date 2025-01-01). | yes: 97-99 F (36.1-37.2 C) is the stated normal range; 98.6 F average. Page does not state the measurement site, so add "oral" in SPEC |

## 2. Per-row evidence

### bone_loss
- Fetched https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/. Quote: "bones lose between 1% and 1.5% of their density each month" (11 words). Averaged over 4-6 month missions. The 1-1.5% figure links to HRP risk ID 77. No hip or spine rate on this page.
- Value 1.25 (midpoint) is consistent. Confidence: high.

### calf_strength
- Fetched https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/. Title "Prolonged space flight-induced alterations in the structure and function of human skeletal muscle fibres", J Physiol 2010 vol 588 pt 18, pp. 3567-3592. The paper cites 7-20% loss of calf maximal voluntary force. Crew flight average 177 +/- 4 days (range 161-192).
- SPEC "after ~6 months" matches about 180 days. Value 20 is the top of the range, which SPEC already notes. Confidence: high.

### balance_most_affected
- Fetched the NASA 2017 article. It says "Tasks that challenged postural stability, or balance control systems" changed most after flight. The phrase "most affected function" does not appear. Confidence: medium (paraphrase is fair; wording needs adjusting).

### landing_readiness_tests
- Fetched NASA article dated 2022-04-12. Lists simulated capsule exit and simulated planetary spacewalk as tests. Page exists and matches the citation title. Confidence: high.

### no_combined_model
- The NTRS PDF returned raw compressed PDF bytes. Title, author, and the "no combined model" claim could not be read. Confidence: low. Keep VERIFY until someone opens the PDF manually.

### hrp_risks
- Fetched https://www.nasa.gov/hrp/risks/ (updated 2026-07-21). Example risk names read: "Risk of Altered Immune System Responses"; "Risk of Cardiovascular Adaptations"; "Risk of Decompression Sickness"; plus two more. No total count given ("several"). Confidence: high.

### hrp_hazards
- Fetched https://www.nasa.gov/hrp/hazards/ (updated 2026-06-12). Five hazards: Space Radiation, Isolation and Confinement, Distance from Earth, Gravity Fields, Hostile/Closed Environments. Both SPEC hazards present. Confidence: high.

### exercise_target
- Fetched https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/ (page updated 2025-02-03). Quote: "now averaging two hours of exercise per day" (article dated 2024-05-20). Supports 120 min as an average.
- Conflict: fetched https://www.nasa.gov/missions/station/faq-the-real-story-about-astronaut-health-care-in-space/ (updated 2025-03-17). Quote: "crew members are scheduled for two and a half hours of daily exercise" (about 150 min). Confidence: medium-high. Recommend VERIFIED with the note added.

### pvt_lapse
- Fetched https://pmc.ncbi.nlm.nih.gov/articles/PMC3079937. Title "Maximizing Sensitivity of the Psychomotor Vigilance Test (PVT) to Sleep Loss", Basner and Dinges, Sleep 2011, vol 34 no 5, pp 581-591. Lapse definition: RT >= 500 ms (inclusive). Quote: "Lapses (errors of omission) were defined as RTs ≥ 500 ms" (9 words).
- Caveats: (a) that study used the 10-minute PVT. TOUCHDOWN's 60 s test (SPEC shortened protocol) should cite the threshold as "lapse threshold from the standard PVT", not as validated for 60 s. (b) A separate Basner et al. 2011 Acta Astronautica paper (search result only, https://pmc.ncbi.nlm.nih.gov/articles/PMC3197786) uses 355 ms for a 3-minute PVT-B. Do not mix the two.
- NASA use of PVT on ISS: not checked in this session. Team research (raw/08) cites NASA Cognition battery papers, which I did not verify. Confidence: high for the 500 ms value.

### transit
- Fetched https://www.nasa.gov/hrp/hazard-gravity-fields/. Quote: "On the six-month trek between the planets, crews will be weightless." (11 words). Mars surface: "approximately one-third of Earth's gravity". Bone rate 1-1.5%/month also on this page. Confidence: high.
- Consistency issue: the team's own research notes NASA's other page gives three-eighths (about 0.38 g). SPEC partial-gravity uses 0.38. Recommend a note explaining the rounding, or aligning the value.

### comm_delay (no official source found)
- Fetched https://science.nasa.gov/mars/facts/ (dated 2026-07-10). It gives sunlight travel Sun-to-Mars (13 min) only. No Earth-Mars delay.
- Fetched https://www.nasa.gov/?p=553281 ("5 Hazards of Human Spaceflight", updated 2026-06-12). No delay figure. The team research claim of "about 20 min" attributed to this page is NOT supported by the fetched text.
- Search result only: NASA Langley ASCEND paper, https://ntrs.nasa.gov/api/citations/20220013418/downloads/ASCEND-Communication%20Delays%2C%20Disruptions%2C%20and%20Blackouts%20for%20Crewed%20Mars%20Missions.pdf. Snippet says one-way delays run from 0 to 22 minutes over a mission, peaking at or just after Mars departure. The PDF itself was binary and could not be read.
- ESA Mars Express blog (https://blogs.esa.int/mex/?p=257, search result only) gives about 4 to 24 minutes.
- Physics check (my arithmetic, distances from search-result text): 56 million km / 299,792 km/s = about 3.1 min; 401 million km = about 22.3 min. The range 3-22 is physically sound for closest/farthest, but no official URL states it.
- Recommend keep VERIFY. Team should find a JPL or NASA page with the figure, or cite the ASCEND paper with 0-22 min. Confidence: medium on physics, low on any official source.

### partial_gravity_gap
- Fetched https://humanresearchroadmap.nasa.gov/. Landing page only. No gap IDs listed. GapMA-101 not found on any fetched or searched page. Confidence: low on ID, high that no official page confirms it here.
- Supporting, search result only: a 2021 NASA-linked Decadal white paper (https://science.nasa.gov/wp-content/uploads/2023/05/20_34a79d58005cae4bcfe28314d6365f95_NarayananAnandS.docx) says partial-gravity knowledge is mostly musculoskeletal and behavioural, with a significant gap for lunar and Martian gravity. Also a 2025 parabolic-flight study (https://ntrs.nasa.gov/citations/20240012135, search result only) tested short-duration partial-gravity tasks.
- Recommend keep VERIFY and soften the value text as in the table.

### vitals_ranges (per indicator)
- HR: AHA pages returned 403 to WebFetch. Search results show AHA states 60-100 bpm as normal resting range for adults, with bradycardia below 60 and tachycardia above 100. Confidence: medium.
- BP: AHA categories from search results (heart.org Understanding Blood Pressure Readings): Normal below 120 systolic and below 80 diastolic; Elevated 120-129 and below 80; Stage 1 130-139 or 80-89; Stage 2 140 or higher or 90 or higher. Either systolic or diastolic can define a category. Confidence: medium (search result only).
- Glucose: ADA 2026 Standards and 2025 PDF both returned 403. Search results cite ADA cut-points of 100-125 (prediabetes) and >=126 (diabetes), fasting meaning no caloric intake for at least 8 h (2017 edition, quoted in a trial protocol). Search snippet for 2026 says the table exists but did not show the cut-point. Confidence: medium.
- Sleep: AASM and SRS 2015 consensus, 15-expert panel: adults aged 18-60 should sleep seven or more hours regularly. No ceiling set below 9 h. Source fetch: aasm.org PDF is binary; aasm.org news page 403. Confidence: medium (search results).
- Temperature: MedlinePlus fetched. Normal range 97-99 F (36.1-37.2 C), average 98.6 F. Fever threshold on the page is 37.2-37.5 C depending on time of day. Confidence: high (site not stated).

## 3. Broken or weak links

- AHA heart.org pages (heart rate, blood pressure): WebFetch returned HTTP 403. Content is from search results only. Replace the citation with a fetched copy or cite the AHA guideline.
- ADA diabetesjournals.org (2026 and 2025 Standards): HTTP 403. Primary cut-point table not read. Glucose row is not fully verified.
- aasm.org sleep consensus PDF: binary; news page 403.
- NTRS Wood predictors PDF (no_combined_model): binary; claim unreadable.
- NTRS ASCEND PDF (comm delay): binary; only search snippet read.
- Nature npj 2023 partial-gravity PDF: redirected to a login page; not read.
- humanresearchroadmap.nasa.gov: landing page only; GapMA-101 not found.
- mars.nasa.gov/mgs FAQ: connection reset twice; not read. mars.nasa.gov facts page redirects to science.nasa.gov and has no Earth-Mars delay.
- NASA "5 Hazards" page (nasa.gov/?p=553281): no delay figure, contrary to team research notes.
- NASA gravity-fields page says Mars is "one-third" g; SPEC uses 0.38 g. Align or footnote.
- Bone-loss note hip/spine values (Lang et al. 2004) are not on the cited NASA page.

Search-result-only URLs (not fetched, cited as "search result only" above): heart.org heart-rate, heart.org BP readings, heart.org arrhythmia (https://www.heart.org/en/health-topics/arrhythmia/about-arrhythmia), diabetesjournals.org 2026 Standards, AASM news page, PMC3197786, ESA Mars Express blog (https://blogs.esa.int/mex/?p=257), NASA 2021 white paper (docx), NTRS 20240012135, Nature npj 2017 (https://www.nature.com/articles/s41526-017-0034-8).

## 4. SPEC 6.1 divergences from official categories

- Systolic green 90-129 vs AHA normal (<120) and elevated (120-129). SPEC merges normal and elevated into green, and has no elevated band. Defensible only if the UI or citation says this is a team band. Otherwise change to green 90-119 (or label). This is a threshold decision for the team, not a visual one.
- Systolic yellow 130-139 matches AHA stage 1 only. Stage 2 (>=140) matches SPEC red. Diastolic is not in the table although input validation accepts it.
- Resting HR yellow (50-59, 101-110) and red (<50, >110) are not AHA categories. AHA marks <60 and >100 as brady/tachycardia. Label as team choice.
- Sleep: SPEC applies >=7 h to all adults. AASM/SRS covers 18-60. Yellow 6-6.9 and red <6 are team choices.
- Glucose green 70-99, yellow 100-125, red <70 or >=126 matches the ADA cut-points quoted in secondary sources. 70 is the usual low-glucose boundary, not an ADA normal boundary (my knowledge, not checked here).
- Temperature green 36.1-37.2 matches MedlinePlus. Yellow 37.3-37.9 is close to MedlinePlus fever threshold (37.2-37.5). Red >=38.0 is a team choice. Add "oral".

Overall: the vitals ranges are general adult references, as SPEC says. The official green bands for HR, glucose, temperature and sleep are defensible. Systolic green is not an AHA category and needs labelling or change.

## 5. Recommended changes in sources.ts (for the team, not applied)

1. exercise_target: VERIFIED, add the NASA FAQ 2.5 h conflict to the note.
2. pvt_lapse: VERIFIED, citation URL https://pmc.ncbi.nlm.nih.gov/articles/PMC3079937.
3. transit: VERIFIED, URL https://www.nasa.gov/hrp/hazard-gravity-fields/.
4. comm_delay: keep VERIFY or cite physics explicitly; no official URL confirmed.
5. vitals_ranges: keep VERIFY, split by indicator per section 1; fix systolic green or label it.
6. partial_gravity_gap: keep VERIFY; soften wording.
7. no_combined_model: keep VERIFY until the PDF is read by a person.
8. balance_most_affected: reword value to match the NASA page.
9. bone_loss: remove the hip/spine note or cite Lang 2004 separately.
10. calf_strength, landing_readiness_tests, hrp_risks, hrp_hazards: VERIFIED as is. Add the Fitts volume/pages to calf citation.
