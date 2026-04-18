import StudyCallout from '@/components/common/StudyCallout';
import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function SjfSection() {
  return (
    <AlgorithmSectionLayout
      id="sjf"
      title="SJF"
      englishName="Shortest Job First"
      explanation="בוחרים את התהליך עם ה-CPU burst הבא הקצר ביותר מבין התהליכים שמוכנים לרוץ."
      whyItMatters="עבור קבוצת תהליכים קבועה, SJF נותן זמן המתנה ממוצע מינימלי. זו הסיבה שהוא חשוב כל כך בשקפים."
      simulatorNote="Nonpreemptive: אחרי שתהליך נבחר, הוא ממשיך עד סוף ה-CPU burst. לא עוצרים אותו באמצע בגלל תהליך חדש."
      noteTitle="Nonpreemptive"
    >
      <div className="space-y-4">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
              איך בוחרים?
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              מסתכלים רק על התהליכים שכבר נמצאים ב-Ready Queue. מביניהם בוחרים את
              ה-CPU burst הקצר ביותר.
            </p>
          </div>

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              מה קורה אחרי הבחירה?
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              התהליך רץ עד סוף ה-burst שלו. גם אם בינתיים מגיע תהליך קצר יותר,
              SJF nonpreemptive לא עוצר את התהליך שכבר רץ.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
          <h4 className="m-0 mb-2 text-lg font-bold text-slate-950 dark:text-slate-50">
            למה SJF חשוב?
          </h4>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            כשיש לנו קבוצת תהליכים ידועה, הרצת התהליכים הקצרים קודם מקטינה את הזמן
            שבו תהליכים רבים מחכים מאחור. לכן SJF נותן ממוצע waiting time מינימלי
            עבור עומס עבודה קבוע.
          </p>
        </div>

        <StudyCallout variant="exam" title="SJF במבחן">
          זכרו את שני החלקים יחד: בוחרים את ה-burst הקצר ביותר מבין המוכנים,
          אבל אחרי הבחירה אין preemption באמצע ה-burst.
        </StudyCallout>
      </div>
    </AlgorithmSectionLayout>
  );
}
