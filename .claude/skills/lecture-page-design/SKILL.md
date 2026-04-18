---
name: lecture-page-design
description: Practical patterns for composing and reviewing lecture pages on the OS learning platform. Use this skill when planning a new lecture's MDX structure, deciding how to organize sections and simulations, or reviewing whether a lecture page feels like a learning product rather than a flat document.
---

# Skill: Lecture Page Design

## When to Use

Invoke this skill when:
- Starting a new lecture and planning its page structure before writing content
- Reviewing whether a finished lecture feels flat, disorganized, or document-like
- Deciding how to place simulations, concept cards, and reinforcement blocks
- Improving a page that is factually correct but lacks visual rhythm or learning flow

> **Structure follows the approved plan.** If the plan assigns a topic its own route or subpage, do not collapse it into a shared page. If a topic is brief in the plan, keep it brief in the page. Do not expand minor mentions into major sections. Page hierarchy must reflect the weight of topics as approved — not as Claude independently judges them.

---

## Canonical Page Structure

Every lecture page must follow this structure. Deviate only with a clear, explicit reason.

```
1. Hero / Opening Section
2. Core Concept Sections  (one per major topic)
3. Interactive Simulation Blocks  (after each relevant concept)
4. Study Reinforcement Blocks  (inline, not clustered at the end)
5. Summary / Takeaways
```

---

### 1. Hero / Opening Section

Required elements:
- `# {Hebrew lecture title}`
- One short paragraph: what this lecture is about and why it matters to the student
- **במה נעסוק:** — 3–4 short bullets listing what the student will learn
- Optional: one-sentence note on why this topic matters for OS understanding overall

Keep the hero short. Students scan it to orient themselves — it is not where learning happens.

---

### 2. Core Concept Sections

Each major concept or algorithm gets its own `## {Section Heading}`.

Structure per section:
1. Short intro sentence (1–2 lines max)
2. Key explanation — ConceptCard(s) or concise prose with emphasis
3. One stronger visual anchor: comparison table, numbered list, or a diagram reference
4. Optional inline reinforcement block (חשוב למבחן / טעות נפוצה)

Rule: Do not run more than 6 ConceptCards in a row without a visual break or interaction.

---

### 3. Interactive Simulation Blocks

Simulations are the most valuable learning element on the page. Give them the prominence they deserve.

Each simulation block must include:
- A strong heading: `## הדמיה אינטראקטיבית — {Topic}`
- One short "מה לצפות כאן:" sentence — sets the student's focus
- One short "למה זה חשוב:" sentence — connects to the exam or concept
- The `<InteractiveDemo>` wrapper containing the simulation
- The simulation itself must be large enough to read comfortably

Placement rules:
- Place simulations **after** the concept(s) they illustrate — never before
- Never bury a simulation below 6+ concept cards without visual separation
- Never place two simulations back to back without conceptual text in between

---

### 4. Study Reinforcement Blocks

Scatter these throughout the page where they have impact — do not cluster them all at the end.

- `חשוב למבחן` — place immediately after the concept it applies to
- `טעות נפוצה` — place immediately after the concept that is commonly misunderstood
- `השוואה מהירה` — use a table, place at the end of any section that introduces multiple similar concepts
- `בשורה אחת` — place at the end of a section, before moving to the next topic
- `זכור` — use sparingly, for non-obvious reminders only

---

### 5. Summary / Takeaways

Required at the end of every lecture.

Contents:
- 3–5 key takeaways the student should retain
- One sentence connecting this topic to the next lecture or to OS understanding overall

Keep the summary scannable in under 30 seconds.

---

## Visual Hierarchy Rules

1. **Not every card should look the same.** Use `variant="info"`, `variant="warning"`, `variant="highlight"` intentionally.
2. **Major section headings must feel clearly dominant** over body text.
3. **Important content must stand out.** A student should be able to identify the 3 most important things on the page without reading everything.
4. **Use whitespace generously.** Dense cards packed together reduce readability and dilute emphasis.
5. **Create rhythm.** Alternate between: explanation → example or emphasis → interaction → recap. Avoid running 10 elements of the same type consecutively.

---

## Section Pacing

Good pacing means each section feels distinct from the one before it.

### Signs of bad pacing
- 8+ ConceptCards in a row with no interaction or break
- Two long text sections back to back with no visual anchor
- A simulation buried at the very bottom after all other content
- All reinforcement blocks clustered at the end of the lecture

### How to fix bad pacing
- Move a simulation earlier — right after the first explanation of its concept
- Insert a comparison table to break up card runs
- Move a "חשוב למבחן" block to sit inline, next to its concept
- Add a visual separator (`---`) between major sections if they are running together

---

## Simulation Prominence Checklist

For each simulation, verify:

- [ ] Placed after (not before) the concept it illustrates
- [ ] Has its own heading — not visually buried between text blocks
- [ ] `<InteractiveDemo>` wrapper is used
- [ ] Diagram area is large enough — minimum `min-h-[320px]`
- [ ] StepController is visible and functional
- [ ] Hebrew explanation panel updates at each step
- [ ] Reset returns to exact initial state
- [ ] The simulation does not feel like a footnote

---

## MDX Composition Pattern

Keep MDX thin and readable. Move logic out.

```mdx
import ConceptCard from '@/components/common/ConceptCard';
import InteractiveDemo from '@/components/common/InteractiveDemo';
import MyVisualization from '@/lectures/{id}/visualizations/MyVisualization';

# {Hebrew Lecture Title}

<div dir="rtl">

## פתיחה

{Short intro paragraph}

**במה נעסוק:**
- {bullet 1}
- {bullet 2}
- {bullet 3}

## {Concept Section Heading}

<ConceptCard ... />

**חשוב למבחן:** ...

## הדמיה — {Topic Name}

<InteractiveDemo title="..." explanation={<p>...</p>}>
  <MyVisualization />
</InteractiveDemo>

## סיכום

{Summary}

</div>
```

If a section has complex tab behavior or heavy interaction, move it to a lecture-local component:

```mdx
import ProcessTabs from '@/lectures/{id}/components/ProcessTabs';

<ProcessTabs />
```

Do not write all tab logic inline in MDX.

---

## Anti-Pattern Reference

| Pattern | Problem | Fix |
|---------|---------|-----|
| 8 identical ConceptCards in a row | No rhythm, no emphasis | Break with a table, simulation, or section divider |
| All reinforcement blocks at the end | No inline signal to the student | Move each block near its concept |
| Simulation at the very bottom | Student doesn't interact until they're tired | Move simulation after the first explanation |
| Same card variant everywhere | Nothing stands out | Use warning / highlight / info variants intentionally |
| Long MDX with all logic inline | MDX becomes unmaintainable | Move tabs, demos, and logic to lecture-local files |
| No hero section | Student doesn't know what to expect | Add opening section with title, intro, bullets |
| Dense wall of text with no breaks | Hard to scan and retain | Break into short paragraphs, add emphasis, add whitespace |
