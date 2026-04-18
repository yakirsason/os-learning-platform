import { cn } from '@/lib/utils';
import type { SchedulingProcess } from '../../lib/schedulingTypes';
import type { TimelineProcessStyles } from './timelineTypes';

interface TimelineWorkloadStripProps {
  processes: SchedulingProcess[];
  processStyles: TimelineProcessStyles;
}

export default function TimelineWorkloadStrip({
  processes,
  processStyles,
}: TimelineWorkloadStripProps) {
  return (
    <section className="rounded-xl border bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-base font-bold text-slate-950 dark:text-slate-50">
          נתוני השאלה
        </h3>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          arrival time, CPU burst, priority
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {processes.map((process) => {
          const style = processStyles[process.id];
          return (
            <div
              key={process.id}
              className={cn(
                'grid grid-cols-[44px_1fr] items-center gap-2 rounded-lg border p-2 text-xs',
                style?.soft ?? 'bg-slate-50',
                style?.border ?? 'border-slate-200'
              )}
            >
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full font-mono text-sm font-bold',
                  style?.solid ?? 'bg-slate-500',
                  'text-white'
                )}
              >
                {process.id}
              </div>
              <div className="grid grid-cols-3 gap-1 text-center text-slate-700 dark:text-slate-200">
                <div>
                  <div className="font-mono font-bold">{process.arrivalTime}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    הגעה
                  </div>
                </div>
                <div>
                  <div className="font-mono font-bold">{process.burstTime}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    burst
                  </div>
                </div>
                <div>
                  <div className="font-mono font-bold">{process.priority}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    priority
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
