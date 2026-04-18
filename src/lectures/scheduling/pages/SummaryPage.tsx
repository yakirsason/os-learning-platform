import PageShell from '../components/PageShell';

export default function SummaryPage() {
  return (
    <PageShell
      eyebrow="Summary"
      title="סיכום"
      intro="נקודות קצרות לזכירה אחרי שלומדים את חלקי ההרצאה."
    >
      <div className="space-y-2 text-sm">
        <div className="rounded-md border border-s-4 border-blue-500 bg-blue-50 p-3 dark:border-blue-700 dark:bg-blue-950/30">
          <strong>הבסיס:</strong> תהליכים נעים בין CPU bursts לבין I/O bursts.
        </div>
        <div className="rounded-md border border-s-4 border-emerald-500 bg-emerald-50 p-3 dark:border-emerald-700 dark:bg-emerald-950/30">
          <strong>התפקידים:</strong> Scheduler בוחר, Dispatcher מעביר את ה-CPU לתהליך שנבחר.
        </div>
        <div className="rounded-md border border-s-4 border-amber-500 bg-amber-50 p-3 dark:border-amber-700 dark:bg-amber-950/30">
          <strong>המדדים:</strong> אין אלגוריתם אחד שמנצח בכל מדד ובכל מצב.
        </div>
        <div className="rounded-md border border-s-4 border-slate-500 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/50">
          <strong>המשך העבודה:</strong> Round Robin, Multilevel Queue ו-MLFQ יעמיקו בגל הבא.
        </div>
      </div>
    </PageShell>
  );
}
