import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import ReadersWritersDemo from '../visualizations/ReadersWritersDemo';

export default function ReadersWritersPage() {
  return (
    <PageShell
      eyebrow="Readers-Writers Problem"
      title="Readers-Writers"
      intro="מסד נתונים משותף: קוראים רבים יכולים לגשת בו-זמנית, אבל כותב אחד דורש גישה בלעדית לכולם."
    >
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          הגדרת הבעיה
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">קוראים (Readers)</div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              רק קוראים — לא משנים נתונים. כמה קוראים יכולים לגשת בו-זמנית בלי בעיה.
            </p>
          </div>
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
            <div className="mb-1 text-sm font-semibold text-red-800 dark:text-red-300">כותבים (Writers)</div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              משנים נתונים — דורשים גישה בלעדית. בזמן כתיבה אף קורא ואף כותב אחר לא יכול לגשת.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          המשתנים המשותפים
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border p-3 dark:border-slate-700">
            <div className="mb-1 font-mono text-xs font-bold text-slate-700 dark:text-slate-200" dir="ltr">
              semaphore mutex = 1
            </div>
            <p className="m-0 text-xs text-slate-600 dark:text-slate-300">
              מגן על הגישה ל-readcount.
            </p>
          </div>
          <div className="rounded-lg border p-3 dark:border-slate-700">
            <div className="mb-1 font-mono text-xs font-bold text-slate-700 dark:text-slate-200" dir="ltr">
              semaphore wrt = 1
            </div>
            <p className="m-0 text-xs text-slate-600 dark:text-slate-300">
              mutual exclusion לכותבים. גם הקורא הראשון והאחרון משתמשים בו.
            </p>
          </div>
          <div className="rounded-lg border p-3 dark:border-slate-700">
            <div className="mb-1 font-mono text-xs font-bold text-slate-700 dark:text-slate-200" dir="ltr">
              int readcount = 0
            </div>
            <p className="m-0 text-xs text-slate-600 dark:text-slate-300">
              כמה קוראים נמצאים כרגע בגישה.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-semibold text-red-700 dark:text-red-300">כותב (Writer)</div>
          <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
            <div>
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(wrt);</span>
            </div>
            <div className="text-slate-400">{'// writing...'}</div>
            <div>
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(wrt);</span>
            </div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">קורא (Reader)</div>
          <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
            <div>
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="text-slate-300">readcount++;</div>
            <div>
              <span className="text-amber-400">if</span>
              <span className="text-slate-300"> (readcount == 1)</span>
            </div>
            <div className="ps-4">
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(wrt); </span>
              <span className="text-slate-400">{'// first reader'}</span>
            </div>
            <div>
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="text-slate-400">{'// reading...'}</div>
            <div>
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="text-slate-300">readcount--;</div>
            <div>
              <span className="text-amber-400">if</span>
              <span className="text-slate-300"> (readcount == 0)</span>
            </div>
            <div className="ps-4">
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(wrt); </span>
              <span className="text-slate-400">{'// last reader'}</span>
            </div>
            <div>
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="mb-2 text-sm font-semibold text-blue-800 dark:text-blue-300">ההגיון מאחורי הפתרון</div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          הקורא <em>הראשון</em> לוקח את <span dir="ltr" className="font-mono">wrt</span> — כדי לחסום כותבים בזמן שקוראים קוראים.
          הקורא <em>האחרון</em> משחרר את <span dir="ltr" className="font-mono">wrt</span> — כדי לאפשר לכותב להיכנס.
          קוראים שנכנסים באמצע לא נוגעים ב-<span dir="ltr" className="font-mono">wrt</span> כלל.
        </p>
      </div>

      <StudyCallout variant="remember" title="הקורא הראשון והאחרון">
        רק הקורא הראשון נועל את <span dir="ltr" className="font-mono">wrt</span>, ורק הקורא האחרון משחרר אותו.
        כל הקוראים שבאמצע רק מעדכנים את <span dir="ltr" className="font-mono">readcount</span>.
        זו הסיבה שכותב חסום כל עוד יש לפחות קורא פעיל אחד.
      </StudyCallout>

      <section className="w-full min-w-0 space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
        <header className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-slate-950 dark:text-slate-50">
            הדמיה: Readers-Writers צעד-צעד
          </h3>
          <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>מה לעקוב אחריו:</strong> מצב המסד (פנוי / בקריאה משותפת / בכתיבה בלעדית),{' '}
            <span dir="ltr" className="font-mono">readcount</span>,{' '}
            <span dir="ltr" className="font-mono">mutex</span>, ו-<span dir="ltr" className="font-mono">wrt</span>.
            התרחיש "Writer ממתין" מדגים איך הקורא האחרון משחרר את wrt ומאפשר לכותב לעבור.
          </p>
        </header>
        <ReadersWritersDemo />
      </section>

      <StudyCallout variant="pitfall">
        הבעיה הראשונה (First Readers-Writers) עלולה לגרום לרעב לכותבים: כל עוד יש קוראים בתור, כותב לעולם לא יקבל תור.
        זוהי בעיה מוכרת בפתרון הבסיסי — הוגנות (fairness) לכותבים דורשת פתרון מתוחכם יותר.
      </StudyCallout>
    </PageShell>
  );
}
