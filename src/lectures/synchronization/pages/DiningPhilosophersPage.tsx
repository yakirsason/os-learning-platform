import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import DiningPhilosophersDemo from '../visualizations/DiningPhilosophersDemo';

export default function DiningPhilosophersPage() {
  return (
    <PageShell
      eyebrow="Dining Philosophers Problem"
      title="Dining Philosophers"
      intro="חמישה פילוסופים יושבים סביב שולחן עגול. בין כל שניים יש צלחת אחת. כל פילוסוף זקוק לשתי הצלחות הסמוכות לו כדי לאכול."
    >
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          הגדרת הבעיה
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          כל פילוסוף לסירוגין חושב ואוכל. כדי לאכול הוא צריך לקחת את שתי הצלחות שמשמאלו ומימינו.
          המשאבים (הצלחות) הם משותפים ולא ניתנים לשיתוף.
          זוהי דוגמה קלאסית לקצאת משאבים מרובים בו-זמנית.
        </p>
      </div>

      <DiningPhilosophersDemo />

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          פתרון נאיבי — ועיקרון Deadlock
        </h2>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// semaphore chopstick[5] = {1,1,1,1,1};'}</div>
          <div className="mt-2 text-slate-400">{'// Philosopher i:'}</div>
          <div>
            <span className="text-amber-400">while</span>
            <span className="text-slate-300"> (</span>
            <span className="text-emerald-400">true</span>
            <span className="text-slate-300">) {'{'}</span>
          </div>
          <div className="ps-4">
            <span className="text-blue-300">wait</span>
            <span className="text-slate-300">(chopstick[i]);        </span>
            <span className="text-slate-400">{'// left'}</span>
          </div>
          <div className="ps-4">
            <span className="text-blue-300">wait</span>
            <span className="text-slate-300">(chopstick[(i+1) % 5]);</span>
            <span className="text-slate-400">{'// right'}</span>
          </div>
          <div className="ps-4 text-slate-400">{'// eat...'}</div>
          <div className="ps-4">
            <span className="text-emerald-400">signal</span>
            <span className="text-slate-300">(chopstick[i]);</span>
          </div>
          <div className="ps-4">
            <span className="text-emerald-400">signal</span>
            <span className="text-slate-300">(chopstick[(i+1) % 5]);</span>
          </div>
          <div className="ps-4 text-slate-400">{'// think...'}</div>
          <div className="text-slate-300">{'}'}</div>
        </div>
      </div>

      <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/30">
        <div className="mb-2 text-sm font-semibold text-red-800 dark:text-red-300">
          Deadlock — כשכולם אוחזים בצלחת שמאל
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          אם כל חמשת הפילוסופים לוקחים את הצלחת השמאלית בו-זמנית — כולם מחכים לצלחת הימנית.
          אבל הצלחת הימנית של כל אחד היא הצלחת השמאלית של שכנו — שגם הוא מחכה.
          כולם חסומים לנצח. <strong>Deadlock.</strong>
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          פתרונות אפשריים
        </h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
              1. הגבלה: לא יותר מ-4 פילוסופים בו-זמנית
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              אם לא ייתכן שכולם ינסו בו-זמנית, לא ייתכן deadlock מעגלי. מימוש: semaphore עם ערך 4.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
              2. לקיחה אטומית של שתי הצלחות
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              פילוסוף לוקח שתי צלחות רק אם שתיהן פנויות. אם לא — לא לוקח כלום ומחכה.
              מונע deadlock, אבל עלול לגרום לרעב.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-sm font-semibold text-blue-800 dark:text-blue-300">
              3. מיון א-סימטרי
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              פילוסוף עם מספר אי-זוגי לוקח שמאל לפני ימין; פילוסוף זוגי — ימין לפני שמאל.
              זה שובר את המעגל ומונע deadlock.
            </p>
          </div>
        </div>
      </div>

      <StudyCallout variant="pitfall">
        פתרון ל-deadlock לא אוטומטית מונע רעב (starvation). אפשר שאחד הפילוסופים לעולם לא יאכל גם בלי deadlock — אם תמיד שכניו "מקדימים" אותו.
      </StudyCallout>

      <StudyCallout variant="exam">
        הבינו את תנאי ה-deadlock: כל 4 תנאי Coffman מתקיימים — mutual exclusion, hold and wait, no preemption, circular wait.
        כל פתרון שובר לפחות אחד מהם.
      </StudyCallout>
    </PageShell>
  );
}
