import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import BoundedBufferDemo from '../visualizations/BoundedBufferDemo';

export default function BoundedBufferPage() {
  return (
    <PageShell
      eyebrow="Bounded Buffer Problem"
      title="Bounded Buffer"
      intro="מפיק (Producer) מכניס פריטים לחוצץ בגודל n, וצרכן (Consumer) מוציא אותם. הגישה לחוצץ צריכה להיות מסונכרנת."
    >
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          הגדרת הבעיה
        </h2>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          יש חוצץ (buffer) עם n מיקומים. המפיק מוסיף פריטים בזה אחר זה, והצרכן מוציא.
          צריך לוודא ש:
        </p>
        <ul className="mt-2 space-y-1 text-sm text-slate-700 dark:text-slate-300">
          <li>• המפיק לא יוסיף לחוצץ מלא.</li>
          <li>• הצרכן לא יוציא מחוצץ ריק.</li>
          <li>• גישה בו-זמנית לחוצץ תהיה עם mutual exclusion.</li>
        </ul>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          שלושת הסמאפורים
        </h2>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-blue-800 dark:text-blue-300" dir="ltr">
              mutex = 1
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              מבטיח mutual exclusion — רק תהליך אחד ניגש לחוצץ בכל רגע.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-emerald-800 dark:text-emerald-300" dir="ltr">
              empty = n
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              מציין כמה מיקומים פנויים יש. המפיק ממתין כשאין מקום.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-amber-800 dark:text-amber-300" dir="ltr">
              full = 0
            </div>
            <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
              מציין כמה פריטים יש בחוצץ. הצרכן ממתין כשהחוצץ ריק.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            מפיק (Producer)
          </div>
          <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
            <div>
              <span className="text-amber-400">while</span>
              <span className="text-slate-300"> (</span>
              <span className="text-emerald-400">true</span>
              <span className="text-slate-300">) {'{'}</span>
            </div>
            <div className="ps-4 text-slate-400">{'// produce item'}</div>
            <div className="ps-4">
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(empty);</span>
            </div>
            <div className="ps-4">
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="ps-4 text-slate-400">{'// add to buffer'}</div>
            <div className="ps-4">
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="ps-4">
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(full);</span>
            </div>
            <div className="text-slate-300">{'}'}</div>
          </div>
        </div>
        <div>
          <div className="mb-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            צרכן (Consumer)
          </div>
          <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
            <div>
              <span className="text-amber-400">while</span>
              <span className="text-slate-300"> (</span>
              <span className="text-emerald-400">true</span>
              <span className="text-slate-300">) {'{'}</span>
            </div>
            <div className="ps-4">
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(full);</span>
            </div>
            <div className="ps-4">
              <span className="text-blue-300">wait</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="ps-4 text-slate-400">{'// remove from buffer'}</div>
            <div className="ps-4">
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(mutex);</span>
            </div>
            <div className="ps-4">
              <span className="text-emerald-400">signal</span>
              <span className="text-slate-300">(empty);</span>
            </div>
            <div className="ps-4 text-slate-400">{'// consume item'}</div>
            <div className="text-slate-300">{'}'}</div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <div className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
          למה סדר wait חשוב?
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          אם המפיק היה קורא <span dir="ltr" className="font-mono">wait(mutex)</span> לפני <span dir="ltr" className="font-mono">wait(empty)</span> —
          הוא היה נכנס ל-mutex ואז נחסם ב-empty כשהחוצץ מלא.
          הצרכן לא יכול להיכנס ל-mutex כי המפיק מחזיק אותו. <strong>Deadlock.</strong>
        </p>
      </div>

      <StudyCallout variant="exam">
        תמיד: <span dir="ltr">wait(empty/full)</span> לפני <span dir="ltr">wait(mutex)</span>.
        הסמאפורים של ספירה (empty, full) מגיעים לפני הmutex — לא הפוך.
      </StudyCallout>

      <section className="w-full min-w-0 space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
        <header className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-slate-950 dark:text-slate-50">
            הדמיה: Bounded Buffer צעד-צעד
          </h3>
          <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>מה לעקוב אחריו:</strong> תוכן החוצץ, ערכי שלושת הסמאפורים (
            <span dir="ltr" className="font-mono">mutex</span>, <span dir="ltr" className="font-mono">empty</span>,{' '}
            <span dir="ltr" className="font-mono">full</span>), והשורה שכל אקטור מבצע.
            התרחיש "חוצץ מלא" מדגים למה סדר ה-wait חיוני — שם רואים איך Producer נחסם ואיך Consumer משחרר אותו.
          </p>
        </header>
        <BoundedBufferDemo />
      </section>
    </PageShell>
  );
}
