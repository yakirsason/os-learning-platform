---
name: verify-lecture
description: Verify a lecture meets the Definition of Done
argument-hint: <lecture-id>
---

The user will specify a lecture id (e.g., `processes`, `scheduling`). Check that lecture against the Definition of Done:

- [ ] `src/lectures/{id}/index.mdx` exists
- [ ] `src/config/lectures.ts` has `isReady: true` for this lecture
- [ ] `src/config/lectures.ts` has non-empty `description`, `topics`, and a numeric `estimatedMinutes`
- [ ] MDX content is wrapped in `<div dir="rtl">`
- [ ] At least one interactive visualization is imported in the MDX
- [ ] All imported visualizations exist in `src/components/visualizations/`
- [ ] No `any` types in related code (visualizations, algorithms used by this lecture)
- [ ] No `pl-*` / `pr-*` classes in the lecture's files - only `ps-*` / `pe-*`
- [ ] `npm run build` passes without errors (run it with Bash)

Output a checklist with ✅ / ❌ for each item. If something fails, offer to fix it — but don't fix without confirmation.

Argument: lecture id is `$ARGUMENTS` (one of: `introduction`, `os-structures`, `processes`, `scheduling`, `synchronization`, `deadlocks`, `memory`, `virtual-memory`, `filesystem`, `filesystem-impl`).
