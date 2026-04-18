import { cn } from '@/lib/utils';
import type { QueueSnapshot } from '../../lib/schedulingTypes';
import TimelineProcessPill from './TimelineProcessPill';
import type { TimelineProcessStyles } from './timelineTypes';

interface MultiQueuePanelProps {
  runningProcess: string | null;
  runningQueueId?: string;
  queues: QueueSnapshot[];
  remainingBursts: Record<string, number>;
  processStyles: TimelineProcessStyles;
}

const LEVEL_COLORS = [
  {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    border: 'border-rose-200 dark:border-rose-900',
    text: 'text-rose-800 dark:text-rose-200',
    chip: 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-200',
  },
  {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    border: 'border-amber-200 dark:border-amber-900',
    text: 'text-amber-800 dark:text-amber-200',
    chip: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200',
  },
  {
    bg: 'bg-sky-50 dark:bg-sky-950/30',
    border: 'border-sky-200 dark:border-sky-900',
    text: 'text-sky-800 dark:text-sky-200',
    chip: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-200',
  },
  {
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    border: 'border-slate-200 dark:border-slate-800',
    text: 'text-slate-800 dark:text-slate-200',
    chip: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
  },
];

export default function MultiQueuePanel({
  runningProcess,
  runningQueueId,
  queues,
  remainingBursts,
  processStyles,
}: MultiQueuePanelProps) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
        מצב התורים ו-CPU
      </h3>

      <div className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
            CPU
          </span>
          {runningQueueId && runningProcess ? (
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-200">
              {runningQueueId}
            </span>
          ) : null}
        </div>
        {runningProcess ? (
          <TimelineProcessPill
            processId={runningProcess}
            remaining={remainingBursts[runningProcess] ?? 0}
            processStyles={processStyles}
          />
        ) : (
          <span className="text-sm text-slate-500">ה-CPU פנוי</span>
        )}
      </div>

      <div className="space-y-2">
        {queues.map((lane, idx) => {
          const color = LEVEL_COLORS[idx] ?? LEVEL_COLORS[LEVEL_COLORS.length - 1];
          const isActiveForCpu = runningQueueId === lane.id;
          return (
            <div
              key={lane.id}
              className={cn(
                'rounded-lg border p-3',
                color.bg,
                color.border,
                isActiveForCpu && 'ring-2 ring-blue-400 dark:ring-blue-600'
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className={cn('text-xs font-bold', color.text)}>
                  {lane.title}
                </span>
                {lane.quantum !== undefined ? (
                  <span
                    className={cn(
                      'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold',
                      color.chip
                    )}
                  >
                    q={lane.quantum}
                  </span>
                ) : null}
                <span className="ms-auto text-[10px] text-slate-500 dark:text-slate-400">
                  {lane.processIds.length === 0
                    ? 'ריק'
                    : `${lane.processIds.length} תהליכים`}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {lane.processIds.length > 0 ? (
                  lane.processIds.map((pid) => (
                    <TimelineProcessPill
                      key={pid}
                      processId={pid}
                      remaining={remainingBursts[pid] ?? 0}
                      processStyles={processStyles}
                    />
                  ))
                ) : (
                  <span className="text-sm text-slate-400 dark:text-slate-500">
                    אין תהליכים בתור הזה
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
