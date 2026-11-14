# TOUCHDOWN: NASA data research

Date: 2026-11-14. Scope: quantitative, citable NASA data for `docs/SPEC.md` section 4 (M, S, V) and the source sheet in `src/data/sources.ts`. Team research in `research/` was read first. This file adds only what is new or more specific. No existing file was modified.

Evidence tags used below:
- [V] read from a primary page or full text.
- [V-abs] read from an abstract or repository record. Full text not read.
- [S] seen only in a search-result summary or press release. Not checked against the paper.
- [T] team research (`research/`), not re-verified in this session.
- [U] could not verify: blocked, redirect dead end, or not found.

No direct quotes are used. Everything is paraphrased.

---

> **Orchestrator adjudication (2026-11-14, checked in the in-app browser):**
> - exercise_target: item 2 below is WRONG. https://www.nasa.gov/missions/station/iss-research/astronaut-exercise/ says crew members are "now averaging two hours of exercise per day". 120 min/day is supported; status can be VERIFIED (see verify-links.md).
> - calf_strength: item on "7-20%" below is CORRECT. PMC2988519 (Fitts 2010) contains no "7-20%". It reports about 20% soleus type I fibre atrophy, a 35% single-fibre peak force drop, and cites 6-20% muscle mass loss after 6 months.

## 0. Corrections to existing source entries (read first)

1. **calf_strength is mis-cited.** SPEC section 7 and `sources.ts` mark "7-20% peak force loss after ~6 months" as VERIFIED, citing Fitts et al. 2010 (PMC2988519). The Fitts full text reports single-fibre force losses (type I about 25-35%) and fibre size losses. It does not report a group whole-muscle 7-20% figure. It attributes the 7-20% calf MVC range to a companion paper on the same crew, with no group mean. The Trappe 2009 record read here does not contain 7-20% either. Suggestion: keep the value, change status to VERIFY, cite the companion paper once located.
2. **exercise_target (120 min/day) is not supported by the NASA citation.** SPEC says NASA states about 2 h/day. No source read says this. A search summary of Trappe 2009 reports about 5 h/week aerobic plus resistance 3-6 days/week [S]. Keep VERIFY.
3. **pvt_lapse (500 ms) needs a qualifier.** 500 ms is the lapse convention for the 10-minute PVT. NASA's on-orbit 3-minute PVT-B (Reaction Self-Test) counts lapses at RT >= 355 ms [V]. The PVT-B validation paper (Basner, Mollicone, Dinges 2011, Acta Astronautica) moved the threshold from 500 to 355 ms [S]. TOUCHDOWN's 60 s test is neither protocol. The team must pick one threshold and cite it.
4. **exercise_halves_loss (factor 0.5) has no measured source.** The closest data, ARED (Sibonga 2019), show partial, site-dependent protection [V-abs]. Keep ASSUMPTION and reword the note.
5. **bone_loss note needs a citation change.** The site split ("hip ~1.4-1.5%, spine ~0.9%") is in Lang et al. 2004 [V-abs]. The NASA reference page gives only the 1-1.5%/month average [V]. Cite Lang for the site split.

---

## 1. Top 10 findings for the pitch and source sheet

1. **Sleep limits PVT speed in flight (C1).** In-flight sleep averaged 6.5 h against an 8.5 h schedule. Nights of 6 h or less were linked to slower PVT-B response speed. n=24 ISS astronauts, about 160-day missions. Supports the S-V coupling in the model. [V]
2. **Functional recovery takes days after landing (F1).** Full sensorimotor and functional recovery is stated to need about 6 to 16 days after landing. n=18 for most measures. This is the main caveat for "walk out on landing day". [V-abs]
3. **Bone loss is site-specific (B1).** Spine areal BMD about 0.9%/month; hip areal BMD about 1.4-1.5%/month. n=14, 4-6 month missions. The model's 1.25 is a between-site composite. [V-abs]
4. **Bone does not fully recover quickly (B3).** 9 of 17 ISS crew did not regain total tibial BMD at 12 months. Longer flights recovered less. [S]
5. **Calf volume falls about 13% (M1).** MRI calf volume down 13% (soleus 15%, gastrocnemius 10%) and peak power down 32% after about 6 months. n=9. [V]
6. **Per-fibre calf force falls 25-35% (M2).** Type I soleus and gastrocnemius single-fibre force fell about 25-35%. Specific force was unchanged, so atrophy was the driver. Same n=9 cohort. [V]
7. **ARED gives partial bone protection (B5).** Protected femoral-neck cortical and areal BMD, not hip trabecular BMD. No spine benefit without alendronate. n=10 ARED crew, historical comparison. [V-abs]
8. **Lower-leg loss, ARED era (B4, M3).** n=46, 178 +/- 48 days. Lower-leg size and leg strength fell; upper-body strength did not. More resistance volume was associated with better lower-leg outcomes. [V] for the design; [S] for the volume association.
9. **Systolic BP is lower in flight (V1).** 24-hour systolic mean 120 mmHg before flight, 106 in flight, 122 after landing. 0 of 12 had orthostatic intolerance during daily activities. n=12, 6 months. [V-abs]
10. **Landing-day HR rises during functional tasks (V3).** HR was above pre-flight in 8 of 11 functional tasks on landing day, back to pre-flight by day 30. n=5, 10-15 day shuttle missions only. [V-abs]

---

## 2. Per-topic findings

### 2.1 Bone (B)

**B1. Site-specific bone loss, 4-6 month ISS missions.** [V-abs]
- Population: n=14 ISS crew (13 men, 1 woman, aged 40-55), 4-6 month missions. Lang T et al. 2004, J Bone Miner Res 19(6):1006-1012.
- Numbers (monthly percent change): spine aBMD 0.9 (p<0.001); spine integral vBMD 0.9; spine trabecular vBMD 0.7 (p<0.05); hip aBMD 1.4-1.5 (p<0.001); hip integral vBMD 1.2-1.5; hip cortical vBMD 0.4-0.5; hip trabecular vBMD 2.2-2.7; calcaneus aBMD 0.4.
- Source: https://pubmed.ncbi.nlm.nih.gov/15125798/ (values read from the Europe PMC record: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:15125798&resultType=core&format=json).
- Maps to: B(d) = 1.25 %/month. 1.25 lies between spine (0.9) and hip aBMD (1.4-1.5). It is a composite, not a site value. Hip trabecular loss (2.2-2.7) is well above it.
- Implication: no formula change. Relabel the bone note as a between-site composite. Lang covers only 4-6 months; extending the linear model to d=210 (about 7 months) is an assumption.

**B2. NASA reference page on bone changes.** [V]
- Population: not stated; the rate is given for missions of about 4-6 months.
- Numbers: average density loss of 1 to 1.5% per month. No site rates, no annual rate, no recovery timeline.
- Source: https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/
- Maps to: confirms the 1-1.5 range, so 1.25 is the centre of NASA's stated range. NASA says the long-duration rate needs more research, so the model's extension is an assumption. Resistive exercise is said to reduce post-flight deficits. ARED is not named. Bisphosphonates are said to help mitigate some loss (not a model input).

**B3. Incomplete bone recovery one year after return.** [S]
- Population: n=17 (mostly men, mean age about 47). HR-pQCT of distal tibia before flight, at return, and at 6 and 12 months. Gabel et al., Sci Rep 2022, DOI 10.1038/s41598-022-13461-1. Summary seen at https://doaj.org/article/66f343f830484db896f2ef767ece0c1a. Full text not read.
- Numbers: at 12 months, group median tibial strength and BMD still about 0.9-2.1% below pre-flight. 9 of 17 did not fully regain total tibial BMD. Flights longer than 6 months: strength about 3.9% below pre-flight at 12 months. Shorter flights: about 0.4% below.
- Maps to: bone recovery after landing, which the model does not represent. Supports that bone deficits outlast a landing-day score.
- Implication: no formula change. Tibia is not hip or spine. Check table values before quoting. Do not use press comparisons such as "two decades of aging".

**B4. Bone and lower-leg outcomes, ARED era, n=46.** [V] Scott et al. 2023, npj Microgravity 9:11, DOI 10.1038/s41526-023-00256-5. Full text: https://pmc.ncbi.nlm.nih.gov/articles/PMC9898566
- Population: n=46 (37 men, 9 women), mission 178 +/- 48 days. MRI subset n=12.
- Numbers: mean BMD decline 2.1 +/- 0.7% to 3.7 +/- 0.6% (site breakdown in Fig. 1d, not read). Trabecular bone content decline 5.3 +/- 1.6% to 8.5 +/- 2.5%. Lower-leg cross-sectional area and lower-body strength decreased significantly; upper-body strength did not. VO2peak fell 7.4 +/- 2.0% [S].
- Maps to: B and M (lower leg), and the exercise lever.
- Implication: these are mission-level declines. 1.25%/month over 6 months would be about 7.5%. The measure, site and time base are not stated in the text. Do not change 1.25 until Fig. 1d is read. Lower-body strength was measured by leg press, not plantar flexors.

**B5. ARED protection on ISS, n=10.** [V-abs] Sibonga et al. 2019, Bone 128:112037, DOI 10.1016/j.bone.2019.07.013. Record: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=DOI:10.1016/j.bone.2019.07.013&resultType=core&format=json
- Population: 10 ISS crew on ARED alone. Comparison is historical (14-18 pre-ARED crew), not concurrent. Mission length of the ARED group not stated; authors say durations did not differ significantly.
- Results (qualitative): ARED prevented declines in femoral-neck cortical vBMD and areal BMD; did not prevent hip trabecular vBMD decline; partly attenuated hip bone mass decline; no spine benefit without alendronate.
- Maps to: exercise_halves_loss (0.5). The evidence shows partial, site-dependent protection, not a clean halving. Keep ASSUMPTION.
- Could not verify: percentages (full text not read) [U].

### 2.2 Muscle (M)

**M1. Calf volume and power, 6-month ISS, n=9.** [V] Trappe et al. 2009, J Appl Physiol 106(4):1159-1168, DOI 10.1152/japplphysiol.91578.2008. Accepted-manuscript record: https://epublications.marquette.edu/bio_fac/24/
- Population: 9 ISS crew (of 10), mean age about 45, about 6 months (177 +/- 4 days per the Fitts 2010 description).
- Numbers: calf volume (MRI) -13 +/- 2% (soleus -15 +/- 2%, gastrocnemius -10 +/- 2%). Peak power -32%. Force-velocity performance -20 to -29% across velocities. Shift toward faster fibre types.
- Exercise (search summary [S]): aerobic about 5 h/week; resistance 3-6 days/week.
- Maps to: Mu(d). Group calf volume loss at about 6 months is 13%. The model's 20% is above the group volume mean.
- Implication: the 7-20% strength statement is not on this page (see section 0).

**M2. Single-fibre force and fibre size, same cohort.** [V] Fitts et al. 2010, J Physiol. https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/
- Population: n=9 analysed (of 10 flown). Mean 177 +/- 4 days (range 161-192). Biopsies pre-flight and on landing day (about 6-8 h after landing). Values are means +/- s.e.m.
- Numbers, single-fibre peak isometric force: soleus type I about -35%; soleus type II about -27%; gastrocnemius type I about -25%; gastrocnemius type II about -7% (not significant). Fibre cross-sectional area: soleus type I about -33%; gastrocnemius type I about -24%. Force normalised to area unchanged on average.
- Maps to: Mu(d) mechanism. Per-fibre force loss exceeds whole-muscle volume loss. The 20% model value sits within the single-fibre range and above the group volume mean.
- Implication: no recovery data (one post-flight time point). Supports calling 20% an upper-end value, not a group mean.

**M3. Lower-body strength in ARED era.** See B4 (Scott 2023). Plantar-flexor strength was not measured in that study. A group plantar-flexor strength loss at 6 months was not found [U].

### 2.3 Post-landing functional performance (F)

**F1. Recovery window, Pilot Field Test, n=18.** [V-abs] Reschke et al. 2016, "Sensorimotor Results from the Joint NASA and Russian Pilot Field Test", NTRS 20150022287: https://ntrs.nasa.gov/citations/20150022287
- Population: 18 subjects for most objectives (Soyuz expeditions 34S-41S). First testing under 2 h after landing, follow-ups within 24 h.
- Numbers: significant improvement within 24 h. The abstract states full recovery needs about 6 to 16 days. No per-measure percentages.
- Maps to: the readiness question concerns landing day. This source says function is still recovering for roughly the first 1-2 weeks. The model has no post-landing term.
- Implication: suggested new source entry (section 4). Whether the pitch mentions it is an orchestrator decision.

**F2. Sit-to-stand time course, same pilot test.** [V-abs] Kofman et al. 2016, JSC-CN-34932, NTRS 20150022289: https://ntrs.nasa.gov/citations/20150022289
- Population: 18 consenting crew (11 US, 7 Russian); 2 could not attempt. Time points: about 1-2 h (10 subjects), 4-5 h (8), about 13 h (8 of 11 US astronauts), about 24 h (same 8), some crew in the first 2 weeks, and 6 astronauts at 60+ days as a delayed baseline.
- Results: steep improvement in completion time between early sessions, continuing to post-flight day 6 in some crew. Head and trunk pitch angles and rates changed across the whole period to 60+ days. No magnitudes given.
- Maps to: a possible field measure. Not in SPEC. No full-recovery day given.

**F3. Functional Task Test (FTT) task list and design.** [V-abs] Bloomberg et al. 2014 abstract, JSC-CN-31151, NTRS 20140005022: https://ntrs.nasa.gov/citations/20140005022
- Tasks: ladder climbing, hatch opening, jump down, manual manipulation and tool use, seat egress with obstacle avoidance, recovery from a fall, object translation.
- Population and timing: ISS 6-month crew tested before flight and at 1, 6 and 30 days after landing. Bed-rest analog (70 days, 6 degree head-down tilt) tested at reambulation and 1, 6, 12 days.
- Results: none numeric in the abstract (ongoing study). Could not verify per-task numbers [U].

**F4. Postural-stability tasks change most.** [V] NASA article on the one-year mission and functional performance: https://www.nasa.gov/humans-in-space/nasas-one-year-mission-investigates-how-space-affects-astronauts-functional-performance/
- Population: sample size not stated. Mission length one year, compared with six-month data.
- Finding: fall recovery, obstacle avoidance while walking, and carrying objects changed most. Manual manipulation and tool use changed little. No recovery days given.
- Maps to: SPEC "balance_most_affected". Qualitative support only.

**F5. Tandem walk pilot.** [U] Cerisano et al. 2016, NTRS 20150022290: https://ntrs.nasa.gov/citations/20150022290. Abstract states the aim (a functional sensorimotor recovery timeline). No results in the text read, and the PDF was not readable here.

**F6. Locomotion recovery, 6-month crew.** [U] Search snippet only: recovery to pre-flight scores averaged about two weeks after landing (18 astronauts). The linked PDF (NTRS 20130000770) was unreadable. Not usable as a number.

### 2.4 Cognition and PVT (C)

**C1. PVT-B response speed and sleep, 6-month ISS missions.** [V] Jones, Basner, Mollicone, Mott, Dinges 2022, Sleep 45(3):zsac006. https://pmc.ncbi.nlm.nih.gov/articles/PMC8919197
- Population: 24 ISS astronauts (19 men, 5 women; mean age 48.2), 2009-2014. Missions averaged 160 days (range 123-192). 2,856 Reaction Self-Tests: 394 pre-flight, 2,109 in-flight, 353 post-flight.
- Test: 3-minute PVT-B within the Reaction Self-Test. Pre-flight every 30 days from 180 days before launch; in-flight every fourth day; post-flight daily for a week, then at 30, 60 and 90 days.
- Numbers: in-flight sleep 6.5 +/- 1.4 h against an 8.5 h scheduled opportunity. Full opportunity used on 5.9% of nights. Sleep of 6 h or less on 34.9% of nights. Sleep duration strongly associated with response speed (F=40.76, p<0.0001). Sleep of 6 h or less gave slower responses than longer sleep. Sleep over 9 h gave faster responses than 7 h or less.
- Lapses (RT >= 355 ms) and false starts: not significantly associated with sleep after correction. Lapse counts appear only in supplementary figures.
- Maps to: S (PVT baseline comparison) and V (sleep). Supports the model's sleep-to-reaction link.
- Implication: no formula change. The paper reports response speed (reciprocal RT) and gives no ms medians, so it cannot calibrate RT0 or the 500 ms threshold. The paper's cut is "6 h or less"; SPEC's red is "< 6 h". Boundary is a team decision.

**C2. Lapse threshold, brief test.** [S] Basner, Mollicone, Dinges 2011, Acta Astronautica (PVT-B validity). Search result: https://pmc.ncbi.nlm.nih.gov/articles/PMC3197786 (not fetched). Summary: the brief test used 355 ms instead of 500 ms; effect sizes about 23% smaller on average for a test about 70% shorter. The 10-minute PVT paper (Basner and Dinges 2011, Sleep) recommends response speed and lapse metrics for the 10-minute test [S].
- Maps to: pvt_lapse and the 60 s protocol.
- Implication: a 60 s test has less statistical power than PVT-B. Lapse counts from it will be noisy. Document this in the source note.

### 2.5 Sleep, mood, behavioural health (S, A)

**S1. Sleep deficiency and hypnotic use, shuttle and ISS.** [S] Barger et al. 2014, Lancet Neurology, DOI 10.1016/S1474-4422(14)70122-X. Primary text not reached (redirect page returned no content). Press release seen: https://www.eurekalert.org/news-releases/595450
- Press summary: mean in-flight sleep 5.96 h (shuttle) and 6.09 h (ISS), against 8.5 h scheduled. Sleep of 7 h or more on 12% (shuttle) and 24% (ISS) of episodes. About three-quarters of ISS crew reported sleep-medication use at some point. Sample sizes differ across press reports.
- Maps to: V (sleep). Consistent with Jones 2022 (6.5 h). Prefer Jones 2022 as the primary source.

**S2. Team sources, not re-verified.** [T] Flynn-Evans et al. 2016, npj Microgravity (6.4 h aligned vs 5.4 h misaligned schedules, n=21, 3,248 crew-days). HERA standard schedule of 8 h sleep, no naps (NASA facility PDF). Basner et al. 2014 Mars-500 (one crew member with persistent insomnia).

**A1. CHAPEA analog: dates and measures.** [S] NASA CHAPEA page seen at https://www.nasa.gov/chapea/about. Mission 1 ran 25 June 2023 to 6 July 2024 (378 days). Measures include sleep, cognitive and physical performance, and biological samples. Mission 2 began 19 October 2025 (same page). No published CHAPEA sleep or behavioural outcome results were found [U]. Team listing: https://www.nasa.gov/humans-in-space/chapea [T].
- Maps to: mood and behavioural health. No analog numeric baseline for mood was found, so the mood input stays a general 1-5 scale.

**A2. HERA 45-day mission.** [T] NASA mission page (team): 18 human-health studies; crew coping via shared meals, games and books. Not numeric.

Mood: no numeric spaceflight mood reference was found in this session [U]. SPEC mood thresholds (3 = yellow, 1-2 = red) are general and have no NASA source.

### 2.6 Cardiovascular and vitals (V)

**V1. 24-hour BP and orthostatic tolerance, 6 months ISS, n=12.** [V-abs] Fu et al. 2019, Circulation 140(9):729-738. Record: https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:31319685&resultType=core&format=json . PubMed: https://pubmed.ncbi.nlm.nih.gov/31319685/
- Population: 12 astronauts (4 women), mean age 48 +/- 5, about 6 months ISS.
- Numbers: 24-h systolic BP 120 +/- 10 mmHg pre-flight, 106 +/- 9 in space (P<0.01), 122 +/- 13 after landing. Diastolic BP unchanged. Systolic variability unchanged. Orthostatic intolerance or hypotension in 0 of 12 during daily activities, before or after flight.
- Heart rate: not in abstract.
- Maps to: V (BP). The in-flight mean sits in the SPEC green band (90-129). The abstract gives no individual minimum, so the "< 90 red" rule has no evidence here.
- Implication: no formula change. BP ranges remain general adult references (VERIFY).

**V2. Landing-day standing tests (snippets only).** [S]
- 2024 Scientific Reports paper: 52 of 56 shuttle astronauts completed the landing-day orthostatic test, versus 2 of 6 ISS astronauts. Seen at https://www.nature.com/articles/s41598-024-51643-1. Full text redirected to a login page; not read.
- Earlier tilt work: over 60% of returning crew could not finish a 10-minute 80-degree head-up tilt after long flight.
- 2020 Frontiers paper: lower-body compression garments after landing reduced the usual heart-rate rise on standing. Seen at https://www.frontiersin.org/articles/10.3389/fphys.2020.00784/pdf
- Maps to: post-landing orthostatic risk, which SPEC does not model. Not a formula input.

**V3. Landing-day HR during functional tasks (short missions).** [V-abs] Bloomberg et al. 2010, JSC-CN-21884. https://repository.exst.jaxa.jp/dspace/handle/a-is/250084
- Population: 5 astronauts, shuttle missions of 10-15 days.
- Numbers: landing-day HR higher than pre-flight in 8 of 11 functional tasks. All tasks back to pre-flight HR by R+30. Stand test HR elevated on landing day and still elevated at R+1 and R+6 during standing. Parasympathetic activity lower on landing day (p=0.035). No BP numbers in abstract.
- Maps to: V (HR) around landing. Short missions only; extrapolate with care.

**V4. Other vitals.** In-flight resting HR values: not found [U]. Spaceflight-specific reference ranges for HR, BP, glucose, temperature: not found [U]. The SPEC disclaimer (general adult references) is accurate.

**V5. Team sources, not re-verified.** [T] Buckey et al. 1996, J Appl Physiol (orthostatic intolerance after shuttle flights, n=14). Inflight leg-cuff test does not identify orthostatic hypotension risk after long flight (npj Microgravity 2019).

---

## 3. Datasets

| Resource | Relevance to TOUCHDOWN | Access | Status | URL |
|---|---|---|---|---|
| LSDA (Life Sciences Data Archive) | Human longitudinal spaceflight data (clinical, medical, operational). Only route to real BMD, PVT or vitals series. | Request and approval. Steps not read this session. | [U] steps; [T] request-based | https://lsda.jsc.nasa.gov/explore/lsdahome/datarequest (redirects to https://nlsp.nasa.gov/explore/lsdahome/datarequest, body empty) |
| OSDR / GeneLab | Omics. Low direct relevance to bone or muscle function. | Public for non-controlled data; controlled access for human data. | [T] (AWS registry and controlled-access tutorial verified by team, not re-verified) | https://registry.opendata.aws/nasa-osdr/ ; https://www.nasa.gov/reference/osdr-tutorials-requesting-controlled-access-datasets/ |
| Reaction Self-Test / PVT-B data (Jones 2022) | Would calibrate PVT thresholds and sleep effect. | No public data link in paper text; supplementary figures only. | Paper [V]; data access [U] | https://pmc.ncbi.nlm.nih.gov/articles/PMC8919197 |
| Trappe 2009, Fitts 2010, Lang 2004, Gabel 2022, Sibonga 2019 | Source numbers. No public raw data identified. | Papers only. | As tagged in section 2 | Links in section 2 |
| HRP Task Book | Funded tasks and PIs. Not data. | Public web search; no bulk export mentioned. | [T] | https://taskbook.nasaprs.com/tbp/index.cfm |
| NASA Open Data Portal | Catalogue. No relevant dataset identified. | Public. | [U] (blocked in team research) | https://data.nasa.gov/ |
| CHAPEA / HERA analog outcomes | Mood, sleep, cognition in analogs. | No published outcome data found. | [U] | https://www.nasa.gov/humans-in-space/chapea |
| NASA Isolation Standard Measures | Standard measure list (sleep, mood, cognition) for comparable item wording. | Public report. | [T] | https://ntrs.nasa.gov/citations/20220013722 |

---

## 4. Suggested sources.ts updates (suggestions; team decides)

Status values follow the existing VERIFIED / ASSUMPTION / VERIFY set.

| id | value | url | status | note |
|---|---|---|---|---|
| bone_loss (edit note) | 1-1.5%/month for 4-6 month missions (NASA); model uses 1.25 as a between-site composite | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ | VERIFIED | Keep value. Move site split to bone_site_rates. |
| bone_site_rates (new) | Spine aBMD 0.9%/month; hip aBMD 1.4-1.5%/month (n=14, 4-6 months) | https://pubmed.ncbi.nlm.nih.gov/15125798/ | VERIFIED | Lang T et al. 2004. |
| bone_long_duration (new) | Linear extension beyond 6 months | https://www.nasa.gov/reference/risk-of-spaceflight-induced-bone-changes/ | ASSUMPTION | NASA says long-duration rate needs research. |
| bone_recovery (new) | Tibial BMD 0.9-2.1% below pre-flight at 12 months; 9 of 17 not recovered | https://doi.org/10.1038/s41598-022-13461-1 | VERIFY | Summary-level. Check tables before using numbers. |
| calf_strength (edit) | Calf volume -13% at about 6 months; individual calf strength loss 7-20%; model uses 20 as upper end | https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/ | VERIFY | Current VERIFIED status not supported. Locate companion paper for 7-20%. |
| calf_volume (new) | Calf MRI volume -13 +/- 2% (soleus -15%, gastrocnemius -10%), 6 months ISS, n=9 | https://epublications.marquette.edu/bio_fac/24/ | VERIFIED | Trappe et al. 2009. |
| calf_single_fibre (new) | Type I single-fibre force about -25 to -35% (soleus, gastrocnemius), n=9 | https://pmc.ncbi.nlm.nih.gov/articles/PMC2988519/ | VERIFIED | Fitts et al. 2010. |
| exercise_halves_loss (edit note) | Factor 0.5 | https://doi.org/10.1016/j.bone.2019.07.013 | ASSUMPTION | ARED shows partial, site-dependent protection (n=10, qualitative). |
| exercise_target | 120 min/day | none found | VERIFY | NASA 2 h/day not found. Trappe crew about 5 h/week aerobic [S]. |
| pvt_lapse | 500 ms (10-minute PVT convention) | https://pmc.ncbi.nlm.nih.gov/articles/PMC3197786 | VERIFY | NASA PVT-B uses 355 ms. Team chooses and cites. |
| pvt_sleep (new) | Sleep of 6 h or less linked to slower PVT-B response speed; in-flight sleep 6.5 +/- 1.4 h vs 8.5 h scheduled (n=24) | https://pmc.ncbi.nlm.nih.gov/articles/PMC8919197 | VERIFIED | Jones et al. 2022, Sleep. |
| post_landing_recovery (new) | Full functional recovery about 6-16 days after landing | https://ntrs.nasa.gov/citations/20150022287 | VERIFIED | Abstract only. No per-measure numbers. |
| balance_most_affected (edit note) | Postural-stability tasks change most after flight | https://www.nasa.gov/humans-in-space/nasas-one-year-mission-investigates-how-space-affects-astronauts-functional-performance/ | VERIFIED | Qualitative. |
| bp_in_flight (new) | 24-h systolic mean 120 pre-flight, 106 in flight, 122 after landing (n=12, 6 months) | https://pubmed.ncbi.nlm.nih.gov/31319685/ | VERIFIED | Fu et al. 2019, Circulation. |
| hr_landing_tasks (new, optional) | Landing-day HR above pre-flight in 8 of 11 functional tasks; back by R+30 (n=5, 10-15 day missions) | https://repository.exst.jaxa.jp/dspace/handle/a-is/250084 | VERIFIED | Bloomberg et al. 2010 (abstract). |
| vitals_ranges (edit note) | General adult references; no spaceflight-specific normal ranges found | none | VERIFY | Keep VERIFY. |

---

## 5. Parameter observations (suggestions only; no formula change)

- **Bone 1.25**: consistent with NASA's 1-1.5 range and with the Lang composite. Keep.
- **Calf 20**: group calf volume loss is 13%. Single-fibre force falls more. Individual strength loss runs 7-20%. 20 is defensible only as an upper-end value. Suggest labelling it that way.
- **Exercise factor 0.5**: no direct evidence. ARED evidence shows partial protection. Keep as ASSUMPTION with a clear note.
- **PVT lapse 500 vs 355 ms**: a team choice. Whichever is chosen, cite it and note that a 60 s test has less power than the 3-minute PVT-B.
- **Sleep red at < 6 h**: matches the paper's "6 h or less" cut within one boundary. Team decides inclusive or exclusive.
- **Systolic BP**: in-flight mean is lower than pre-flight. No change needed.
- **Post-landing recovery (6-16 days)**: not modelled. The R_land projection is for the landing day itself. Orchestrator decision whether to add a caveat.

---

## 6. Open questions and unverified items

1. Which measure and site does Scott 2023 Fig. 1d use? Needed to reconcile its 2.1-3.7% mission-level BMD declines with the 1.25%/month rate.
2. Where is the 7-20% calf MVC statement? Likely the companion paper on the same crew. Not located.
3. Group whole-muscle plantar-flexor strength loss at 6 months: not found.
4. Lapse threshold (500 vs 355 ms) and the 60 s versus 3-minute protocol: team decision.
5. Barger 2014 primary text not reached. Only press figures.
6. LSDA request steps not verified (page redirected to an empty NLSP page).
7. Per-task FTT and pilot-field-test numbers: abstracts give none. Full PDFs (NTRS 20150022288, 20150022287) were not readable in full.
8. Tandem walk results and Mulavara 2013 locomotion recovery: not verified.
9. In-flight resting HR and individual minimum SBP: not found. Needed to judge HR green band and the "< 90" BP red rule in flight.
10. Landing-day orthostatic test numbers (2024 Scientific Reports): snippet only; full text behind a login redirect.
11. CHAPEA sleep and behavioural results: none found.
12. Spaceflight-specific mood reference: none found. Mood thresholds remain general.
13. Team sources not re-verified in this session: Flynn-Evans 2016, Basner 2014 Mars-500, Boecker 2026 (EDOS-2 muscle recovery), Buckey 1996, Clement 2022, HERA facility information, NTRS 20220013722.
14. Post-landing recovery is not represented in the model. Whether to add it, or to add a caveat in copy, is a decision for the orchestrator, not a formula change.
