import PageShell from '../components/PageShell';
import IoSchedulingSimulator from '../visualizations/IoSchedulingSimulator';

export default function IoRoundRobinPage() {
  return (
    <PageShell
      eyebrow="Round Robin עם I/O"
      title="Round Robin עם I/O"
      intro="תהליכים אמיתיים עוברים בין CPU ל-I/O. למד איך ה-Scheduler מגיב למעברים האלה ואיך מחשבים את המדדים."
    >
      <div className="space-y-6" dir="rtl">

        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <h3 className="m-0 mb-2 text-base font-bold text-amber-900 dark:text-amber-200">
            מה חדש כאן
          </h3>
          <ul className="m-0 space-y-1 ps-5 text-sm text-amber-800 dark:text-amber-300">
            <li>תהליך ב-I/O <strong>לא נמצא ב-Ready Queue</strong> — ה-Scheduler לא יכול לבחור אותו</li>
            <li>כשה-I/O מסתיים, התהליך <strong>חוזר לסוף ה-Ready Queue</strong></li>
            <li>
              <strong>Waiting Time</strong> = Turnaround − CPU Time − I/O Time (לא כולל זמן I/O)
            </li>
            <li>
              <strong>Response Time</strong> = מהגעה עד ה-CPU הראשון בלבד
            </li>
          </ul>
        </section>

        <IoSchedulingSimulator />

        <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
            חשוב למבחן
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
              <div className="mb-1 font-bold text-blue-800 dark:text-blue-200">נוסחת Waiting עם I/O</div>
              <div className="font-mono text-xs text-blue-700 dark:text-blue-300">
                W = Turnaround − CPU Time − I/O Time
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                זמן ה-I/O <strong>לא</strong> נספר כ-Waiting — התהליך עובד, לא מחכה ל-Scheduler.
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="mb-1 font-bold text-emerald-800 dark:text-emerald-200">Turnaround לא משתנה</div>
              <div className="font-mono text-xs text-emerald-700 dark:text-emerald-300">
                T = זמן סיום − זמן הגעה
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Turnaround תמיד מסיום עד הגעה — לא משנה כמה שלבים יש לתהליך.
              </div>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
              <div className="mb-1 font-bold text-violet-800 dark:text-violet-200">Response = הפעם הראשונה</div>
              <div className="font-mono text-xs text-violet-700 dark:text-violet-300">
                R = זמן התחלה ראשון − זמן הגעה
              </div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                Response נספר רק פעם אחת — הפעם הראשונה שהתהליך קיבל CPU.
              </div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="mb-1 font-bold text-slate-800 dark:text-slate-200">טעות נפוצה</div>
              <div className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                לא לשכוח שתהליך שחוזר מ-I/O נכנס לסוף ה-Ready Queue —
                לא קופץ לראש, גם אם הוא רק חזר מ-I/O.
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
