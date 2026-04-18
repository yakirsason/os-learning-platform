import PageShell from '../components/PageShell';
import ComparisonWaitingTimeSimulator from '../visualizations/ComparisonWaitingTimeSimulator';

export default function ComparisonWaitingTimePage() {
  return (
    <PageShell
      eyebrow="השוואת אלגוריתמים"
      title="השוואה על אותו עומס עבודה"
      intro="אותו preset, ארבעה אלגוריתמים, ארבע תוצאות שונות. התצוגה המהירה מציגה מדדים ממוצעים לצד מיני ציר זמן; לחיצה על כרטיסייה פותחת בדיקה מעמיקה עם ציר זמן מלא ופירוט חישוב."
    >
      <div className="space-y-6" dir="rtl">

        <section className="grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              מה משווים
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              ארבעה אלגוריתמים: <strong>SJF</strong>, <strong>SRTF</strong>,{' '}
              <strong>Round Robin</strong>, <strong>MLFQ</strong>. כל אחד רץ על
              אותו preset בדיוק — רק המדיניות שונה.
            </p>
          </div>
          <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              למה זה חשוב
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              השאלה הקלאסית "מי מינימלי ב-Waiting / Turnaround?" — התשובה
              משתנה לפי האלגוריתם. כאן רואים את זה מספרית ובציר זמן על אותם
              נתונים.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              נקודה חשובה
            </div>
            <p className="m-0 leading-relaxed text-slate-700 dark:text-slate-200">
              כל המדדים מחושבים על ידי מנועים <strong>מודעים ל-I/O</strong>.
              Waiting Time לא כולל את זמן ה-I/O.
            </p>
          </div>
        </section>

        <ComparisonWaitingTimeSimulator />

        <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
            חשוב למבחן
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm dark:border-blue-900 dark:bg-blue-950/30">
              <div className="mb-1 font-bold text-blue-800 dark:text-blue-200">
                SJF ו-SRTF ממזערים Waiting
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                על עומס קבוע וידוע, SJF nonpreemptive נותן ממוצע Waiting
                מינימלי. SRTF משפר עוד יותר את ה-Waiting באמצעות preemption.
              </div>
            </div>
            <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/30">
              <div className="mb-1 font-bold text-rose-800 dark:text-rose-200">
                RR נותן Response מהיר
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                ה-quantum מבטיח שכל תהליך מקבל CPU מהר יחסית — Response Time
                קצר, אבל Waiting עלול להיות גדול יותר.
              </div>
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="mb-1 font-bold text-emerald-800 dark:text-emerald-200">
                MLFQ משלב שני העולמות
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                תהליכים קצרים נשארים בתור העליון (response טוב), תהליכים
                ארוכים יורדים לתור איטי ומפנים דרך. בלי לדעת מראש מה ה-burst.
              </div>
            </div>
            <div className="rounded-lg border border-violet-200 bg-violet-50 p-3 text-sm dark:border-violet-900 dark:bg-violet-950/30">
              <div className="mb-1 font-bold text-violet-800 dark:text-violet-200">
                I/O חשוב לחישוב Waiting
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300">
                הנוסחה: <span className="font-mono">W = T − CPU − I/O</span>.
                שכח להוריד I/O → תקבל Waiting שגוי. זה הבדל קלאסי בשאלות מבחן.
              </div>
            </div>
          </div>
        </section>

      </div>
    </PageShell>
  );
}
