import ConceptCard from '@/components/common/ConceptCard';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';

export default function SchedulerDispatcherPage() {
  return (
    <PageShell
      eyebrow="Scheduler and Dispatcher"
      title="Scheduler ו-Dispatcher"
      intro="כאן מפרידים בין מי שמחליט איזה תהליך ירוץ לבין מי שמבצע בפועל את המעבר."
    >
      <ConceptCard
        title="מתזמן קצר-טווח"
        englishTerm="Short-term Scheduler"
        description="הרכיב שבוחר תהליך מתוך ה-Ready Queue. הוא עובד בתדירות גבוהה, כי בכל פעם שה-CPU מתפנה או עשוי לעבור לתהליך אחר צריך לקבל החלטה."
        variant="success"
      />

      <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
        <h2 className="m-0 mb-3 text-xl font-bold text-slate-950 dark:text-slate-50">
          ארבע נקודות שבהן יכולה להיות החלטת תזמון
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            ['1. Running → Waiting', 'התהליך מבקש I/O או מחכה לאירוע. ה-CPU מתפנה.', 'nonpreemptive'],
            ['2. Running → Ready', 'התהליך שרץ נעצר, למשל בעקבות timer interrupt.', 'preemptive'],
            ['3. Waiting → Ready', 'פעולת I/O הסתיימה והתהליך חוזר ל-Ready Queue.', 'preemptive'],
            ['4. Running → Terminated', 'התהליך הסתיים, ולכן הוא ויתר על ה-CPU בעצמו.', 'nonpreemptive'],
          ].map(([title, text, kind]) => (
            <div
              key={title}
              className={
                kind === 'preemptive'
                  ? 'rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30'
                  : 'rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30'
              }
            >
              <div className="font-mono text-xs font-bold">{title}</div>
              <p className="m-0 mt-1 text-sm leading-relaxed">{text}</p>
              <div className="mt-2 text-xs font-semibold">{kind}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ConceptCard
          title="Nonpreemptive scheduling"
          englishTerm="Nonpreemptive"
          description="המערכת בוחרת תהליך חדש רק כשהתהליך הנוכחי מפנה את ה-CPU בעצמו: בגלל I/O או בגלל סיום."
          variant="info"
        />
        <ConceptCard
          title="Preemptive scheduling"
          englishTerm="Preemptive"
          description="המערכת יכולה לעצור תהליך שרץ ולהעביר את ה-CPU לתהליך אחר. זה שימושי, אבל מוסיף עלות ומורכבות."
          variant="warning"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <ConceptCard
          title="החלפת הקשר"
          englishTerm="Context Switch"
          description="שמירת המצב של התהליך הקודם וטעינת המצב של התהליך הבא."
          variant="info"
        />
        <ConceptCard
          title="מעבר למצב משתמש"
          englishTerm="User Mode"
          description="אחרי שהגרעין הכין את המעבר, התוכנית ממשיכה לרוץ במצב משתמש."
          variant="info"
        />
        <ConceptCard
          title="קפיצה לנקודה הנכונה"
          englishTerm="Jump"
          description="ה-Dispatcher מחזיר את התוכנית להוראה שבה היא צריכה להמשיך."
          variant="info"
        />
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="m-0 mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">
          Dispatch latency
        </h2>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          Dispatch latency הוא הזמן שלוקח ל-Dispatcher לעצור תהליך אחד ולהתחיל להריץ אחר.
          בזמן הזה ה-CPU עסוק במעבר, לא בעבודה של תוכנית המשתמש.
        </p>
      </div>

      <StudyCallout variant="pitfall" title="החלטה מול ביצוע">
        Scheduler מחליט מי ירוץ. Dispatcher מבצע את המעבר אל התהליך שנבחר.
      </StudyCallout>
    </PageShell>
  );
}
