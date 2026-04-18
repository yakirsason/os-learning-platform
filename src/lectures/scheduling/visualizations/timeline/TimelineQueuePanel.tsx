import type { QueueSnapshot } from '../../lib/schedulingTypes';
import type { TimelineProcessStyles } from './timelineTypes';
import TimelineProcessPill from './TimelineProcessPill';

interface TimelineQueuePanelProps {
  runningProcess: string | null;
  readyQueue: string[];
  remainingBursts: Record<string, number>;
  processStyles: TimelineProcessStyles;
  queueLanes?: QueueSnapshot[];
}

export default function TimelineQueuePanel({
  runningProcess,
  readyQueue,
  remainingBursts,
  processStyles,
  queueLanes = [],
}: TimelineQueuePanelProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
        מצב המערכת עכשיו
      </h3>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
            <div className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
              CPU
            </div>
            {runningProcess ? (
              <TimelineProcessPill
                processId={runningProcess}
                remaining={remainingBursts[runningProcess] ?? 0}
                processStyles={processStyles}
              />
            ) : (
              <span className="text-sm text-slate-500">ה-CPU פנוי כרגע</span>
            )}
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
            <div className="mb-2 text-xs font-bold text-blue-700 dark:text-blue-300">
              Ready Queue
            </div>
            <div className="flex flex-wrap gap-2">
              {readyQueue.length > 0 ? (
                readyQueue.map((processId) => (
                  <TimelineProcessPill
                    key={processId}
                    processId={processId}
                    remaining={remainingBursts[processId] ?? 0}
                    processStyles={processStyles}
                  />
                ))
            ) : (
              <span className="text-sm text-slate-500">אין תהליכים שממתינים ל-CPU</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
            תורי Scheduler
          </div>
          {queueLanes.length > 0 ? (
          <div className="space-y-2">
            {queueLanes.map((lane) => (
              <div key={lane.id} className="rounded-lg border p-3 dark:border-slate-800">
                <div className="mb-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                  {lane.title}
                  {lane.quantum !== undefined ? (
                    <span className="ms-2 font-mono text-[10px] opacity-70">
                      q={lane.quantum}
                    </span>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {lane.processIds.map((processId) => (
                    <TimelineProcessPill
                      key={processId}
                      processId={processId}
                      remaining={remainingBursts[processId] ?? 0}
                      processStyles={processStyles}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          ) : (
          <div className="rounded-lg border border-dashed p-4 text-sm leading-relaxed text-slate-600 dark:border-slate-700 dark:text-slate-300">
            כאן מוצג התור שממנו האלגוריתם בוחר. אותו רכיב מוכן גם לתצוגת כמה רמות
            תור, למשל ב-MLFQ, בלי לערבב את הלוגיקה בתוך ה-MDX.
          </div>
          )}
        </div>
      </div>
    </div>
  );
}
