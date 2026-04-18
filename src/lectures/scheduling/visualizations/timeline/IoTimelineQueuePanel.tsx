import type { QueueSnapshot } from '../../lib/schedulingTypes';
import type { TimelineProcessStyles } from './timelineTypes';
import TimelineProcessPill from './TimelineProcessPill';

interface IoTimelineQueuePanelProps {
  runningProcess: string | null;
  readyQueue: string[];
  waitingProcesses: string[];
  remainingBursts: Record<string, number>;
  processStyles: TimelineProcessStyles;
  queueLanes?: QueueSnapshot[];
}

export default function IoTimelineQueuePanel({
  runningProcess,
  readyQueue,
  waitingProcesses,
  remainingBursts,
  processStyles,
  queueLanes = [],
}: IoTimelineQueuePanelProps) {
  const quantum = queueLanes[0]?.quantum;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
        מצב המערכת עכשיו
      </h3>

      <div className="grid gap-3 lg:grid-cols-3">
        {/* CPU */}
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="mb-2 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            CPU
            {quantum !== undefined && (
              <span className="ms-2 font-mono text-[10px] opacity-70">q={quantum}</span>
            )}
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

        {/* Ready Queue */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-2 text-xs font-bold text-blue-700 dark:text-blue-300">
            Ready Queue
          </div>
          <div className="flex flex-wrap gap-2">
            {readyQueue.length > 0 ? (
              readyQueue.map((pid) => (
                <TimelineProcessPill
                  key={pid}
                  processId={pid}
                  remaining={remainingBursts[pid] ?? 0}
                  processStyles={processStyles}
                />
              ))
            ) : (
              <span className="text-sm text-slate-500">ריק</span>
            )}
          </div>
        </div>

        {/* I/O Waiting */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-2 text-xs font-bold text-amber-700 dark:text-amber-300">
            ממתין ל-I/O
          </div>
          <div className="flex flex-wrap gap-2">
            {waitingProcesses.length > 0 ? (
              waitingProcesses.map((pid) => (
                <TimelineProcessPill
                  key={pid}
                  processId={pid}
                  remaining={remainingBursts[pid] ?? 0}
                  processStyles={processStyles}
                />
              ))
            ) : (
              <span className="text-sm text-slate-500">אין תהליכים ב-I/O</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
