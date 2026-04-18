# Skills Index

Quick reference for all Claude Code skills and slash commands in this project.
See `CLAUDE.md` for the full engineering playbook, including the **Implementation Workflow** section.

> **Claude Code's role:** disciplined implementation from an approved plan. Lecture analysis and planning happen before Claude is involved. Claude receives an approved plan + wave scope and builds from it.

---

## Skills

Invoke via the Skill tool or by skill name. Each skill has a `SKILL.md` under `.claude/skills/{name}/`.

| Skill | When to Use |
|-------|-------------|
| `add-lecture` | Implementing a new lecture from an approved plan (structure, MDX, config, simulations) |
| `os-visualization` | Building any interactive simulation or visualization |
| `hebrew-rtl-content` | Writing or reviewing Hebrew content and RTL correctness |
| `os-algorithms` | Implementing OS algorithms (scheduling, paging, disk, deadlock) |
| `lecture-qa` | Quality check before marking a lecture as complete |
| `exam-oriented-content` | Writing concept explanations, comparisons, and exam callout blocks |
| `lecture-page-design` | Planning or reviewing lecture page structure and visual rhythm |

---

## Slash Commands

| Command | What It Does |
|---------|-------------|
| `/verify-lecture <id>` | Mechanical readiness checklist for a specific lecture |
| `/check-rtl` | Scan the codebase for RTL layout bugs |
| `/new-lecture-from-summary` | Guided workflow for creating a lecture from pasted content |

---

## Which skill for which task?

| Task | Primary Skill | Also Consult |
|------|--------------|-------------|
| Implementing a lecture from an approved plan | `add-lecture` | `exam-oriented-content`, `lecture-page-design` |
| Implementing a simulation from an approved viz plan | `os-visualization` | `os-algorithms` if algorithm logic is needed |
| New algorithm implementation | `os-algorithms` | — |
| Hebrew text or RTL fix | `hebrew-rtl-content` | — |
| Reviewing a finished lecture wave | `lecture-qa` | — |
| Writing exam-ready explanations | `exam-oriented-content` | `hebrew-rtl-content` |
| Reviewing page structure vs approved plan | `lecture-page-design` | — |
