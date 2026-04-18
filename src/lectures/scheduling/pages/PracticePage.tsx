import PageShell from '../components/PageShell';

export default function PracticePage() {
  return (
    <PageShell
      eyebrow="Practice"
      title="חשיבה לתרגול ולמבחן"
      intro="עמוד זה מרכז את סוגי המשימות שנרצה לתרגל בהמשך ההרצאה."
    >
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <h2 className="m-0 mb-2 text-xl font-bold text-amber-900 dark:text-amber-100">
          מה יתווסף בגלים הבאים
        </h2>
        <ul className="m-0 space-y-1 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          <li>• קריאת טבלת תהליכים עם arrival time ו-burst time.</li>
          <li>• ציור Gantt chart לפי אלגוריתם נתון.</li>
          <li>• חישוב waiting time, turnaround time ו-response time.</li>
          <li>• הסבר קצר למה אלגוריתם אחד עדיף או בעייתי במקרה מסוים.</li>
        </ul>
      </div>
    </PageShell>
  );
}
