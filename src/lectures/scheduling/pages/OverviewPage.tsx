import { Link } from 'react-router-dom';
import StudyCallout from '@/components/common/StudyCallout';
import { SCHEDULING_PAGES } from '../components/schedulingPages';
import PageShell from '../components/PageShell';

export default function OverviewPage() {
  return (
    <PageShell
      eyebrow="Overview"
      title="תזמון מעבד"
      intro="תזמון מעבד (CPU Scheduling) עוסק בשאלה שחוזרת שוב ושוב: איזה תהליך יקבל עכשיו את ה-CPU?"
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/30">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            במה נעסוק
          </div>
          <ul className="m-0 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            <li>• מחזור CPU burst ו-I/O burst</li>
            <li>• Scheduler, Dispatcher ונקודות החלטה</li>
            <li>• מדדי תזמון חשובים למבחן</li>
            <li>• אלגוריתמים: FCFS, SJF, SRTF, Priority, Round Robin, MLQ ו-MLFQ</li>
          </ul>
        </div>
        <div className="rounded-lg border border-s-4 border-emerald-500 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            למה זה חשוב
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            ה-CPU הוא משאב מרכזי ויקר. בחירה לא טובה יכולה לגרום לתהליכים קצרים
            לחכות הרבה זמן, ולמערכת לבזבז זמן במקום לבצע עבודה.
          </p>
        </div>
      </div>

      <StudyCallout variant="oneliner">
        ההרצאה מחולקת עכשיו לעמודים פנימיים, כדי ללמוד נושא אחד בכל פעם במקום לגלול פרק שלם.
      </StudyCallout>

      <div className="grid gap-3 md:grid-cols-2">
        {SCHEDULING_PAGES.filter((page) => page.slug !== 'overview').map((page) => (
          <Link
            key={page.slug}
            to={`/lecture/scheduling/${page.slug}`}
            className="rounded-lg border bg-white p-4 no-underline shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
          >
            <div className="font-semibold text-slate-950 dark:text-slate-50">
              {page.title}
            </div>
            {page.englishTitle ? (
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {page.englishTitle}
              </div>
            ) : null}
            <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {page.description}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
