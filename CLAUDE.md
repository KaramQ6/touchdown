# TOUCHDOWN: rules for Claude Code

Rename this file to `CLAUDE.md` and put it in the repo root before starting Claude Code.

## What we are building
TOUCHDOWN: an offline web app for astronauts in Mars transit. Every day it answers one question:
"If we landed on Mars today, could you walk out and work alone?"
It shows a Landing Readiness score R (0-100) built from 3 sub-scores (M, S, V), projects R to landing day,
lets the user test what-if changes (exercise, sleep), and escalates red flags in 3 levels with a comm-delay timer.
Challenge: NASA Space Apps 2026, "Create Health Monitoring Software for Astronauts on Space Missions".
Full spec: `docs/SPEC.md`. Read it before any task.

## Hard rules
1. `src/engine/` is pure TypeScript. It never imports React, Zustand, or anything from `src/` outside `engine/`.
2. Every number shown in the UI comes from the engine running on real (seeded or user) data. Never hardcode a score, a projection, or a demo number in a component.
3. Every constant in the engine lives in `src/engine/constants.ts` and has a matching entry in `src/data/sources.ts` with a status: `VERIFIED`, `ASSUMPTION`, or `VERIFY`.
4. No backend, no auth, no network calls at runtime. The app must work with Wi-Fi off after first load (PWA).
5. Anything that did not come from a real measurement is labeled in the UI: wearable data says `SIMULATED`, seeded crew says `DEMO DATA`.
6. The app is decision support, not diagnosis. No drug names, no diagnoses, no "you have X". Copy says "Projection", never "Diagnosis".
7. Engine changes require passing tests: `npm run test`. Never edit a test to make it pass unless the spec changed.
8. Keep it shippable after every task: `npm run build` must succeed before you say a task is done.
9. Do not add features that are not in `docs/SPEC.md`. If something seems missing, say so and stop.
10. No em dashes in any UI copy.

## Stack (fixed, do not swap)
Vite + React 18 + TypeScript (strict), Tailwind CSS, Zustand with `persist` (localStorage), Recharts, Framer Motion,
vite-plugin-pwa, Vitest. Deploy target: Vercel (static).

## Visual direction
Dark "mission control": near-black background, one accent color for R, green/amber/red only for status.
Large numerals, monospace for data, generous spacing. Works at 1280px laptop width first (demo), then tablet.

## Commands
- `npm run dev` / `npm run build` / `npm run test` / `npm run preview`
