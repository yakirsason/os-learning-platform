---
name: exam-oriented-content
description: Guidance for writing OS lecture content that prepares students for exams. Use this skill when writing or reviewing concept explanations, comparisons, trade-off summaries, and any exam callout blocks (חשוב למבחן, טעות נפוצה, etc.).
---

# Skill: Writing Exam-Oriented Content

## When to Use

Invoke this skill when:
- Writing or reviewing concept explanations in an MDX lecture
- Deciding what to emphasize in a section
- Writing comparison tables, trade-off summaries, or key takeaways
- Creating or reviewing any block labeled חשוב למבחן / טעות נפוצה / זכור

---

## Core Principle

Write for an Israeli student beginning the course — smart, but encountering these concepts for the first time. Exam-oriented content is not about packing in more information; it is about making the right information land clearly.

Every concept section should answer these questions for the student:

1. **What is this?** — a clear definition in one sentence, in plain Hebrew
2. **Why does it matter?** — the consequence, motivation, or exam relevance
3. **How is it different from X?** — the key comparison or contrast with a related concept
4. **What should I remember for the exam?** — one crisp takeaway

If a section cannot answer all four, it is not yet exam-ready.

Use simple language in exam callout blocks too — a "חשוב למבחן" block that is hard to parse defeats its purpose.

---

## What to Emphasize

### High-value exam content

Prioritize content that:
- Distinguishes between two similar concepts (e.g., SJF vs SRTF, Mutex vs Semaphore)
- Involves a step-by-step algorithm the student must trace (e.g., Banker's Algorithm, LRU)
- Has a named property students must know by name (e.g., starvation, convoy effect, Belady's anomaly)
- Involves a formula or metric the student must compute (e.g., turnaround time = completion − arrival)
- Has a common misconception worth calling out explicitly

### Lower-priority content

Deprioritize:
- Historical context or trivia that does not appear in exam questions
- Implementation details irrelevant to algorithm understanding
- Edge cases that do not appear in standard OS exam problems

---

## Study Reinforcement Blocks

Use these blocks deliberately — place each one where it has maximum impact, not on every card.

### `חשוב למבחן` — Exam-Critical

Use for:
- Formulas the student must know (e.g., turnaround time formula)
- Algorithms the student will be asked to trace in an exam
- Named properties that distinguish similar concepts (e.g., convoy effect, starvation)
- Any fact where getting it wrong is a common exam mistake

Placement: immediately after the concept it applies to — not at the end of the lecture.

Example:
```
**חשוב למבחן:** זמן סיבוב (Turnaround Time) = זמן סיום − זמן הגעה. זמן המתנה = זמן סיבוב − זמן הריצה.
```

### `טעות נפוצה` — Common Misconception

Use for:
- Concepts students consistently confuse with each other
- Subtle behavior differences that surprise most readers on first contact
- Terms that mean something different in OS than in everyday language

Placement: immediately after the concept that is commonly misunderstood.

Example:
```
**טעות נפוצה:** SJF אינו preemptive — התהליך הנוכחי ממשיך לרוץ עד הסוף, גם אם תהליך קצר יותר מגיע לתור.
```

### `השוואה מהירה` — Quick Comparison

Use when two or more algorithms or mechanisms in the same lecture are frequently confused.
Prefer a table over prose.

Example:

| קריטריון | FCFS | SJF |
|----------|------|-----|
| Preemptive? | לא | לא |
| Starvation? | לא | כן |
| מתאים ל... | פשטות | אופטימיזציה תיאורטית |

### `בשורה אחת` — One-Liner Summary

Use at the end of a section to lock in the core idea before moving on.
Keep it to one sentence.

Example:
```
**בשורה אחת:** Round Robin מבטיח הגינות אבל אינו מבטיח יעילות — קוונטום קטן מדי גורם לעומס גדול מ-Context Switch.
```

### `זכור` — Key Reminder

Use sparingly — for non-obvious reminders, constraints, or rules of thumb.
Do not use it as a generic label for any important fact.

---

## Comparisons and Trade-offs

Whenever two similar concepts coexist in the same lecture, always include:

- A side-by-side comparison (table preferred)
- A clear statement of when each is better or worse
- A concrete scenario showing the difference in behavior

This is one of the highest-value things you can add to a lecture. Students frequently lose exam points by confusing similar algorithms.

---

## Memory Anchors

Give students something concrete to hold onto for each major concept:

- **Acronym or mnemonic** — e.g., "LRU = Least Recently Used = the page unused longest is evicted"
- **Visual metaphor** — e.g., "Banker's Algorithm is like a bank that refuses to lend if it cannot guarantee repayment"
- **Concrete scenario** — e.g., "Imagine 3 processes arrive at the same time..."
- **Contrast with intuition** — e.g., "Unlike a real checkout line, SJF can see the future"

Include at least one memory anchor per major concept section.

---

## Anti-Patterns to Avoid

- Writing long prose without any emphasis or callout blocks
- Listing facts without explaining why they matter for the exam
- Skipping comparisons when two similar concepts exist in the same lecture
- Overusing "חשוב למבחן" — it loses impact if every paragraph has one
- Using "זכור" as a generic label for any important-ish fact
- Flat sections with no visual anchors, callouts, or exam signals
- Ending a section without a one-liner or takeaway
- Writing exam callout blocks in heavy academic language — keep them short and plain
- Introducing a term in a callout block before it has been explained in the main text
- Packing multiple concepts into one exam block — one block, one idea
