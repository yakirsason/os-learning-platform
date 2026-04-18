---
name: add-lecture
description: This skill should be used when the user wants to add a new lecture to the OS learning platform, import content from a presentation or PDF, create lecture structure, or requests like "תוסיף הרצאה", "צור הרצאה חדשה", "הוסף את המצגת". Use this skill whenever a new lecture topic needs to be integrated into the platform - it ensures consistent structure, proper MDX formatting, correct metadata, and integration with the sidebar. Always use this skill for lecture creation, even if the user describes it casually.
---

# Skill: Adding a New Lecture

## When to Use

- The user asks to add a new lecture from a summary or presentation
- The user provides a PDF and wants it converted into site content
- The user says "add", "create a lecture", or "let's add the topic of..."

---

## Required Workflow

> **This skill implements from an approved plan.** Lecture content analysis, topic prioritization, visualization selection, and wave scoping happen before this skill is invoked. When you reach this skill, you should already have: the approved lecture plan, the wave scope, and the list of visualizations to build. Do not re-analyze the source PDF or invent topics not present in the plan.

### Step 1: Identify the lecture ID and title

Check `src/config/lectures.ts` and find the relevant entry from the 8 registered lectures.
If the user wants to add a topic that is not listed, ask whether to append it as lecture 9+ or fit it into an existing slot.

### Step 2: Create the directory structure

```
src/lectures/{id}/
├── metadata.ts        # optional — local metadata
└── index.mdx          # required — lecture content
```

### Step 3: Fill in `metadata.ts` (optional)

```typescript
import type { LectureMetadata } from '@/types';

export const metadata: LectureMetadata = {
  id: '{id}',
  number: {number},
  title: '{Hebrew title}',
  englishTitle: '{English Title}',
  description: '{Short Hebrew description — 1–2 sentences}',
  estimatedMinutes: {number},
  topics: [
    '{topic 1 in Hebrew}',
    '{topic 2 in Hebrew}',
  ],
  isReady: true,
};
```

### Step 4: Write `index.mdx`

Follow the **Learning Experience UI Standards** and the **Hebrew Clarity and Beginner-Friendly Writing Rules** from `CLAUDE.md`. Every lecture page must feel like an interactive study product written for a student who is encountering this topic for the first time — clear, natural, and simple. Not a flat document, not a textbook.

Required MDX structure:

```mdx
import ConceptCard from '@/components/common/ConceptCard';
import InteractiveDemo from '@/components/common/InteractiveDemo';
// import specific visualizations as needed
// import MyVisualization from '@/components/visualizations/processes/MyVisualization';

# {Hebrew title}

<div dir="rtl">

## פתיחה

{One short paragraph: what is this lecture about and why it matters.}

**במה נעסוק:**
- {bullet 1}
- {bullet 2}
- {bullet 3}

## {Main section title}

<ConceptCard
  title="{Hebrew term}"
  englishTerm="{English term}"
  description="{Detailed Hebrew explanation}"
  variant="info"
/>

## הדמיה אינטראקטיבית — {topic name}

<InteractiveDemo
  title="{Demo title}"
  explanation={<p>{Side explanation in Hebrew — what to watch, why it matters}</p>}
>
  <MyVisualization />
</InteractiveDemo>

## סיכום

{Closing paragraph in Hebrew. What the student should take away.}

</div>
```

Use study reinforcement blocks where appropriate:
- `"חשוב למבחן"` — exam-critical content
- `"טעות נפוצה"` — common misconception
- `"השוואה מהירה"` — quick comparison
- `"בשורה אחת"` — one-line summary
- `"זכור"` — key reminder

### Step 5: Update `src/config/lectures.ts`

Find the lecture entry and set:
- `description` — from the source material
- `estimatedMinutes` — estimated reading + interaction time
- `topics` — list of topics in Hebrew
- `isReady: true`

### Step 6: New simulations (if needed)

**Read the `os-visualization` skill before building any simulation.**

Simulation placement:
- `src/components/visualizations/{category}/{Name}.tsx` — for simulations shared across multiple lectures
- `src/lectures/{id}/visualizations/{Name}.tsx` — for simulations unique to this lecture

Available categories in `src/components/visualizations/`: `introduction`, `processes`, `scheduling`, `sync`, `memory`, `vmem`, `filesystem`, `deadlock`, `io`.

### Step 7: New algorithm logic (if needed)

**Read the `os-algorithms` skill before implementing.**

Location: `src/lib/algorithms/{name}.ts` — pure functions that return a full step trace.

### Step 8: Final validation

1. `npm run dev` runs without TypeScript errors
2. The lecture appears in the Sidebar (not as EmptyLecture)
3. All simulations work (Play / Pause / Reset)
4. RTL layout is correct — no reversed English phrases
5. No `any` in the codebase
6. Run `/verify-lecture {id}` for the mechanical checklist
7. Invoke the `lecture-qa` skill for a full readiness and quality review

---

## Critical Rules

- **Always** wrap Hebrew content in `<div dir="rtl">` inside MDX
- **Never** copy English text from the source material word for word — translate to Hebrew
- **Always** present technical terms using `<ConceptCard>` or a Badge on first use
- **Always** ensure the folder `id` matches the `id` in `src/config/lectures.ts`
- **Never** set `isReady: false` on a lecture that was already ready without explicit user confirmation
- **Never** pre-fill example or placeholder content in lectures that were not explicitly requested
- Every lecture page must follow the page hierarchy defined in **Learning Experience UI Standards** in `CLAUDE.md`: opening section → main sections → interactive blocks → reinforcement → summary
- **Always** follow the **Hebrew Clarity and Beginner-Friendly Writing Rules** in `CLAUDE.md`: write for a student beginning the course — clear, natural, simple, not textbook-heavy
