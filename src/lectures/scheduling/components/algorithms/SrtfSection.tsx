import StudyCallout from '@/components/common/StudyCallout';
import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function SrtfSection() {
  return (
    <AlgorithmSectionLayout
      id="srtf"
      title="SRTF"
      englishName="Shortest Remaining Time First"
      explanation="SRTF הוא SJF preemptive: בכל רגע בוחרים את התהליך עם הזמן שנותר הקצר ביותר."
      whyItMatters="האלגוריתם מדגים בדיוק מתי preemption נכנס לתמונה: תהליך שרץ יכול להיעצר אם הגיע תהליך קצר יותר."
      simulatorNote="Preemptive: בכל הגעה חדשה בודקים האם הזמן שנותר של התהליך החדש קצר יותר מזה של התהליך שרץ."
      noteTitle="Preemptive"
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              מתי יש preemption?
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              כשמגיע תהליך חדש, משווים את ה-CPU time שנשאר לו מול הזמן שנשאר לתהליך
              שרץ עכשיו. אם החדש קצר יותר, הוא יכול לקבל את ה-CPU.
            </p>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
            <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
              מה לא בודקים?
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              לא מסתכלים רק על ה-burst המקורי. ב-SRTF השאלה היא כמה זמן נשאר מהרגע
              הנוכחי והלאה.
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-lg border bg-white dark:border-slate-800 dark:bg-slate-900/60">
          <table dir="rtl" className="m-0 w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th className="px-3 py-2 text-start">נושא</th>
                <th className="px-3 py-2 text-start">SJF</th>
                <th className="px-3 py-2 text-start">SRTF</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t dark:border-slate-800">
                <td className="px-3 py-2 font-semibold">סוג</td>
                <td className="px-3 py-2">Nonpreemptive</td>
                <td className="px-3 py-2">Preemptive</td>
              </tr>
              <tr className="border-t dark:border-slate-800">
                <td className="px-3 py-2 font-semibold">בחירה</td>
                <td className="px-3 py-2">ה-burst הבא הקצר ביותר מבין המוכנים</td>
                <td className="px-3 py-2">הזמן שנותר הקצר ביותר כרגע</td>
              </tr>
              <tr className="border-t dark:border-slate-800">
                <td className="px-3 py-2 font-semibold">עצירה באמצע</td>
                <td className="px-3 py-2">לא. מי שנבחר ממשיך עד סוף ה-burst</td>
                <td className="px-3 py-2">כן. תהליך קצר יותר יכול לעצור את הרץ</td>
              </tr>
            </tbody>
          </table>
        </div>

        <StudyCallout variant="pitfall" title="הבחנה למבחן">
          SJF שואל: מה ה-burst הבא הקצר ביותר? SRTF שואל: למי נשאר הכי מעט זמן עכשיו?
          המילה remaining היא הרמז לכך שצריך לבדוק preemption.
        </StudyCallout>
      </div>
    </AlgorithmSectionLayout>
  );
}
