interface SecondaryTopic {
  title: string;
  englishTerm?: string;
  description: string;
}

const SECONDARY_TOPICS: SecondaryTopic[] = [
  {
    title: 'חיזוי CPU burst',
    englishTerm: 'Burst Prediction',
    description:
      'ניגע ברעיון של חיזוי ה-burst הבא, בעיקר כדי להבין איך SJF יכול לעבוד בלי לדעת את העתיד באמת.',
  },
  {
    title: 'תזמון במערכות מרובות מעבדים',
    englishTerm: 'Multiple-Processor Scheduling',
    description:
      'נשאיר כאן מקום לשאלה מה משתנה כשיש יותר ממעבד אחד, בלי להיכנס עדיין לכל מקרי הקצה.',
  },
  {
    title: 'תזמון זמן אמת',
    englishTerm: 'Real-Time Scheduling',
    description:
      'נציג בהמשך את ההבדל בין מערכת שרוצה להיות מהירה לבין מערכת שחייבת לעמוד ב-deadline.',
  },
  {
    title: 'תזמון Threads',
    englishTerm: 'Thread Scheduling',
    description:
      'נחבר את הנושא ל-Threads ונראה באיזו רמה המערכת מקבלת החלטות תזמון.',
  },
  {
    title: 'דוגמאות ממערכות הפעלה',
    englishTerm: 'OS Examples',
    description:
      'בהמשך נוסיף מבט קצר על דוגמאות מהשקפים, בלי להפוך את ההרצאה לסקירת מערכות.',
  },
  {
    title: 'הערכת אלגוריתמים',
    englishTerm: 'Algorithm Evaluation',
    description:
      'נכין מקום להשוואת אלגוריתמים לפי מדדים כמו waiting time, turnaround time ו-response time.',
  },
  {
    title: 'שקפי תרגול',
    englishTerm: 'Practice Slides',
    description:
      'בסוף הגל המלא נוסיף שאלות בסגנון מבחן: לצייר Gantt, לחשב מדדים ולהסביר tradeoffs.',
  },
];

export default function SecondaryTopicsOverview() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {SECONDARY_TOPICS.map((topic) => (
        <article
          key={topic.title}
          className="rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h3 className="m-0 text-base font-bold text-slate-950 dark:text-slate-50">
              {topic.title}
            </h3>
            {topic.englishTerm ? (
              <span className="rounded-md border px-2 py-0.5 font-mono text-[10px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {topic.englishTerm}
              </span>
            ) : null}
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {topic.description}
          </p>
        </article>
      ))}
    </div>
  );
}
