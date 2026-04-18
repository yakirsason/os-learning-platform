import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TimelineSegment } from '../../lib/schedulingTypes';
import type { TimelineProcessStyles } from './timelineTypes';

interface AlgorithmTimelineStripProps {
  entries: TimelineSegment[];
  totalTime: number;
  currentTime: number;
  processStyles: TimelineProcessStyles;
}

const UNIT_WIDTH = 56;

function getTimelineWidth(totalTime: number): number {
  return Math.max(totalTime * UNIT_WIDTH, 560);
}

function getBoundaryLabel(entry: TimelineSegment): string {
  if (entry.eventType === 'quantum-expiry') return 'quantum';
  if (entry.eventType === 'preemption') return 'preemption';
  if (entry.eventType === 'completion') return 'סיום';
  return 'החלפה';
}

export default function AlgorithmTimelineStrip({
  entries,
  totalTime,
  currentTime,
  processStyles,
}: AlgorithmTimelineStripProps) {
  const timelineWidth = getTimelineWidth(totalTime);
  const cursorPosition = Math.min(currentTime, totalTime) * UNIT_WIDTH;

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="m-0 text-lg font-bold text-slate-950 dark:text-slate-50">
            ציר הזמן של ה-CPU
          </h3>
          <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
            קוראים משמאל לימין: מי קיבל CPU, מתי הייתה החלפה, ומתי הזמן התקדם.
          </p>
        </div>
        <span className="rounded-md bg-blue-50 px-3 py-1 font-mono text-sm font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
          t={currentTime}
        </span>
      </div>

      <div className="overflow-x-auto pb-2" dir="ltr">
        <div className="relative" style={{ width: timelineWidth }}>
          <div className="absolute inset-x-0 top-0 h-24 rounded-lg bg-slate-100 dark:bg-slate-950" />

          <div className="relative flex h-24 items-stretch overflow-hidden rounded-lg border dark:border-slate-800">
            {entries.length === 0 ? (
              <div className="flex w-full items-center justify-center text-sm text-slate-500">
                עדיין אין ריצה על ה-CPU
              </div>
            ) : null}

            {entries.map((entry) => {
              const width = Math.max((entry.end - entry.start) * UNIT_WIDTH, UNIT_WIDTH);
              const style = entry.processId ? processStyles[entry.processId] : undefined;
              const isIdle = entry.processId === null;
              return (
                <motion.div
                  key={`${entry.id}-${entry.start}-${entry.end}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25 }}
                  className={cn(
                    'relative flex flex-col items-center justify-center border-e',
                    isIdle
                      ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      : cn('text-white', style?.solid ?? 'bg-slate-500')
                  )}
                  style={{ width }}
                >
                  <span className="font-mono text-xl font-bold">
                    {entry.processId ?? 'Idle'}
                  </span>
                  <span className="font-mono text-xs">
                    {entry.start}-{entry.end}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {entries.slice(1).map((entry, index) => {
            const previousEntry = entries[index];
            return (
              <div
                key={`switch-${entry.id}`}
                className="absolute top-0 h-24 border-s-2 border-dashed border-amber-500"
                style={{ left: entry.start * UNIT_WIDTH }}
                title="בחירה מחדש של ה-Scheduler"
              >
                <span className="absolute top-1 translate-x-1 rounded bg-amber-100 px-1 py-0.5 text-[10px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                  {getBoundaryLabel(previousEntry)}
                </span>
              </div>
            );
          })}

          <motion.div
            className="absolute top-0 h-24 border-s-2 border-blue-700 dark:border-blue-300"
            animate={{ left: cursorPosition }}
            transition={{ duration: 0.25 }}
          >
            <span className="absolute -top-5 -translate-x-1/2 rounded bg-blue-700 px-1.5 py-0.5 font-mono text-[10px] text-white dark:bg-blue-300 dark:text-slate-950">
              עכשיו
            </span>
          </motion.div>

          <div className="relative mt-2 flex h-7 items-start">
            {Array.from({ length: totalTime + 1 }, (_, time) => (
              <div
                key={time}
                className="absolute flex flex-col items-center"
                style={{ left: time * UNIT_WIDTH }}
              >
                <span className="h-2 border-s border-slate-400 dark:border-slate-600" />
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {time}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
