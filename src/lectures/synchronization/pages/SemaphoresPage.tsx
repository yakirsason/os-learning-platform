import ConceptCard from '@/components/common/ConceptCard';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import SemaphoreSimulator from '../visualizations/SemaphoreSimulator';

export default function SemaphoresPage() {
  return (
    <PageShell
      eyebrow="Semaphores"
      title="Semaphores"
      intro="Semaphore הוא כלי סנכרון שמאפשר לא רק mutual exclusion, אלא גם תיאום של סדר ביצוע בין תהליכים."
    >
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          הגדרה ופעולות בסיסיות
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          Semaphore הוא משתנה שלם שנגיש רק דרך שתי פעולות אטומיות: <span dir="ltr" className="font-mono">wait()</span> ו-<span dir="ltr" className="font-mono">signal()</span>.
        </p>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// busy-wait version (spinlock)'}</div>
          <div className="mt-2">
            <span className="text-amber-400">wait</span>
            <span className="text-slate-300">(S) {'{'}</span>
          </div>
          <div className="ps-4">
            <span className="text-amber-400">while</span>
            <span className="text-slate-300"> (S &lt;= 0) ; </span>
            <span className="text-slate-400">// busy wait</span>
          </div>
          <div className="ps-4">
            <span className="text-slate-300">S--;</span>
          </div>
          <div className="text-slate-300">{'}'}</div>
          <div className="mt-3">
            <span className="text-emerald-400">signal</span>
            <span className="text-slate-300">(S) {'{'}</span>
          </div>
          <div className="ps-4">
            <span className="text-slate-300">S++;</span>
          </div>
          <div className="text-slate-300">{'}'}</div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ConceptCard
          title="Binary Semaphore"
          englishTerm="Binary Semaphore / Mutex"
          description="ערך בין 0 ל-1 בלבד. משמש כמנעול (mutex) לביצוע mutual exclusion. מאוד דומה ל-lock."
          variant="info"
        />
        <ConceptCard
          title="Counting Semaphore"
          englishTerm="Counting Semaphore"
          description="ערך שלם כלשהו — יכול לייצג מספר משאבים זמינים. למשל, 5 מדפסות: הסמאפור מתחיל ב-5 ויורד עם כל שימוש."
          variant="info"
        />
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-300">
          דוגמה: תיאום סדר ביצוע
        </div>
        <p className="mb-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          רוצים שS1 יבוצע לפני S2 — גם אם P1 ו-P2 רצים במקביל:
        </p>
        <div className="rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// semaphore synch = 0;'}</div>
          <div className="mt-2 text-emerald-400">{'// P1:'}</div>
          <div>{'  S1;'}</div>
          <div>{'  signal(synch);'}</div>
          <div className="mt-2 text-blue-400">{'// P2:'}</div>
          <div>{'  wait(synch);'}</div>
          <div>{'  S2;'}</div>
        </div>
        <p className="m-0 mt-2 text-xs text-slate-600 dark:text-slate-300">
          P2 יחכה ב-wait עד שP1 יסיים את S1 ויפעיל signal. כך מובטח הסדר.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          מימוש עם תור חסימה (Blocking)
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          במקום busy-wait, אפשר לחסום את התהליך ולהעיר אותו רק כשהמשאב פנוי.
        </p>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// Semaphore with waiting queue:'}</div>
          <div className="mt-1 text-slate-400">{'// { int value; struct process *list; }'}</div>
          <div className="mt-3">
            <span className="text-amber-400">wait</span>
            <span className="text-slate-300">(semaphore *S) {'{'}</span>
          </div>
          <div className="ps-4 text-slate-300">S-&gt;value--;</div>
          <div className="ps-4">
            <span className="text-amber-400">if</span>
            <span className="text-slate-300"> (S-&gt;value &lt; 0) {'{'}</span>
          </div>
          <div className="ps-8 text-slate-400">{'// add to waiting list'}</div>
          <div className="ps-8 text-slate-300">block();</div>
          <div className="ps-4 text-slate-300">{'}'}</div>
          <div className="text-slate-300">{'}'}</div>
          <div className="mt-3">
            <span className="text-emerald-400">signal</span>
            <span className="text-slate-300">(semaphore *S) {'{'}</span>
          </div>
          <div className="ps-4 text-slate-300">S-&gt;value++;</div>
          <div className="ps-4">
            <span className="text-amber-400">if</span>
            <span className="text-slate-300"> (S-&gt;value &lt;= 0) {'{'}</span>
          </div>
          <div className="ps-8 text-slate-400">{'// remove process P from list'}</div>
          <div className="ps-8 text-slate-300">wakeup(P);</div>
          <div className="ps-4 text-slate-300">{'}'}</div>
          <div className="text-slate-300">{'}'}</div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
          שימו לב: ב-blocking semaphore, הערך יכול להיות שלילי — הגודל המוחלט מציין כמה תהליכים ממתינים.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          בעיות אפשריות
        </h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">Deadlock</div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              שני תהליכים ממתינים זה לזה. P0 מחזיק S ומחכה ל-Q; P1 מחזיק Q ומחכה ל-S.
              שניהם חסומים לנצח — זהו Deadlock.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-sm font-semibold text-amber-800 dark:text-amber-300">Starvation (רעב)</div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              תהליך ממתין בתור הסמאפור ולא מקבל תור לעולם, כי תהליכים אחרים תמיד נכנסים לפניו.
              תלוי בסדר שבו מוצאים תהליכים מהתור (LIFO במקום FIFO יכול לגרום לרעב).
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
              Busy Waiting / Spinlock
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              במימוש הפשוט (spinlock), תהליך ממתין בלולאה ובוזבז CPU. זה בעייתי כשה-critical section ארוכה,
              אבל עשוי להיות יעיל כשהמתנה קצרה מאוד (כמו במערכות multiprocessor).
            </p>
          </div>
        </div>
      </div>

      <StudyCallout variant="exam">
        חשוב למבחן: <br />
        1. wait() קודם ל-signal() — לא הפוך. <br />
        2. הפעולות חייבות להיות אטומיות — ה-OS מבטיח זאת. <br />
        3. ב-blocking semaphore: ערך שלילי = מספר התהליכים הממתינים.
      </StudyCallout>

      <section className="w-full min-w-0 space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
        <header className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-slate-950 dark:text-slate-50">
            הדמיה: סמאפור עם תור חסימה
          </h3>
          <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>מה לעקוב אחריו:</strong> ערך הסמאפור (<span dir="ltr" className="font-mono">S.value</span>),
            התור הוויזואלי, ומצב כל תהליך — מוכן, בקטע הקריטי, חסום או סיים.
            התרחיש "עם תור" מציג את ההבדל המרכזי מ-busy waiting: אין בזבוז CPU, רק ערך שלילי + תור FIFO.
          </p>
        </header>
        <SemaphoreSimulator />
      </section>
    </PageShell>
  );
}
