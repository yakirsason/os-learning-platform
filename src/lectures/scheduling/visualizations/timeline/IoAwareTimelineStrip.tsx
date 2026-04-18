import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TimelineSegment } from '../../lib/schedulingTypes';
import type { TimelineProcessStyles } from './timelineTypes';

interface IoAwareTimelineStripProps {
  cpuEntries: TimelineSegment[];
  ioEntries: TimelineSegment[];
  totalTime: number;
  currentTime: number;
  processStyles: TimelineProcessStyles;
  isRunComplete?: boolean;
}

const UNIT_WIDTH = 56;
const LABEL_WIDTH = 56;
const LANE_GAP = 8;

function getTimelineWidth(totalTime: number): number {
  return Math.max(totalTime * UNIT_WIDTH, 560);
}

function getBoundaryLabel(entry: TimelineSegment): string {
  if (entry.eventType === 'quantum-expiry') return 'quantum';
  if (entry.eventType === 'preemption') return 'preemption';
  if (entry.eventType === 'completion') return 'סיום';
  if (entry.eventType === 'io-block') return 'I/O';
  return 'החלפה';
}

export default function IoAwareTimelineStrip({
  cpuEntries,
  ioEntries,
  totalTime,
  currentTime,
  processStyles,
  isRunComplete = false,
}: IoAwareTimelineStripProps) {
  const timelineWidth = getTimelineWidth(totalTime);
  const cursorPosition = Math.min(currentTime, totalTime) * UNIT_WIDTH;
  const containerWidth = timelineWidth + LABEL_WIDTH + LANE_GAP;

  const ioProcessIds = [
    ...new Set(
      ioEntries
        .map((s) => s.processId)
        .filter((id): id is string => id !== null)
    ),
  ].sort();

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="m-0 text-lg font-bold text-slate-950 dark:text-slate-50">
            ציר הזמן: CPU ו-I/O
          </h3>
          <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
            שורת CPU מציגה ריצה על המעבד. שורות I/O מציגות המתנה להתקן.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isRunComplete && (
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200">
              ההרצה הסתיימה ✓
            </span>
          )}
          <span className="rounded-md bg-blue-50 px-3 py-1 font-mono text-sm font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
            t={currentTime}
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2 pt-6" dir="ltr">
        <div className="relative" style={{ width: containerWidth }}>

          {/* CPU lane */}
          <div
            className="mb-1 flex items-center"
            style={{ gap: LANE_GAP }}
          >
            <div
              className="shrink-0 text-right text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              style={{ width: LABEL_WIDTH }}
            >
              CPU
            </div>
            <div
              className="relative h-14"
              style={{ width: timelineWidth }}
            >
              {/* Segments (overflow-hidden so segments can't bleed past the lane) */}
              <div className="absolute inset-0 overflow-hidden rounded-lg border bg-slate-100 dark:border-slate-800 dark:bg-slate-950">
                {cpuEntries.length === 0 ? (
                  <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
                    עדיין אין ריצה
                  </div>
                ) : (
                  <div className="flex h-full">
                    {cpuEntries.map((entry) => {
                      const width = (entry.end - entry.start) * UNIT_WIDTH;
                      const style = entry.processId
                        ? processStyles[entry.processId]
                        : undefined;
                      const isIdle = entry.processId === null;
                      return (
                        <motion.div
                          key={`cpu-${entry.id}-${entry.start}-${entry.end}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25 }}
                          className={cn(
                            'relative flex shrink-0 flex-col items-center justify-center border-e',
                            isIdle
                              ? 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                              : cn('text-white', style?.solid ?? 'bg-slate-500')
                          )}
                          style={{ width }}
                        >
                          <span className="font-mono text-lg font-bold leading-none">
                            {entry.processId ?? 'Idle'}
                          </span>
                          <span className="font-mono text-[10px]">
                            {entry.start}–{entry.end}
                          </span>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Boundary markers (positioned outside the overflow-hidden track) */}
              {cpuEntries.slice(1).map((entry, index) => {
                const prev = cpuEntries[index];
                return (
                  <div
                    key={`boundary-${entry.id}`}
                    className="pointer-events-none absolute inset-y-0 border-s-2 border-dashed border-amber-500"
                    style={{ left: entry.start * UNIT_WIDTH }}
                  >
                    <span className="absolute top-1 translate-x-1 whitespace-nowrap rounded bg-amber-100 px-1 py-0.5 text-[9px] font-semibold text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {getBoundaryLabel(prev)}
                    </span>
                  </div>
                );
              })}

              {/* Cursor (positioned outside the overflow-hidden track so it's visible at the extreme right) */}
              <motion.div
                className="pointer-events-none absolute inset-y-0 border-s-2 border-blue-700 dark:border-blue-300"
                animate={{ left: cursorPosition }}
                transition={{ duration: 0.25 }}
              >
                <span className="absolute -top-5 -translate-x-1/2 whitespace-nowrap rounded bg-blue-700 px-1.5 py-0.5 font-mono text-[10px] text-white dark:bg-blue-300 dark:text-slate-950">
                  עכשיו
                </span>
              </motion.div>
            </div>
          </div>

          {/* I/O lanes — one row per process */}
          {ioProcessIds.map((pid) => {
            const segments = ioEntries.filter((s) => s.processId === pid);
            const style = processStyles[pid];
            return (
              <div
                key={`io-row-${pid}`}
                className="mb-1 flex items-center"
                style={{ gap: LANE_GAP }}
              >
                <div
                  className="shrink-0 text-right text-[10px] font-bold tracking-wide text-slate-500 dark:text-slate-400"
                  style={{ width: LABEL_WIDTH }}
                >
                  I/O {pid}
                </div>
                <div
                  className="relative h-10 rounded-lg border border-dashed bg-slate-50 dark:border-slate-700 dark:bg-slate-950/50"
                  style={{ width: timelineWidth }}
                >
                  {segments.map((entry) => {
                    const left = entry.start * UNIT_WIDTH;
                    const width = (entry.end - entry.start) * UNIT_WIDTH;
                    return (
                      <motion.div
                        key={`io-${entry.id}-${entry.start}-${entry.end}`}
                        initial={{ opacity: 0, scaleY: 0.6 }}
                        animate={{ opacity: 1, scaleY: 1 }}
                        transition={{ duration: 0.3 }}
                        className={cn(
                          'absolute inset-y-1 flex items-center justify-center rounded border-2 border-dashed font-mono text-xs font-bold',
                          style?.soft ?? 'bg-slate-100',
                          style?.text ?? 'text-slate-700',
                          style?.border ?? 'border-slate-300'
                        )}
                        style={{ left, width }}
                      >
                        {entry.start}–{entry.end}
                      </motion.div>
                    );
                  })}
                  <motion.div
                    className="pointer-events-none absolute inset-y-0 border-s-2 border-blue-700 opacity-40 dark:border-blue-300"
                    animate={{ left: cursorPosition }}
                    transition={{ duration: 0.25 }}
                  />
                </div>
              </div>
            );
          })}

          {/* Time axis */}
          <div
            className="mt-2 flex items-start"
            style={{ gap: LANE_GAP }}
          >
            <div className="shrink-0" style={{ width: LABEL_WIDTH }} />
            <div
              className="relative h-7"
              style={{ width: timelineWidth }}
            >
              {Array.from({ length: totalTime + 1 }, (_, t) => (
                <div
                  key={t}
                  className="absolute flex flex-col items-center"
                  style={{ left: t * UNIT_WIDTH, transform: 'translateX(-50%)' }}
                >
                  <span className="h-2 border-s border-slate-400 dark:border-slate-600" />
                  <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {t}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
