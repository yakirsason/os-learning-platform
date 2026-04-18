import InteractiveDemo from '@/components/common/InteractiveDemo';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import SchedulingCriteriaPanel from '../visualizations/SchedulingCriteriaPanel';

export default function CriteriaPage() {
  return (
    <PageShell
      eyebrow="Scheduling Criteria"
      title="מדדי תזמון"
      intro="חמישה מדדים מרכזיים חוזרים בשקפים. כל אחד מודד דבר קצת אחר."
    >
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        שני מדדים רוצים להגדיל: CPU utilization ו-throughput. שלושה מדדים רוצים להקטין:
        turnaround time, waiting time ו-response time.
      </p>

      <div className="overflow-hidden rounded-lg border bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <table dir="rtl" className="m-0 w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th className="px-3 py-2 text-start">מדד</th>
              <th className="px-3 py-2 text-start">מה הוא שואל</th>
              <th className="px-3 py-2 text-start">כיוון רצוי</th>
            </tr>
          </thead>
          <tbody>
            {[
              ['CPU utilization', 'כמה מהזמן ה-CPU עסוק בעבודה?', 'גבוה'],
              ['Throughput', 'כמה תהליכים מסתיימים ביחידת זמן?', 'גבוה'],
              ['Turnaround time', 'כמה זמן עבר מהגעה עד סיום?', 'נמוך'],
              ['Waiting time', 'כמה זמן התהליך חיכה ב-Ready Queue?', 'נמוך'],
              ['Response time', 'כמה זמן עד שהתהליך קיבל תגובה ראשונה?', 'נמוך'],
            ].map(([metric, question, direction]) => (
              <tr key={metric} className="border-t dark:border-slate-800">
                <td className="px-3 py-2 font-mono">{metric}</td>
                <td className="px-3 py-2">{question}</td>
                <td className="px-3 py-2">{direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            Turnaround מול Waiting
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            Turnaround הוא כל הזמן מהגעה עד סיום. Waiting הוא רק הזמן ב-Ready Queue.
          </p>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
          <div className="mb-1 text-xs font-bold text-violet-700 dark:text-violet-300">
            Response מול Completion
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            Response מודד עד התגובה הראשונה. הוא לא מחכה שהתהליך יסתיים.
          </p>
        </div>
      </div>

      <InteractiveDemo
        title="השוואת מדדי תזמון"
        explanation={
          <>
            <p>עברו בין המדדים ושימו לב מה כל אחד מודד ומה הכיוון הרצוי שלו.</p>
            <p className="mt-2">מערכת אינטראקטיבית ומערכת אצווה עשויות להעדיף מדדים שונים.</p>
          </>
        }
      >
        <SchedulingCriteriaPanel />
      </InteractiveDemo>

      <StudyCallout variant="exam" title="בסיס לחישובים">
        Waiting time הוא זמן המתנה ב-Ready Queue בלבד. Response time הוא עד התגובה הראשונה.
        Turnaround time הוא מהגעה עד סיום.
      </StudyCallout>
    </PageShell>
  );
}
