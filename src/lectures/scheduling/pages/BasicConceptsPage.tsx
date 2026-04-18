import ConceptCard from '@/components/common/ConceptCard';
import InteractiveDemo from '@/components/common/InteractiveDemo';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import CpuBurstCycleDemo from '../visualizations/CpuBurstCycleDemo';

export default function BasicConceptsPage() {
  return (
    <PageShell
      eyebrow="Basic Concepts"
      title="מושגי בסיס"
      intro="המטרה הבסיסית של multiprogramming היא לא להשאיר את ה-CPU מחכה בזמן שתהליך אחד ממתין לקלט/פלט."
    >
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        תהליך לא משתמש ב-CPU ברצף מההתחלה עד הסוף. בדרך כלל הוא מחשב קצת,
        ואז מחכה לדיסק, רשת, קלט מהמשתמש, או התקן אחר. בזמן הזה ה-CPU יכול להריץ תהליך אחר.
      </p>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            בלי multiprogramming
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            תהליך אחד מחכה ל-I/O, וה-CPU עלול להישאר פנוי.
          </p>
        </div>
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            עם multiprogramming
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            כשהתהליך הראשון מחכה, תהליך אחר יכול לרוץ. כך ניצול ה-CPU עולה.
          </p>
        </div>
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            הרעיון לזכור
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            ה-OS מנסה שה-CPU והתקני ה-I/O יעבדו במקביל, ולא יחכו זה לזה.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ConceptCard
          title="CPU burst"
          englishTerm="CPU Burst"
          description="פרק זמן שבו התהליך באמת משתמש ב-CPU כדי לחשב: להריץ קוד, לחשב ערכים, ולעבד נתונים."
          variant="info"
        />
        <ConceptCard
          title="I/O burst"
          englishTerm="I/O Burst"
          description="פרק זמן שבו התהליך מחכה לפעולת קלט/פלט. בזמן הזה הוא לא צריך את ה-CPU."
          variant="info"
        />
      </div>

      <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <div className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-50">
          התפלגות CPU bursts
        </div>
        <div className="space-y-2">
          <div className="grid grid-cols-[90px_1fr] items-center gap-3">
            <span className="text-xs text-slate-600 dark:text-slate-300">קצרים</span>
            <div className="h-5 rounded-full bg-blue-500" />
          </div>
          <div className="grid grid-cols-[90px_1fr] items-center gap-3">
            <span className="text-xs text-slate-600 dark:text-slate-300">בינוניים</span>
            <div className="h-5 w-1/2 rounded-full bg-blue-400" />
          </div>
          <div className="grid grid-cols-[90px_1fr] items-center gap-3">
            <span className="text-xs text-slate-600 dark:text-slate-300">ארוכים</span>
            <div className="h-5 w-1/4 rounded-full bg-blue-300" />
          </div>
        </div>
        <p className="m-0 mt-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          רוב ה-CPU bursts קצרים, ויש פחות bursts ארוכים. הדפוס הזה חשוב כשנגיע ל-SJF.
        </p>
      </div>

      <StudyCallout variant="remember">
        התמונה המרכזית היא מחזור: CPU burst ואז I/O burst, שוב ושוב, עד שהתהליך מסתיים.
      </StudyCallout>

      <InteractiveDemo
        title="מחזור CPU burst ו-I/O burst"
        explanation={
          <>
            <p>עקבו אחרי P1 כשהוא עובר בין Ready Queue, CPU, המתנה ל-I/O וחזרה לריצה.</p>
            <p className="mt-2">
              שימו לב לרגעים שבהם ה-CPU מתפנה. שם החלטת תזמון יכולה להיכנס לתמונה.
            </p>
          </>
        }
      >
        <CpuBurstCycleDemo />
      </InteractiveDemo>
    </PageShell>
  );
}
