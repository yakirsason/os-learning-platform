---
name: check-rtl
description: Scan the codebase for common RTL issues
---

Scan the `src/` directory for common RTL issues:

1. Find any `pl-*` or `pr-*` Tailwind classes in `.tsx` / `.mdx` files - they should be `ps-*` / `pe-*`.
2. Find any `<ChevronLeft>` or `<ChevronRight>` - verify the direction is semantically correct (קודם = Right, הבא = Left).
3. Find any Hebrew text blocks without `dir="rtl"` wrapping (look inside `.mdx` files for large Hebrew paragraphs that aren't wrapped).
4. Find any inline English (code, paths, numbers) inside Hebrew text without `<span dir="ltr">` wrapping.
5. Find any `ml-*` / `mr-*` margin classes that should be `ms-*` / `me-*`.
6. Find any `text-left` / `text-right` that should be `text-start` / `text-end`.

Report findings as a bulleted list with `file:line` references. Don't fix automatically - just report, and at the end ask the user which issues they want fixed.

Use the Grep tool for the scan - don't run shell commands.
