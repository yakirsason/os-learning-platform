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
