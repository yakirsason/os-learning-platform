# מערכות הפעלה - פלטפורמת למידה ויזואלית

אתר מקומי ללמידה אינטראקטיבית של קורס מערכות הפעלה - עם אנימציות, הדמיות,
והסברים בעברית. כל הרצאה היא עמוד עצמאי עם קומפוננטות ויזואליות שניתן להתנסות בהן.

## Stack טכנולוגי

| שכבה | טכנולוגיה |
|------|-----------|
| Build | Vite 5 + React 18 + TypeScript (strict) |
| עיצוב | Tailwind CSS + shadcn/ui |
| אנימציה | Framer Motion |
| ניווט | React Router v6 |
| State | Zustand + persist (localStorage) |
| תוכן | MDX (`@mdx-js/rollup`) |
| אייקונים | Lucide React |
| תרשימים | Recharts |
| פונטים | Heebo (עברית) + JetBrains Mono (קוד) |

כל האתר ב-RTL עם `lang="he"` ו-`dir="rtl"`.

## הוראות הפעלה

```bash
npm install
npm run dev
```

האתר יעלה ב-`http://localhost:5173`.

## מבנה התיקיות

```
src/
├── components/
│   ├── ui/               # קומפוננטות shadcn (button, card, tabs ...)
│   ├── layout/           # Header, Sidebar, Layout
│   ├── visualizations/   # הדמיות לפי נושא - ימולאו בעתיד
│   │   ├── processes/
│   │   ├── scheduling/
│   │   ├── sync/
│   │   ├── memory/
│   │   ├── vmem/
│   │   ├── filesystem/
│   │   ├── deadlock/
│   │   └── io/
│   └── common/           # StepController, ConceptCard, InteractiveDemo, EmptyLecture
├── lectures/             # תוכן הרצאות (MDX) - ימולא הרצאה-הרצאה
├── pages/                # Home, LecturePage
├── store/                # useLectureStore (Zustand + persist)
├── lib/
│   ├── utils.ts          # cn() מיזוג מחלקות Tailwind
│   └── algorithms/       # אלגוריתמים משותפים (Scheduling, Paging וכו') - ימולא בעתיד
├── config/
│   └── lectures.ts       # רישום מרכזי של 8 ההרצאות
├── types/
│   └── index.ts          # LectureMetadata, LectureStatus
├── App.tsx
├── main.tsx
└── index.css
```

## איך מוסיפים הרצאה חדשה

המטרה של הארכיטקטורה היא שכל הרצאה נוספת בצורה דטרמיניסטית ועקבית, בלי שבירת
תשתית קיימת.

1. פתח צ'אט עם Claude (ב-claude.ai) ושלח את מצגת הקורס הרלוונטית (PDF או PPTX).
2. בקש מ-Claude "prompt ל-Claude Code להוספת הרצאה לפלטפורמת הלמידה שלי".
3. ה-prompt שתקבל יכיל:
   - מבנה MDX של התוכן ב-`src/lectures/{id}/index.mdx`.
   - קומפוננטות ויזואליזציה ב-`src/components/visualizations/{topic}/`.
   - אלגוריתמים טהורים ב-`src/lib/algorithms/` (אם צריך).
   - עדכון `src/config/lectures.ts` - שינוי `isReady` ל-`true` והוספת מטא-דאטה.
4. הדבק את ה-prompt ל-Claude Code בתוך הפרויקט הזה ואשר את הפעולה.

## איזה מודל להשתמש

| משימה | מודל מומלץ | effort |
|--------|------------|--------|
| תשתית ראשונית, הדמיות מורכבות | Opus 4.7 | high/xhigh |
| הרצאה רגילה (MDX + הדמיה בינונית) | Sonnet 4.6 | medium |
| עריכות קטנות, תיקון טקסט, תיקון RTL | Haiku 4.5 | default |

המלצה: עבור כל הרצאה חדשה התחל ב-Sonnet; אם הנושא דורש הדמיה אלגוריתמית מורכבת
(למשל Banker's Algorithm) - עבור ל-Opus.

## תיעוד פנימי

- מצב התקדמות המשתמש נשמר ב-`localStorage` תחת המפתח `os-learning-storage`.
- `dark mode` נשמר באותו storage ומסונכרן עם מחלקת `.dark` על `<html>`.
- כל הרצאה מזוהה ב-`id` קבוע (`processes`, `scheduling`, ...) שמשמש גם כשם
  התיקייה ב-`src/lectures/` וגם בנתיב הניווט (`/lecture/{id}`).
- כל עוד `isReady === false` בקובץ התצורה - ייצוג ההרצאה הוא `EmptyLecture`,
  גם אם קיים קובץ MDX.
