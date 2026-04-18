---
name: hebrew-rtl-content
description: This skill should be used whenever writing, translating, or reviewing Hebrew content for the OS learning platform - including MDX lecture content, UI strings, error messages, tooltips, or any user-facing text. Use this skill when the user asks to "translate", "כתוב בעברית", "תרגם", or when generating any text content that users will see. Critical for maintaining proper technical terminology, RTL layout correctness, and consistent voice across all Hebrew content.
---

# Skill: Writing Hebrew Content and RTL Correctness

## Terminology Reference — Must Be Consistent

| English | Hebrew | Usage policy |
|---------|--------|--------------|
| Process | תהליך | Always translate |
| Thread | שרשור / Thread | Keep "Thread" in technical context |
| Scheduler | מתזמן / Scheduler | Context-dependent |
| Context Switch | החלפת הקשר (Context Switch) | Hebrew first, English in parentheses |
| CPU | מעבד / CPU | Context-dependent |
| Memory | זיכרון | Always translate |
| Page | דף (Page) | Hebrew first, English in parentheses |
| Page Fault | שגיאת דף (Page Fault) | Hebrew first, English in parentheses |
| Frame | מסגרת (Frame) | Hebrew first, English in parentheses |
| Paging | Paging | Keep in English |
| Segmentation | Segmentation | Keep in English |
| Semaphore | סמפור (Semaphore) | Hebrew first, English in parentheses |
| Mutex | Mutex | Keep in English |
| Deadlock | נעילה הדדית (Deadlock) | First use: Hebrew + parentheses; thereafter: Deadlock |
| Queue | תור | Always translate |
| Buffer | חוצץ (Buffer) | Hebrew first, English in parentheses |
| I/O | קלט/פלט (I/O) | Hebrew first, English in parentheses |
| Interrupt | פסיקה (Interrupt) | Hebrew first, English in parentheses |
| Kernel | גרעין (Kernel) | Hebrew first, English in parentheses |
| User Mode | מצב משתמש | Always translate |
| Race Condition | תנאי מרוץ (Race Condition) | Hebrew first, English in parentheses |
| Critical Section | קטע קריטי | Always translate |
| File Descriptor | מזהה קובץ (File Descriptor) | Hebrew first, English in parentheses |
| Inode | Inode | Keep in English |

---

## Writing Style

### Audience

Write for an Israeli student beginning the OS course. They are smart but may be encountering these concepts for the first time. Write like a good lecturer talks — not like a textbook is written.

### Tone
- **Clear and natural** — use everyday Israeli Hebrew, not formal or academic phrasing
- **Explanatory** — introduce a concept before building on it; never assume prior familiarity
- **Active voice** — "המתזמן בוחר את התהליך" not "התהליך נבחר על ידי המתזמן"
- **Concrete examples** — "לדוגמה, דמיין שפתחת Chrome..."

### Sentence structure
- Short sentences (15–20 words maximum)
- One paragraph = one idea
- Avoid loading a single sentence with multiple unfamiliar terms
- Avoid overusing "אנחנו" ("כאן אנחנו רואים ש... אנחנו יכולים לראות...")
- If a sentence feels heavy, split it or simplify the vocabulary

### Simplicity over completeness
- Prefer simple vocabulary when it accurately conveys the idea
- Avoid academic synonyms that add no clarity
- If content is technically correct but feels dense or intimidating, rewrite it more simply
- Use "דמיין ש..." / "לדוגמה..." / "זה דומה ל..." to ground abstract concepts

### Learning-product quality
Every Hebrew explanation must actively guide the student — not just deliver information. Prefer:
- "שים לב ש..." — draws attention
- "הנקודה החשובה כאן היא..." — signals emphasis
- "שגיאה נפוצה: לחשוב ש..." — flags misconceptions
- "לצורך המבחן: ..." — marks exam-critical content
- "זה נשמע מורכב, אבל בעצם..." — reduces intimidation before a hard concept

---

## Common RTL Bugs and Fixes

### 1. Reversed padding and margin
```tsx
// ❌ wrong — pl-*/pr-* flip in RTL
<div className="pl-4 mr-2">תוכן</div>

// ✅ correct — use logical properties
<div className="ps-4 me-2">תוכן</div>
```

### 2. Navigation arrows pointing the wrong way
```tsx
// ❌ In Hebrew, "next" goes right-to-left — this arrow reads as "next", not "previous"
<Button><ChevronLeft /> קודם</Button>

// ✅ correct
<Button><ChevronRight /> קודם</Button>
<Button>הבא <ChevronLeft /></Button>
```

### 3. Mixed Hebrew/English in the same sentence
```tsx
// ❌ numbers and slashes jump around in RTL
<p>הקובץ 3/10 נטען בתיקייה /home/user</p>

// ✅ wrap LTR segments in a dir="ltr" span
<p>
  הקובץ <span dir="ltr">3/10</span> נטען בתיקייה{' '}
  <span dir="ltr">/home/user</span>
</p>
```

### 4. Tables without RTL direction
```tsx
// ❌ headers will render LTR
<table>...</table>

// ✅ correct
<table dir="rtl">...</table>
```

### 5. Inline code mixed with Hebrew text in MDX
```mdx
<!-- ❌ mixed direction will break rendering -->
הפונקציה `fork()` יוצרת תהליך חדש.

<!-- ✅ wrap code element with explicit direction -->
הפונקציה <code dir="ltr">fork()</code> יוצרת תהליך חדש.
```

### 6. Whitespace around English terms in JSX
```tsx
// ❌ spaces may collapse
<p>השתמש בפונקציה{' '}<code>malloc</code>{' '}כדי להקצות זיכרון</p>

// ✅ consistent spacing pattern
<p>
  השתמש בפונקציה <code dir="ltr">malloc</code> כדי להקצות זיכרון
</p>
```

---

## Checklist for Every New Hebrew Content Block

- [ ] All Hebrew paragraphs wrapped in `<div dir="rtl">` or the whole document is RTL
- [ ] Technical terms consistent with the terminology table above
- [ ] No `pl-*` / `pr-*` — only `ps-*` / `pe-*`
- [ ] Numbers and file paths wrapped in `<span dir="ltr">`
- [ ] Navigation arrows are correct: ChevronRight = previous, ChevronLeft = next
- [ ] No typos — read twice
- [ ] Sentences are appropriately short (15–20 words max)
- [ ] Tables have `dir="rtl"`
- [ ] Inline code blocks use `<code dir="ltr">`
- [ ] Content actively guides student attention — not just flat information delivery
- [ ] Language is natural and beginner-friendly — not dense, academic, or intimidating
- [ ] Every new term is introduced before it is used
