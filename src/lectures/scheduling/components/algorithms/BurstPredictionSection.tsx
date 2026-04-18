import InteractiveDemo from '@/components/common/InteractiveDemo';
import StudyCallout from '@/components/common/StudyCallout';
import BurstPredictionDemo from '../../visualizations/BurstPredictionDemo';

export default function BurstPredictionSection() {
  return (
    <section
      id="burst-prediction"
      className="scroll-mt-28 space-y-4 rounded-lg border border-dashed bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
    >
      <div className="space-y-2">
        <div className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">
          הקושי המעשי של SJF
        </div>
        <h2 className="m-0 text-2xl font-bold text-slate-950 dark:text-slate-50">
          איך מנחשים את ה-CPU burst הבא?
        </h2>
        <p className="m-0 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          עד כאן למדנו את SJF כאילו אנחנו יודעים מה אורך ה-burst הבא. במערכת אמיתית
          ה-OS לא יודע את העתיד, ולכן הוא צריך להעריך את ה-burst הבא לפי ההיסטוריה.
        </p>
      </div>

      <StudyCallout variant="remember">
        חיזוי burst הוא המשך טבעי ל-SJF, אבל הוא לא משנה את הכלל של SJF:
        עדיין בוחרים את ה-burst הקצר ביותר, רק שעכשיו משתמשים בהערכה.
      </StudyCallout>

      <div className="rounded-lg border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        <h3 className="m-0 mb-2 text-lg font-bold text-slate-950 dark:text-slate-50">
          Exponential averaging
        </h3>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          בשקפים משתמשים ב-exponential averaging: התחזית החדשה משלבת את ה-burst
          האמיתי האחרון ואת התחזית הקודמת. הערך alpha קובע כמה משקל נותנים למה
          שקרה עכשיו.
        </p>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="font-mono text-xs font-bold">alpha = 0</div>
            <p className="m-0 mt-1 text-xs leading-relaxed">
              מתעלמים מה-burst האמיתי האחרון. התחזית נשענת על העבר הישן.
            </p>
          </div>
          <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="font-mono text-xs font-bold">0 &lt; alpha &lt; 1</div>
            <p className="m-0 mt-1 text-xs leading-relaxed">
              נותנים משקל גם להיסטוריה וגם למה שקרה עכשיו.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="font-mono text-xs font-bold">alpha = 1</div>
            <p className="m-0 mt-1 text-xs leading-relaxed">
              רק ה-burst האחרון קובע את התחזית הבאה.
            </p>
          </div>
        </div>
      </div>

      <InteractiveDemo
        title="חיזוי CPU burst עם exponential averaging"
        explanation={
          <>
            <p>החליפו alpha וראו איך התחזית משתנה אחרי כל burst אמיתי.</p>
            <p className="mt-2">
              המטרה היא להבין אינטואיטיבית כמה משקל נותנים להיסטוריה הקרובה.
            </p>
          </>
        }
      >
        <BurstPredictionDemo />
      </InteractiveDemo>
    </section>
  );
}
