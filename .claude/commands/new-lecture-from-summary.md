---
name: new-lecture-from-summary
description: Create a new lecture from a summary/presentation content
---

The user is about to paste content from a lecture (PDF summary, presentation notes, etc.).

Your workflow:
1. Invoke the `add-lecture` skill to load its instructions.
2. Ask the user **which lecture ID** (from the 8 configured lectures in `src/config/lectures.ts`) this content belongs to. Do not guess.
3. Ask the user what visualizations they'd like - suggest 2-3 based on the topic.
4. Follow the `add-lecture` skill instructions precisely.
5. For each visualization, invoke the `os-visualization` skill.
6. For all Hebrew text, follow the `hebrew-rtl-content` skill.
7. For any algorithm implementation needed, invoke the `os-algorithms` skill.
8. At the end, run `/verify-lecture <id>` on the new lecture.

**DO NOT proceed without confirming the lecture ID first.**

The 10 lecture IDs are: `introduction`, `os-structures`, `processes`, `scheduling`, `synchronization`, `deadlocks`, `memory`, `virtual-memory`, `filesystem`, `filesystem-impl`.
