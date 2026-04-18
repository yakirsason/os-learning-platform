import PageShell from '../components/PageShell';
import MlqSimulator from '../visualizations/MlqSimulator';

export default function MultilevelQueuePage() {
  return (
    <PageShell
      eyebrow="Multilevel Queue"
      title="Multilevel Queue"
      intro="מחלקים תהליכים לכמה תורים קבועים. כל תור יכול להיות עם מדיניות משלו. ה-CPU תמיד רץ מהתור הלא-ריק עם העדיפות הגבוהה ביותר."
    >
      <div className="space-y-6" dir="rtl">

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              מה הרעיון
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              לכל תהליך יש תור <strong>קבוע</strong>. לכל תור יכולה להיות
              מדיניות שונה (Round Robin, FCFS, ועוד).
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              למה זה חשוב
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              מאפשר להפריד בין תהליכים דחופים (foreground) לתהליכים ארוכי-טווח
              (background) בלי לערבב אותם.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              נקודה חשובה
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              תהליך <strong>לא</strong> עובר בין תורים. זה ההבדל המרכזי מול
              MLFQ.
            </p>
          </div>
        </section>

        <MlqSimulator />

        <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
            חשוב למבחן
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
              <div className="mb-1 font-bold text-blue-800 dark:text-blue-200">
                בחירת תהליך
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                ה-CPU תמיד בוחר מ-<strong>התור הלא-ריק בעדיפות הגבוהה
                ביותר</strong>. בתוך התור — לפי המדיניות של אותו תור.
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="mb-1 font-bold text-emerald-800 dark:text-emerald-200">
                Preemption בין תורים
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                אם תהליך מתור גבוה יותר נכנס ל-Ready בזמן שרץ תהליך מתור נמוך,
                הוא <strong>עוצר</strong> אותו ולוקח CPU.
              </div>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
              <div className="mb-1 font-bold text-violet-800 dark:text-violet-200">
                Starvation
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                אם התור הגבוה אף פעם לא מתרוקן, התור הנמוך אף פעם לא יקבל CPU.
                זהו ה-starvation הקלאסי של MLQ.
              </div>
            </div>
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
              <div className="mb-1 font-bold text-amber-800 dark:text-amber-200">
                ההבדל מ-MLFQ
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                ב-MLQ: תהליך נולד בתור מסוים ו<strong>נשאר</strong> שם. ב-MLFQ:
                הוא יכול לזוז בין התורים לפי ההתנהגות שלו.
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
