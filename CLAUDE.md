# OS Learning Platform — Engineering Playbook

## What This Project Is

An interactive Hebrew-language learning platform for Operating Systems concepts. Local site (Vite + React + TypeScript) with visual simulations for every major topic. Lectures are added one at a time, each based on a specific course presentation.

---

## Core Rules — Always Enforce

### 🗣️ Language and RTL

- All user-facing content (UI labels, explanations, messages) must be in **Hebrew**
- Technical terms stay in English: Process, Thread, Scheduler, Semaphore, Paging, Deadlock
- First use of a term: "תהליך (Process)" — after that, use the Hebrew or English form consistently
- RTL layout: always use `ps-*` / `pe-*` (never `pl-*` / `pr-*`). Navigation arrows: `ChevronRight` = previous, `ChevronLeft` = next
- Fonts: **Heebo** for text, **JetBrains Mono** for code
- Hebrew content in MDX files must be wrapped in `<div dir="rtl">`

### 🎨 Visual Consistency — Process State Colors

These color mappings are fixed and must be identical across the entire site. Defined in `src/index.css` and `tailwind.config.js`:

- **New**: `--color-state-new` (#64748b — slate) / `text-state-new` / `bg-state-new`
- **Ready**: `--color-state-ready` (#3b82f6 — blue)
- **Running**: `--color-state-running` (#22c55e — green)
- **Waiting**: `--color-state-waiting` (#f59e0b — amber)
- **Terminated**: `--color-state-terminated` (#6b7280 — gray)

Do not change these mappings under any circumstances.

### 💻 Code Quality

- TypeScript strict mode — no `any`
- Every component: `export default`, explicit props interface
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for everything else
- Code comments: Hebrew for conceptual intent, English for technical detail
- No `console.log` in commits
- Import alias: `@/...` (configured in `tsconfig` and `vite.config.ts`)

### 🧩 Interactive Simulation Requirements

Every simulation must include:

1. **StepController** — Play / Pause / Next / Previous / Reset
2. **Inline Hebrew explanation** — what is happening at each step
3. **Reset** that returns to the exact initial state
4. **Consistent state colors** — same color scheme as the rest of the site
5. **Framer Motion animations** — no manual CSS transitions
6. **At least one simulation per lecture must allow parameter changes**

### 🔒 Scope Discipline

- Work must stay within the requested scope — if the task is one lecture, do not modify unrelated lectures
- Do not perform broad refactors, rename passes, or structural cleanup "while here"
- Do not change global shared structures unless the task clearly requires it
- If a wider change seems necessary, stop and report it to the user before proceeding

### 🏗️ Do Not Invent Project Structures

- Do not invent metadata schemas, props contracts, or file/folder conventions that do not already exist
- Do not silently introduce new shared abstractions unless the project genuinely needs them
- First inspect the existing code and follow established patterns
- If a real structural mismatch exists, propose a minimal explicit adjustment instead of silently diverging

### 📄 Keep Logic Out of MDX

- MDX files are for lecture content composition and structure — not interaction logic
- Do not bury state machines, complex hooks, or large tab implementations inside MDX
- Move substantial logic into lecture-local TS/TSX files
- Keep MDX readable and content-first

---

## Implementation Workflow — Claude's Role

Claude Code is an **implementation agent**, not a source-analysis or planning agent.

The lecture preparation pipeline always happens before Claude Code is involved:

1. ChatGPT reads the full lecture PDF/presentation
2. ChatGPT maps exact lecture content and decides primary vs secondary topics
3. ChatGPT proposes visualizations and splits work into waves
4. The user reviews and approves the plan
5. **Claude Code implements from that approved plan — this is where it enters**

### Implementing from an Approved Plan

When a lecture plan, topic map, visualization list, route structure, or wave scope is provided:

- Treat the approved plan as the **source of truth** for what to build
- Do not invent extra topics, sections, demos, exam blocks, or expansions not in the plan
- If a topic is marked minor in the plan, keep its implementation proportionate — do not expand it into a major section
- Do not silently collapse separate subtopics into one page if the plan expects distinct routes or subpages
- If the plan specifies a sidebar hierarchy with distinct routes per major subtopic, implement that hierarchy exactly — do not flatten it
- Topic weight in the implementation must match topic weight in the approved plan

### Wave-Scoped Implementation

Each implementation prompt covers exactly one approved wave. Do not work ahead.

- Build only what the current wave specifies — nothing more
- Do not add neighboring features, future demos, or "while I'm here" improvements
- When a wave is complete, stop and report — do not begin the next wave without explicit approval

### When the Prompt Is Under-Specified or Conflicts

If the implementation prompt is unclear, ambiguous, or conflicts with the existing project structure:

- **Stop and surface the issue** — do not guess broadly or make large structural assumptions
- Ask a specific, targeted question about the gap
- Do not silently diverge from the approved plan to fill the gap

---

## Hebrew Clarity and Beginner-Friendly Writing Rules

All Hebrew lecture content is written for an Israeli student beginning the course. They are smart but may be encountering these concepts for the first time. Write like a good lecturer explains — not like a textbook is written.

### Writing standard

- Write clearly, naturally, and simply — clear over comprehensive
- Explain a concept before building on it; do not use a term until it has been introduced
- Avoid long dense paragraphs; break explanations into short readable chunks
- Avoid loading a single sentence with multiple unfamiliar terms
- Prefer short sentences over compound constructions when they express the same idea
- Use natural Israeli Hebrew — not formal, overly academic, or translated-from-English phrasing
- If content is technically correct but feels heavy or dense, rewrite it more simply

### Technical terms

English technical terms remain in English by project policy (Process, Thread, Semaphore, etc.). They must not make the surrounding explanation harder to understand. On first use, introduce the term in context: "תהליך (Process) הוא...". After that, use whichever form is clearer.

### What every explanation must help the student answer

1. What is this concept?
2. Why does it matter?
3. How is it different from similar concepts?
4. What should I remember for the exam?

### Prefer / Avoid

| Prefer | Avoid |
|--------|-------|
| Short explanation → example → takeaway | Long unbroken prose |
| Natural everyday Hebrew phrasing | Formal or translated-from-English wording |
| One idea per sentence | Multiple unfamiliar terms packed into one sentence |
| "דמיין ש..." / "לדוגמה..." | Dense abstract definitions with no grounding |
| Introduce term, then use it | Jargon used before it has been explained |
| Simple vocabulary when it works | Academic synonyms that add no clarity |

### Reducing beginner intimidation

- Anchor new concepts to familiar everyday analogies where possible
- Signal when something is simple vs when it genuinely needs care
- Use "שים לב ש..." / "הנקודה החשובה כאן היא..." / "זה נשמע מורכב, אבל..." where it helps
- Never use jargon-heavy sentences to explain other jargon-heavy sentences
- Do not assume prior familiarity — assume the student is encountering this topic for the first time

---

## Project Structure

```
מערכות הפעלה/
├── CLAUDE.md                          # This playbook
├── README.md                          # User-facing setup instructions
├── package.json
├── tsconfig.json / tsconfig.app.json / tsconfig.node.json
├── vite.config.ts                     # MDX + React + @ alias
├── tailwind.config.js                 # dark mode + Heebo + state colors
├── postcss.config.js
├── components.json                    # shadcn configuration
├── index.html                         # lang="he" dir="rtl" + fonts
├── .claude/
│   ├── settings.local.json
│   ├── skills/                        # 7 Claude Code skills
│   │   ├── add-lecture/SKILL.md
│   │   ├── os-visualization/SKILL.md
│   │   ├── hebrew-rtl-content/SKILL.md
│   │   ├── os-algorithms/SKILL.md
│   │   ├── lecture-qa/SKILL.md
│   │   ├── exam-oriented-content/SKILL.md
│   │   └── lecture-page-design/SKILL.md
│   └── commands/                      # 3 slash commands
│       ├── check-rtl.md
│       ├── verify-lecture.md
│       └── new-lecture-from-summary.md
└── src/
    ├── main.tsx                       # entry + BrowserRouter
    ├── App.tsx                        # routes + sync darkMode class
    ├── index.css                      # design tokens (HSL + state colors)
    ├── mdx.d.ts                       # TypeScript declarations for MDX
    ├── components/
    │   ├── ui/                        # shadcn: 8 components
    │   │   ├── badge.tsx
    │   │   ├── button.tsx
    │   │   ├── card.tsx
    │   │   ├── dialog.tsx
    │   │   ├── select.tsx
    │   │   ├── separator.tsx
    │   │   ├── slider.tsx
    │   │   └── tabs.tsx
    │   ├── layout/
    │   │   ├── Header.tsx             # page header + dark mode toggle
    │   │   ├── Sidebar.tsx            # 8-lecture navigation menu (RTL, right side)
    │   │   └── Layout.tsx             # Outlet wrapper
    │   ├── common/
    │   │   ├── EmptyLecture.tsx       # "lecture not yet added" screen
    │   │   ├── StepController.tsx     # step control bar (RTL aware)
    │   │   ├── ConceptCard.tsx        # concept card with English Badge
    │   │   └── InteractiveDemo.tsx    # wrapper: diagram area + explanation panel
    │   └── visualizations/            # simulations organized by topic
    │       ├── processes/
    │       ├── scheduling/
    │       ├── sync/
    │       ├── memory/
    │       ├── vmem/
    │       ├── filesystem/
    │       ├── deadlock/
    │       └── io/
    ├── lectures/                      # MDX content by lecture id
    │   └── {id}/index.mdx             # created when a lecture is added
    ├── pages/
    │   ├── Home.tsx                   # home page
    │   └── LecturePage.tsx            # loads MDX dynamically or shows EmptyLecture
    ├── store/
    │   └── useLectureStore.ts         # Zustand + persist (os-learning-storage)
    ├── lib/
    │   ├── utils.ts                   # cn()
    │   └── algorithms/                # pure algorithm implementations (scheduling, paging...)
    ├── config/
    │   └── lectures.ts                # registry of 8 lectures (isReady flag)
    └── types/
        └── index.ts                   # LectureMetadata, LectureStatus
```

---

## How to Add a New Lecture

1. Create the folder `src/lectures/{id}/` (id must match the entry in `src/config/lectures.ts`)
2. Inside: `metadata.ts` (optional, for local metadata) and `index.mdx` (required)
3. Update the entry in `src/config/lectures.ts`: set `isReady: true`, fill in `description`, `estimatedMinutes`, `topics`
4. If simulations are needed, create them in `src/components/visualizations/{category}/`
5. Import simulations inside the MDX file

**Lecture structure follows the approved plan.** If the plan specifies a sidebar hierarchy with distinct routes per subtopic, implement that — do not flatten multiple topics into one page. Major algorithms and problems usually deserve focused pages rather than one overloaded page. A brief mention in the plan should stay proportionate in implementation.

**Always invoke the `add-lecture` skill before creating a new lecture.**
For exam-oriented content structure, also invoke the `exam-oriented-content` skill.
For page layout decisions, also invoke the `lecture-page-design` skill.
Before marking a lecture complete, invoke the `lecture-qa` skill.

---

## How to Add a New Simulation

**Always read the `os-visualization` skill before building** — it contains templates and mandatory rules.

Required: StepController, step history, Framer Motion, process state colors.

**Before designing the visualization, identify its pedagogical intent from the approved plan:**

- **Timeline-first** — for scheduling, I/O queues, process lifecycle: show time on an axis
- **State-first** — for process states, deadlock: show state transitions between nodes
- **Queue-first** — for producer-consumer, disk scheduling, ready queue: show data moving through queues
- **Trace-first** — for page replacement, Banker's algorithm: step through a trace table row by row

Supporting panels (Hebrew explanation, counters, metrics) must support the main learning visual — not compete with it. Every step should help the student answer: "what happened now and why?"

---

## Definition of Done for Lecture Work

A lecture is not done just because it builds without errors.

It must satisfy all of the following before being marked complete:

- Route works and the lecture appears in the sidebar (not as EmptyLecture)
- `src/config/lectures.ts` has `isReady: true` with valid `description`, `topics`, and `estimatedMinutes`
- All Hebrew content is wrapped in `<div dir="rtl">`
- File structure is clean — tabs and demos are separated into their own files, MDX is content-first
- Every simulation has a working StepController (Play / Pause / Next / Previous / Reset)
- Reset truly returns to the exact initial state, including all parameter state
- Page structure follows the hierarchy in **Learning Experience UI Standards**
- The page feels like a learning product — not a flat document dump
- No `any`, no `pl-*` / `pr-*`, no `console.log`
- `npm run build` passes with no TypeScript errors

**Always invoke the `lecture-qa` skill before marking a lecture complete.**

---

## File Separation and OOD Implementation Rules

When implementing lecture pages, visualizations, tabs, or interactive learning flows, preserve **clean file separation** and **sound object-oriented / modular design**. Do not collapse large parts of a lecture into one oversized file.

### Core rule

A feature may feel unified to the user, but it must remain internally separated into focused files and components.

Do not build:

* one giant lecture component containing all tabs
* one giant visualization file containing unrelated logic
* one giant MDX-driven page with all interaction logic embedded inline
* one oversized "manager" component that handles everything

Prefer a structure where each major concern has its own file.

### Required separation principles

#### 1. Separate by responsibility

Split code by distinct responsibility, for example:

* lecture page structure
* section-specific presentation
* each interactive demo
* each tab panel
* each algorithm / state-transition logic module
* shared UI wrappers
* metadata / configuration

A file should have one clear purpose.

#### 2. Separate each major tab into its own file

If a lecture contains multiple tabs, views, or major interactive panels:

* each tab must have its own component file
* do not implement all tabs inside a single large file
* keep the parent container responsible only for orchestration, shared state if needed, and layout composition

Example pattern:

* parent lecture component / wrapper
* `OverviewTab.tsx`
* `StatesTab.tsx`
* `PCBTab.tsx`
* `SchedulingTab.tsx`

Do not inline all tab content inside one component unless the tab set is trivially small.

#### 3. Separate UI from logic

Keep algorithmic or state-transition logic out of large rendering files when possible.

Examples:

* queue transition helpers in a separate utility/module file
* process-state transition logic separated from presentation
* data/config for diagrams separated from rendering component if it improves clarity

UI files should mainly express rendering and interaction, not bury all domain logic inline.

#### 4. Prefer lecture-local organization for lecture-specific code

If code is specific to one lecture, keep it under that lecture's own folder structure instead of polluting global shared folders.

Example:

* `src/lectures/processes/visualizations/ProcessStateSimulator.tsx`
* `src/lectures/processes/components/StatesComparisonCard.tsx`
* `src/lectures/processes/lib/processStateMachine.ts`

Use shared/global locations only for truly reusable cross-lecture building blocks.

#### 5. Keep parent files thin

Parent page/container files should stay relatively small and readable.
They may:

* compose sections
* import child components
* pass props
* coordinate layout
* hold minimal shared state

They should not become a dumping ground for:

* all tab markup
* all animations
* all demo logic
* all helper functions
* all data structures

#### 6. Build for future edits

Assume the lecture will be revised later.
Structure code so that future changes can be made by editing one focused file, not by navigating a giant mixed file.

The code should be easy to:

* debug
* extend
* restyle
* replace one tab/demo without affecting others

### OOD / modular design expectations

Use strong modular design even in React-based UI work.

Prefer:

* focused components
* explicit props interfaces
* local abstractions with clear names
* reusable primitives when truly shared
* predictable data flow
* small helper modules for non-UI logic

Avoid:

* god components
* deeply mixed rendering + business logic
* duplicated tab logic across one huge file
* monolithic components that are hard to test or modify

### Heuristics for splitting files

Create a separate file when:

* a tab has meaningful standalone content
* a visualization has its own state and controls
* a section has enough structure to be understood independently
* logic can be explained as its own concept
* a file is becoming hard to scan quickly
* the parent file starts feeling like a maintenance risk

### Lecture implementation pattern

For multi-part lectures, prefer structures like:

* `index.mdx` for content composition
* lecture-local visualization files for each demo
* lecture-local section or tab components for major areas
* lecture-local helper/lib files for logic
* `metadata.ts` for lecture metadata
* config updates kept separate from content code

### Non-negotiable rule

Do not place all tabs of a lecture into one file just because it is faster in the moment.
Optimization for speed must not damage maintainability.

### Definition of good structure

A lecture implementation is well-structured when:

* each major part can be located quickly
* each tab/demo can be edited independently
* files remain readable
* shared vs lecture-specific code is clearly separated
* future fixes do not require digging through a giant component

---

## Recommended Claude Code Models

| Task | Model | Effort |
|------|-------|--------|
| Full new lecture (content + simulations) | Opus 4.7 | high |
| Complex new simulation only | Opus 4.7 | high |
| Hebrew text updates, design fixes | Sonnet 4.6 | medium |
| Small bugs, rename, targeted refactor | Haiku 4.5 | low |

---

## What Must Never Be Done

- ❌ Never use `pl-*` or `pr-*` Tailwind classes — use `ps-*` / `pe-*`
- ❌ Never use `any` in TypeScript
- ❌ Never change process state colors — they must remain consistent site-wide
- ❌ Never build a simulation without StepController
- ❌ Never mix Hebrew and English in the same sentence without reason (technical terms are fine)
- ❌ Never omit `dir="rtl"` on elements containing long Hebrew text
- ❌ Never pre-fill example content in lectures that were not explicitly requested
- ❌ Never use `setInterval` in simulations — use `setTimeout` re-triggered on each step
- ❌ Never invent topics, sections, demos, or routes not present in the approved plan
- ❌ Never flatten the approved lecture hierarchy — if separate routes are planned, build them separately
- ❌ Never implement a future wave without explicit approval from the user

---

## Dev Server

```bash
npm run dev       # http://localhost:5173
npm run build     # tsc -b + vite build
npm run lint      # tsc -b --noEmit
```

---

## Learning Experience UI Standards

When building or updating any lecture page, optimize for a **high-quality learning experience**, not just correctness of content. A lecture page must feel like an interactive study product, not a long static document.

### Core principle

Every lecture should maximize:

1. clarity,
2. visual hierarchy,
3. learning flow,
4. focus on key ideas,
5. interactive understanding.

Do not produce pages that feel like a flat sequence of similar cards with weak hierarchy.

### Page hierarchy requirements

Every lecture page should follow this structure unless there is a strong reason not to:

1. **Hero / Opening section**

   * Clear lecture title
   * 1 short paragraph explaining what this lecture is about
   * 3-4 short bullets: "what you will learn here"
   * Optional small "why this matters" note

2. **Main sections with strong separation**

   * Each major topic must have a clear section heading
   * Sections should be visually separated with enough vertical spacing
   * Avoid long runs of nearly identical cards with no rhythm or emphasis

3. **Interactive learning blocks**

   * Simulations must feel central, not visually buried
   * Each simulation should include:

     * strong title
     * one short "what to look at here" explanation
     * one short "why this matters" explanation
     * visible StepController
     * real reset behavior

4. **Study reinforcement blocks**
   Use these where helpful:

   * "חשוב למבחן"
   * "טעות נפוצה"
   * "השוואה מהירה"
   * "בשורה אחת"
   * "זכור"

A good lecture should guide the student's attention, not just display information.

### Visual hierarchy rules

* Headings must be clearly stronger than body text
* Section titles must be visually distinct and easy to scan
* Important blocks must stand out immediately
* Avoid making all cards look equally important
* Use size, spacing, contrast, and emphasis intentionally
* Create visual rhythm: explanation → emphasis → interaction → recap

### Density and readability

* Prefer short paragraphs over dense text walls
* Break long explanations into smaller chunks
* Keep cards concise
* Avoid excessive repetition
* Use whitespace generously
* A student should be able to scan the page and understand the structure in seconds

### Simulation prominence

Interactive demos are a core learning tool, not decorative extras.
For each demo:

* give it enough visual space
* keep the diagram area large enough to read comfortably
* keep the explanation panel compact and focused
* ensure controls are obvious and consistent
* make the active step visually clear

### Color system

Use color with meaning, not decoration.

#### Mandatory process-state colors

* New = slate
* Ready = blue
* Running = green
* Waiting = amber
* Terminated = gray

Do not change these mappings.

#### General learning UI colors

Use a restrained, consistent palette:

* **Primary / interactive emphasis**: blue
* **Success / active / correct / running**: green
* **Warning / waiting / caution / important attention**: amber
* **Danger / invalid / trap / crash / forbidden**: red
* **Neutral structure / background / borders**: slate / zinc / gray

Do not make the page feel washed out, overly gray, or visually flat.
Use soft neutral backgrounds, but ensure enough contrast and visual anchors.

### Card styling rules

* Avoid endless repeated cards with identical visual weight
* Use card variants intentionally:

  * standard info card
  * highlighted important card
  * warning / misconception card
  * summary / exam-focus card
* Important content should not look identical to secondary content

### Section design expectations

Each main section should usually contain a mix of:

* short intro
* concept cards or key bullets
* one stronger visual or interactive anchor
* recap or takeaway

Do not build lecture pages as one long uninterrupted sequence of cards.

### Learning-product mindset

When implementing lectures, think like a product designer for students:

* What is the student most likely to misunderstand?
* What deserves emphasis?
* What should stand out visually?
* Where should the eye go first?
* What should be remembered for the exam?

Optimize for understanding and retention, not just completeness.

### If content is already correct but the page feels flat

You should proactively improve:

* hierarchy,
* spacing,
* section rhythm,
* emphasis blocks,
* simulation prominence,
* exam-oriented callouts.

Do not stop at "technically correct" if the learning experience is still weak.
