import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function RoundRobinSection() {
  return (
    <AlgorithmSectionLayout
      id="round-robin"
      title="Round Robin"
      englishName="Round Robin"
      explanation="כל תהליך מקבל פרק זמן קצר שנקרא quantum. אם הוא לא סיים בזמן הזה, הוא חוזר לסוף התור."
      whyItMatters="זה האלגוריתם המרכזי להבנת שיתוף זמן: הוא מנסה לתת תחושה שכל התהליכים מתקדמים, ולא שתהליך אחד משתלט על המעבד."
      simulatorNote="בדמו למטה רואים מתי quantum נגמר, איך התהליך חוזר לסוף ה-Ready Queue, ומי רץ אחריו."
      noteTitle="Preemptive"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            מה גורם ל-preemption?
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            לא תהליך קצר יותר ולא priority גבוה יותר. ב-Round Robin ה-timer עוצר את התהליך
            כשה-quantum שלו נגמר.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            מה קורה אחרי quantum?
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            אם התהליך לא סיים, הוא לא נעלם. הוא חוזר לסוף ה-Ready Queue ומחכה לתור הבא שלו.
          </p>
        </div>
      </div>
    </AlgorithmSectionLayout>
  );
}
