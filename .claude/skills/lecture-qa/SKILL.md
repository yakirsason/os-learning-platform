---
name: lecture-qa
description: Quality assurance review for a finished lecture. Use this skill before marking any lecture work as complete. Covers readiness checks, common failure patterns, and a compact shipping checklist. Complements the /verify-lecture command (which handles mechanical checks) with a deeper quality review.
---

# Skill: Lecture QA and Readiness Check

## When to Use

Invoke this skill at the end of any lecture implementation pass, before reporting the work as done.
This skill covers both mechanical correctness and learning-product quality.

---

## Readiness Criteria

A lecture is ready to ship when ALL of the following are true.

### Routing and Config

- [ ] `src/lectures/{id}/index.mdx` exists and is non-empty
- [ ] `src/config/lectures.ts` has `isReady: true` for this lecture
- [ ] `description`, `topics`, and `estimatedMinutes` are all filled in (no placeholders)
- [ ] The lecture appears in the sidebar (not as EmptyLecture)
- [ ] Route navigation works — clicking the lecture in the sidebar loads it correctly

### RTL and Hebrew Content

- [ ] All Hebrew content is wrapped in `<div dir="rtl">`
- [ ] No `pl-*` / `pr-*` classes anywhere in lecture files — only `ps-*` / `pe-*`
- [ ] Technical terms follow the `hebrew-rtl-content` skill terminology table
- [ ] Navigation arrows are semantically correct (ChevronRight = previous, ChevronLeft = next)
- [ ] Numbers, file paths, and LTR code segments are wrapped in `<span dir="ltr">`

### File Structure

- [ ] Each major tab or interactive demo lives in its own component file
- [ ] MDX is content-first — no heavy logic embedded inline
- [ ] Lecture-specific code lives under `src/lectures/{id}/` not scattered in global shared folders
- [ ] No single file is oversized or acting as a god component

### Simulations

- [ ] Every simulation has a StepController (Reset / Previous / Play / Next)
- [ ] Reset returns to the exact initial state including all parameter state
- [ ] Auto-play uses `setTimeout` per step — not `setInterval`
- [ ] Steps are pre-computed in `useMemo` — not derived on the fly during render
- [ ] At least one simulation allows parameter changes
- [ ] `AnimatePresence` and `framer-motion` are used for transitions

### Code Quality

- [ ] No `any` types anywhere in the lecture's files
- [ ] No `console.log` calls
- [ ] `npm run build` passes with no TypeScript errors
- [ ] All imported visualization components actually exist at their declared paths

### Learning Product Quality

- [ ] Page has a clear hero / opening section (title, short intro, "what you will learn" bullets)
- [ ] Sections are visually separated with strong, scannable headings
- [ ] Important content is visually emphasized — not every card looks identical
- [ ] At least one "חשוב למבחן" or "טעות נפוצה" block is present where relevant
- [ ] The page does not feel like a flat dump of information
- [ ] A student can scan the structure in seconds and understand what the lecture covers

---

## Common Failure Patterns

These are the most frequent reasons a lecture fails QA:

| Issue | What to Check |
|-------|---------------|
| EmptyLecture shows instead of content | `isReady: true` missing in `lectures.ts` |
| RTL breaks on a specific block | Missing `dir="rtl"` on that section |
| Reset is broken | `handleReset` sets `currentStep` but does not reset `isPlaying` or parameter state |
| Steps feel wrong | Steps derived during render instead of pre-computed in `useMemo` |
| Page feels flat | Missing visual hierarchy — all cards same weight, no visual anchors |
| File too large | Tabs or demos not separated into their own component files |
| TypeScript error on build | `any` type used, or an import path is wrong |
| Simulation still shows after parameter change | `useMemo` dependency array missing the changed parameter |

---

## Compact Shipping Checklist

Before reporting a lecture as done, verify:

```
[ ] route + sidebar loads correctly
[ ] config: isReady: true, metadata filled in
[ ] RTL correct throughout
[ ] file structure clean and separated
[ ] simulations work: play / pause / next / previous
[ ] reset returns to exact initial state
[ ] StepController present on every simulation
[ ] no any / no console.log
[ ] npm run build passes
[ ] page feels like a learning product, not a document
[ ] only content from the approved wave is present — nothing added beyond scope
[ ] topic weight in implementation matches topic weight in the approved plan
```

Run `/verify-lecture {id}` to automate the mechanical items above.
Use this skill for the deeper structural and learning-quality review.
