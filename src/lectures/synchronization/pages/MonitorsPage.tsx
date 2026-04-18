import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';

export default function MonitorsPage() {
  return (
    <PageShell
      eyebrow="Monitors"
      title="Monitors"
      intro="Semaphores עובדים, אבל טעות קטנה בסדר wait/signal עלולה לגרום לbug קשה לאיתור. Monitor הוא מבנה ברמה גבוהה שמוריד את הסיכוי לטעויות."
    >
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          הסכנה בשימוש שגוי בסמאפורים
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-red-800 dark:text-red-300" dir="ltr">
              signal(mutex) → wait(mutex)
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              הופכים את הסדר — פתאום critical section ריק ממגן. שני תהליכים בו-זמנית.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-red-800 dark:text-red-300" dir="ltr">
              wait(mutex) → wait(mutex)
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              קוראים wait פעמיים בלי signal — deadlock מיידי.
            </p>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          הבעיה: אין בשפה שום מנגנון שימנע את הטעויות האלו. Monitor בא לפתור זאת.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          מהו Monitor?
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Monitor הוא סוג מיוחד של מחלקה (ADT — Abstract Data Type) שבה המשתנים המשותפים הם פרטיים,
          ורק הפונקציות המוגדרות ב-monitor יכולות לגשת אליהם.
          <strong> בכל רגע, לא יותר מתהליך אחד יכול להיות פעיל בתוך ה-monitor.</strong>
          המידול הזה מובנה בשפה — הפרוגרמר לא צריך לדאוג ידנית לסנכרון.
        </p>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div>
            <span className="text-violet-400">monitor</span>
            <span className="text-blue-300"> MonitorName</span>
            <span className="text-slate-300"> {'{'}</span>
          </div>
          <div className="ps-4 text-slate-400">{'// shared variables (private)'}</div>
          <div className="ps-4">
            <span className="text-amber-400">procedure</span>
            <span className="text-blue-300"> P1</span>
            <span className="text-slate-300">(...) {'{ ... }'}</span>
          </div>
          <div className="ps-4">
            <span className="text-amber-400">procedure</span>
            <span className="text-blue-300"> P2</span>
            <span className="text-slate-300">(...) {'{ ... }'}</span>
          </div>
          <div className="ps-4">
            <span className="text-amber-400">initialization code</span>
            <span className="text-slate-300"> {'{ ... }'}</span>
          </div>
          <div className="text-slate-300">{'}'}</div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          Condition Variables
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          לפעמים תהליך שנמצא ב-monitor צריך לחכות שתנאי מסוים יתקיים.
          Condition variable מאפשר לו לפנות את ה-monitor ולהמתין.
        </p>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-blue-800 dark:text-blue-300" dir="ltr">
              x.wait()
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              התהליך מושהה ומפנה את ה-monitor עד שמישהו יקרא <span dir="ltr" className="font-mono">x.signal()</span>.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300" dir="ltr">
              x.signal()
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              מעיר תהליך אחד שממתין על <span dir="ltr" className="font-mono">x</span>. אם אין ממתינים — אין אפקט (בניגוד ל-signal של semaphore).
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-300">
          Bounded Buffer עם Monitor
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          ב-monitor, ה-mutual exclusion כבר מובנה. צריך רק שתי condition variables:
          <span dir="ltr" className="font-mono"> notFull</span> (המפיק ממתין כשהחוצץ מלא) ו-<span dir="ltr" className="font-mono">notEmpty</span> (הצרכן ממתין כשהחוצץ ריק).
          המפיק מוסיף פריט וקורא <span dir="ltr" className="font-mono">notEmpty.signal()</span>; הצרכן מוציא וקורא <span dir="ltr" className="font-mono">notFull.signal()</span>.
        </p>
      </div>

      <div className="rounded-lg border border-violet-100 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/20">
        <div className="mb-2 text-sm font-semibold text-violet-800 dark:text-violet-300">
          Dining Philosophers עם Monitor
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          כל פילוסוף קורא <span dir="ltr" className="font-mono">pickup(i)</span> לפני האכילה ו-<span dir="ltr" className="font-mono">putdown(i)</span> אחריה.
          ה-monitor עוקב אחר המצב של כל פילוסוף (thinking / hungry / eating) ומוודא שפילוסוף יוכל לאכול רק אם שכניו לא אוכלים.
          הפתרון הזה <strong>ללא deadlock</strong> — אבל עדיין עלול לגרום לרעב לפילוסוף ספציפי.
        </p>
      </div>

      <StudyCallout variant="exam">
        ההבדל בין <span dir="ltr">condition.signal()</span> ל-<span dir="ltr">semaphore signal()</span>:
        אם אין ממתינים — ב-condition variable אין אפקט; ב-semaphore הערך עולה ונשמר.
        זהו הבדל מהותי שצריך לדעת.
      </StudyCallout>

      <StudyCallout variant="remember">
        Monitor = מחלקה עם mutual exclusion מובנה + condition variables לתיאום. הפרוגרמר לא מנהל נעילות ידנית.
      </StudyCallout>
    </PageShell>
  );
}
