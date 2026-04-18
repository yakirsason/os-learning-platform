import StudyCallout from '@/components/common/StudyCallout';
import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function FcfsSection() {
  return (
    <AlgorithmSectionLayout
      id="fcfs"
      title="FCFS"
      englishName="First-Come, First-Served"
      explanation="האלגוריתם הפשוט ביותר: מי שמגיע ראשון ל-Ready Queue מקבל את ה-CPU ראשון."
      whyItMatters="FCFS קל להבנה, אבל סדר ההגעה יכול לשנות מאוד את זמן ההמתנה הממוצע."
      simulatorNote="בדמו המרכזי למטה אפשר להחליף ל-FCFS ולראות איך תהליך ארוך שמגיע ראשון גורם לאחרים לחכות."
    >
      <div className="space-y-4">
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          ב-FCFS התור מתנהג כמו תור רגיל: לא עוקפים. אם תהליך ארוך הגיע ראשון,
          הוא ירוץ עד הסוף גם אם מאחוריו מחכים תהליכים קצרים מאוד.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              למה סדר ההגעה חשוב?
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              אותם תהליכים בדיוק יכולים לתת ממוצע המתנה אחר לגמרי אם הסדר משתנה.
              תהליך ארוך בתחילת התור מגדיל את ההמתנה של כל מי שאחריו.
            </p>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              Convoy effect
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              מצב שבו תהליכים קצרים או I/O-bound נתקעים מאחורי תהליך CPU-bound ארוך.
              כמו שיירה שמתקדמת בקצב של הרכב האיטי ביותר.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mb-2 text-sm font-bold text-slate-950 dark:text-slate-50">
            דוגמת סדר הגעה
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-900 dark:bg-red-950/30">
              <div className="font-mono text-xs font-bold">P1=8, P2=1, P3=1</div>
              <p className="m-0 mt-1 text-xs leading-relaxed">
                אם P1 הארוך מגיע ראשון, P2 ו-P3 מחכים הרבה זמן.
              </p>
            </div>
            <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="font-mono text-xs font-bold">P2=1, P3=1, P1=8</div>
              <p className="m-0 mt-1 text-xs leading-relaxed">
                אם הקצרים מגיעים קודם, הם מסתיימים מהר והממוצע משתפר.
              </p>
            </div>
          </div>
        </div>

        <StudyCallout variant="exam" title="FCFS">
          FCFS הוא nonpreemptive: אחרי שתהליך קיבל את ה-CPU, הוא ממשיך עד שהוא מסיים
          או עובר להמתנת I/O. האלגוריתם לא עוצר אותו רק כי הגיע תהליך קצר יותר.
        </StudyCallout>
      </div>
    </AlgorithmSectionLayout>
  );
}
