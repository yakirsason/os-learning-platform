import PageShell from '../components/PageShell';
import MlfqSimulator from '../visualizations/MlfqSimulator';

export default function MultilevelFeedbackQueuePage() {
  return (
    <PageShell
      eyebrow="Multilevel Feedback Queue"
      title="Multilevel Feedback Queue"
      intro="תורים מרובי רמות עם משוב: תהליך יכול לנוע בין התורים לפי ההתנהגות שלו. מי שמנצל הרבה CPU יורד לתור איטי יותר, ומפנה דרך לתהליכים קצרים."
    >
      <div className="space-y-6" dir="rtl">

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              מה הרעיון
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              כמה תורים עם quantum שונה. כל תהליך <strong>מתחיל בתור העליון</strong>.
              אם הוא צורך הרבה CPU — הוא יורד. אם הוא סיים — הוא יצא.
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              למה זה חשוב
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              מערכת לומדת משהו מההתנהגות: תהליכים קצרים נשארים למעלה ומקבלים
              תגובה מהירה, תהליכים ארוכים יורדים ומפנים דרך.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              נקודה חשובה
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              ב-MLFQ תהליך לא חייב להישאר בתור שלו. זה ההבדל המהותי מ-MLQ.
            </p>
          </div>
        </section>

        <MlfqSimulator />

        <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
            חשוב למבחן
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
              <div className="mb-1 font-bold text-blue-800 dark:text-blue-200">
                כלל הכניסה
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                כל תהליך חדש <strong>נכנס ל-Q1</strong> (העליון), לא משנה מה
                צפוי ה-burst שלו.
              </div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/30">
              <div className="mb-1 font-bold text-rose-800 dark:text-rose-200">
                כלל הירידה (Demotion)
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                ניצל quantum שלם ולא סיים → <strong>יורד לתור הבא</strong>.
                בתור התחתון נשאר בלולאה (RR עם quantum גדול).
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="mb-1 font-bold text-emerald-800 dark:text-emerald-200">
                בחירת תהליך
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                ה-CPU תמיד בוחר מהתור <strong>הגבוה ביותר שהוא לא ריק</strong>.
                אם Q1 ו-Q2 שניהם יש בהם תהליכים — Q1 ינצח.
              </div>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
              <div className="mb-1 font-bold text-violet-800 dark:text-violet-200">
                Promotion / Aging
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                בהדמיה הזאת אין קידום חזרה למעלה. בגרסאות מלאות של MLFQ מוסיפים
                aging כדי למנוע starvation של תהליכים שנפלו לתחתית.
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
