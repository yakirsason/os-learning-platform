import type {
  ProcessMetric,
  SchedulingProcess,
  TimelineSegment,
} from '../../lib/schedulingTypes';
import { getTotalCpuTime } from '../../lib/schedulingMetrics';

export interface TimelineProcessStyle {
  solid: string;
  soft: string;
  text: string;
  border: string;
}

export type TimelineProcessStyles = Record<string, TimelineProcessStyle>;

export const PROCESS_STYLE_PALETTE: TimelineProcessStyle[] = [
  {
    solid: 'bg-blue-600 dark:bg-blue-500',
    soft: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-900',
  },
  {
    solid: 'bg-emerald-600 dark:bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  {
    solid: 'bg-amber-500 dark:bg-amber-400',
    soft: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-900',
  },
  {
    solid: 'bg-violet-600 dark:bg-violet-500',
    soft: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-200',
    border: 'border-violet-200 dark:border-violet-900',
  },
  {
    solid: 'bg-rose-600 dark:bg-rose-500',
    soft: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-200',
    border: 'border-rose-200 dark:border-rose-900',
  },
  {
    solid: 'bg-sky-600 dark:bg-sky-500',
    soft: 'bg-sky-50 dark:bg-sky-950/30',
    text: 'text-sky-700 dark:text-sky-200',
    border: 'border-sky-200 dark:border-sky-900',
  },
];

/**
 * Deterministic per-process style assignment based on position in the workload.
 * Lets presets with arbitrary IDs (A/B/C, P1/P2/…) share one color palette.
 */
export function computeProcessStyles(
  processes: SchedulingProcess[]
): TimelineProcessStyles {
  const styles: TimelineProcessStyles = {};
  processes.forEach((process, index) => {
    styles[process.id] =
      PROCESS_STYLE_PALETTE[index % PROCESS_STYLE_PALETTE.length];
  });
  return styles;
}

export function calculateRemainingBursts(
  processes: SchedulingProcess[],
  cpuSegments: TimelineSegment[]
): Record<string, number> {
  return Object.fromEntries(
    processes.map((process) => {
      const usedTime = cpuSegments
        .filter((segment) => segment.processId === process.id)
        .reduce((sum, segment) => sum + segment.end - segment.start, 0);
      return [process.id, Math.max(getTotalCpuTime(process) - usedTime, 0)];
    })
  );
}

export function findMetric(
  metrics: ProcessMetric[],
  processId: string
): ProcessMetric | undefined {
  return metrics.find((metric) => metric.processId === processId);
}
