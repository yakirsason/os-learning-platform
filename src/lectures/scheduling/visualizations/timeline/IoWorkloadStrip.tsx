import { cn } from '@/lib/utils';
import { getProcessPhases } from '../../lib/schedulingMetrics';
import type { SchedulingProcess } from '../../lib/schedulingTypes';
import type { TimelineProcessStyles } from './timelineTypes';

interface IoWorkloadStripProps {
  processes: SchedulingProcess[];
  processStyles: TimelineProcessStyles;
  quantum?: number;
  rightBadge?: string;
}

export default function IoWorkloadStrip({
  processes,
  processStyles,
  quantum,
  rightBadge,
}: IoWorkloadStripProps) {
  const badge =
    rightBadge ?? (quantum !== undefined ? `quantum = ${quantum}` : null);
  return (
    <section className="rounded-xl border bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="m-0 text-base font-bold text-slate-950 dark:text-slate-50">
          נתוני השאלה
        </h3>
        {badge ? (
          <span className="rounded-md bg-amber-50 px-2 py-0.5 font-mono text-xs font-bold text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
            {badge}
          </span>
        ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        {processes.map((process) => {
          const style = processStyles[process.id];
          const phases = getProcessPhases(process);
          return (
            <div
              key={process.id}
              className={cn(
                'rounded-lg border p-2.5 text-xs',
                style?.soft ?? 'bg-slate-50',
                style?.border ?? 'border-slate-200'
              )}
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold text-white',
                    style?.solid ?? 'bg-slate-500'
                  )}
                >
                  {process.id}
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  <span className="font-semibold">הגעה:</span>{' '}
                  <span className="font-mono font-bold">{process.arrivalTime}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {phases.map((phase, i) => (
                  <span
                    key={i}
                    className={cn(
                      'rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold',
                      phase.type === 'cpu'
                        ? cn(style?.solid ?? 'bg-slate-500', 'text-white')
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
                    )}
                  >
                    {phase.type === 'cpu' ? 'CPU' : 'I/O'}:{phase.duration}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
