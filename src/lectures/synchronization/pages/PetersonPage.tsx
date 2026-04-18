import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import PetersonSimulator from '../visualizations/PetersonSimulator';

export default function PetersonPage() {
  return (
    <PageShell
      eyebrow="Peterson's Solution"
      title="פתרון Peterson"
      intro="פתרון תוכנתי קלאסי לבעיית Critical Section עבור שני תהליכים. אינו מצריך תמיכת חומרה מיוחדת, רק שני משתנים משותפים."
    >
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">שים לב</div>
        <p className="m-0 text-sm text-slate-700 dark:text-slate-200">
          הפתרון של Peterson מיועד לשני תהליכים בלבד (נסמן אותם P<sub>0</sub> ו-P<sub>1</sub>, או P<sub>i</sub> ו-P<sub>j</sub>).
          הרחבה למספר כללי של תהליכים דורשת גישה אחרת.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          המשתנים המשותפים
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-blue-800 dark:text-blue-300" dir="ltr">
              int turn;
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              משמש כשובר-שוויון כאשר שני התהליכים רוצים להיכנס ל-critical section יחד.
              אם <span dir="ltr" className="font-mono">turn == i</span>, ל-P<sub>i</sub> יש קדימות רק במצב התחרות הזה.
            </p>
            <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              במילים אחרות: <span dir="ltr" className="font-mono">turn</span> הוא שובר-שוויון, לא מנעול עצמאי.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 font-mono text-sm font-bold text-blue-800 dark:text-blue-300" dir="ltr">
              boolean flag[2];
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              מציין <em>מי רוצה</em> להיכנס.
              אם <span dir="ltr" className="font-mono">flag[i] == true</span> — תהליך P<sub>i</sub> מוכן ורוצה להיכנס.
            </p>
          </div>
        </div>
      </div>

      <StudyCallout variant="pitfall" title="מה turn באמת עושה">
        <span dir="ltr" className="font-mono">turn</span> אינו lock ואינו אומר לבד "מי בפנים".
        הוא משפיע רק כאשר שני הדגלים דולקים, כלומר כששני התהליכים רוצים להיכנס יחד. אם התהליך השני לא רוצה להיכנס,
        <span dir="ltr" className="font-mono"> flag[j] == false</span> מספיק כדי ש-P<sub>i</sub> יתקדם מיד.
      </StudyCallout>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">האלגוריתם</h2>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// Process Pi (j is the other process)'}</div>
          <div className="mt-2">
            <span className="text-violet-400">flag</span>
            <span className="text-slate-300">[i] = </span>
            <span className="text-emerald-400">true</span>
            <span className="text-slate-400">;  // אני רוצה להיכנס</span>
          </div>
          <div>
            <span className="text-violet-400">turn</span>
            <span className="text-slate-300"> = j</span>
            <span className="text-slate-400">;        // אני מוותר ומזמין את j לפני</span>
          </div>
          <div className="mt-2">
            <span className="text-amber-400">while</span>
            <span className="text-slate-300"> (</span>
            <span className="text-violet-400">flag</span>
            <span className="text-slate-300">[j] &amp;&amp; </span>
            <span className="text-violet-400">turn</span>
            <span className="text-slate-300"> == j)</span>
            <span className="text-slate-400"> ;  // busy wait</span>
          </div>
          <div className="mt-2 text-slate-400">{'// ←  critical section  →'}</div>
          <div className="mt-2">
            <span className="text-violet-400">flag</span>
            <span className="text-slate-300">[i] = </span>
            <span className="text-emerald-400">false</span>
            <span className="text-slate-400">; // סיימתי, מאפשר לאחר להיכנס</span>
          </div>
          <div className="mt-2 text-slate-400">{'// ←  remainder section  →'}</div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          למה הפתרון עובד?
        </h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Mutual Exclusion ✓
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              כדי שP<sub>i</sub> ייכנס, צריך ש-<span dir="ltr" className="font-mono">flag[j] == false</span> אחרת ש-<span dir="ltr" className="font-mono">turn == i</span>.
              לא ייתכן ששני התנאים מתקיימים בו-זמנית לשני התהליכים — כי <span dir="ltr" className="font-mono">turn</span> יכול להצביע רק על אחד.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Progress ✓
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              אם P<sub>j</sub> לא רוצה להיכנס (<span dir="ltr" className="font-mono">flag[j] == false</span>), P<sub>i</sub> מיד ייכנס ולא יחכה לנצח.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-sm font-semibold text-emerald-800 dark:text-emerald-300">
              Bounded Waiting ✓
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              אחרי שP<sub>i</sub> מגדיר <span dir="ltr" className="font-mono">turn = j</span>, P<sub>j</sub> יכול להיכנס לכל היותר פעם אחת לפניו.
              לאחר מכן <span dir="ltr" className="font-mono">turn</span> לא יוחזר ל-j עד שP<sub>i</sub> יסיים.
            </p>
          </div>
        </div>
      </div>

      <StudyCallout variant="exam">
        הבינו את התפקיד של כל משתנה: <span dir="ltr">flag[i]</span> = "אני רוצה"; <span dir="ltr">turn</span> = "תורו של מי".
        ביחד הם מבטיחים שאם שניהם רוצים להיכנס בו-זמנית, רק אחד ייכנס — ואחרי כן גם השני יצליח.
      </StudyCallout>

      <section className="w-full min-w-0 space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
        <header className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-slate-950 dark:text-slate-50">
            הדמיה: Peterson צעד-צעד
          </h3>
          <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>מה לעקוב אחריו:</strong> שינויים ב-<span dir="ltr" className="font-mono">flag[0]</span>,{' '}
            <span dir="ltr" className="font-mono">flag[1]</span>, ו-<span dir="ltr" className="font-mono">turn</span>;
            איך כל תהליך עובר בין השלבים (set-flag, set-turn, waiting, critical); ובאיזה רגע מי נכנס ומי מחכה.
            התרחיש "תחרות" הוא הלב — שם רואים בדיוק איך turn קובע מי ייכנס ראשון.
          </p>
        </header>
        <PetersonSimulator />
      </section>

      <StudyCallout variant="pitfall">
        Peterson אינו מובטח לעבוד על מעבדים מודרניים שמסדרים מחדש פקודות (instruction reordering / memory reordering).
        בפועל, צריך memory barriers. אבל כפתרון תיאורטי — הוא כן עובד.
      </StudyCallout>
    </PageShell>
  );
}
