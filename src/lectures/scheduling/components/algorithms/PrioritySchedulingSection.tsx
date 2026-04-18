import StudyCallout from '@/components/common/StudyCallout';
import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function PrioritySchedulingSection() {
  return (
    <AlgorithmSectionLayout
      id="priority-scheduling"
      title="תזמון לפי עדיפות"
      englishName="Priority Scheduling"
      explanation="לכל תהליך נותנים מספר priority. לפי השקפים, המספר הקטן ביותר הוא העדיפות הגבוהה ביותר."
      whyItMatters="Priority Scheduling מאפשר למערכת להעדיף תהליכים חשובים, אבל עלול לדחות תהליכים חלשים שוב ושוב."
      simulatorNote="בדמו המרכזי אפשר להחליף ל-Priority ולראות איך המספר הקטן ביותר נבחר ראשון מבין התהליכים המוכנים."
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              Preemptive או nonpreemptive
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              Priority Scheduling יכול לעבוד בשתי צורות. בגרסה preemptive, תהליך חדש
              עם עדיפות גבוהה יכול לעצור את התהליך שרץ.
            </p>
          </div>
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              SJF כמקרה פרטי
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              אפשר לראות SJF כ-Priority Scheduling שבו ה-priority הוא אורך ה-CPU burst הבא.
              burst קצר יותר מקבל עדיפות גבוהה יותר.
            </p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              Starvation
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              תהליך עם עדיפות נמוכה עלול לחכות הרבה מאוד זמן אם כל הזמן מגיעים
              תהליכים עם עדיפות גבוהה יותר.
            </p>
          </div>
          <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
            <div className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">
              Aging
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              הפתרון בשקפים: ככל שתהליך מחכה יותר, מעלים לו את העדיפות בהדרגה.
              כך מקטינים את הסיכוי שהוא ייתקע לנצח.
            </p>
          </div>
        </div>

        <StudyCallout variant="exam" title="Priority">
          בשאלות לפי השקפים: מספר קטן יותר הוא priority גבוה יותר. זו נקודה שקל להפוך בטעות.
        </StudyCallout>
      </div>
    </AlgorithmSectionLayout>
  );
}
