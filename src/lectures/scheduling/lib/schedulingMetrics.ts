import type {
  GanttEntry,
  ProcessMetric,
  SchedulingProcess,
  SchedulingWorkPhase,
  TimelineSegment,
} from './schedulingTypes';

export function getProcessPhases(process: SchedulingProcess): SchedulingWorkPhase[] {
  return process.phases ?? [{ type: 'cpu', duration: process.burstTime }];
}

export function getTotalCpuTime(process: SchedulingProcess): number {
  return getProcessPhases(process)
    .filter((phase) => phase.type === 'cpu')
    .reduce((sum, phase) => sum + phase.duration, 0);
}

export function getTotalIoTime(process: SchedulingProcess): number {
  return getProcessPhases(process)
    .filter((phase) => phase.type === 'io')
    .reduce((sum, phase) => sum + phase.duration, 0);
}

export function mergeGanttEntries(entries: GanttEntry[]): GanttEntry[] {
  return entries.reduce<GanttEntry[]>((merged, entry) => {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.processId === entry.processId &&
      last.end === entry.start &&
      last.queueId === entry.queueId
    ) {
      return [
        ...merged.slice(0, -1),
        {
          ...last,
          end: entry.end,
        },
      ];
    }
    return [...merged, entry];
  }, []);
}

export function mergeTimelineSegments(segments: TimelineSegment[]): TimelineSegment[] {
  return segments.reduce<TimelineSegment[]>((merged, segment) => {
    const last = merged[merged.length - 1];
    if (
      last &&
      last.lane === segment.lane &&
      last.processId === segment.processId &&
      last.end === segment.start &&
      last.queueId === segment.queueId &&
      last.eventType === segment.eventType
    ) {
      return [
        ...merged.slice(0, -1),
        {
          ...last,
          end: segment.end,
        },
      ];
    }
    return [...merged, segment];
  }, []);
}

export function calculateMetrics(
  processes: SchedulingProcess[],
  completionTimes: Record<string, number>,
  firstStartTimes: Record<string, number | undefined> = {}
): ProcessMetric[] {
  return processes.map((process) => {
    const totalCpuTime = getTotalCpuTime(process);
    const totalIoTime = getTotalIoTime(process);
    const completionTime = completionTimes[process.id] ?? process.arrivalTime;
    const firstStartTime = firstStartTimes[process.id] ?? null;
    const turnaroundTime = completionTime - process.arrivalTime;
    const waitingTime = Math.max(turnaroundTime - totalCpuTime - totalIoTime, 0);
    const responseTime =
      firstStartTime === null ? null : firstStartTime - process.arrivalTime;

    return {
      processId: process.id,
      arrivalTime: process.arrivalTime,
      burstTime: totalCpuTime,
      priority: process.priority,
      firstStartTime,
      completionTime,
      turnaroundTime,
      waitingTime,
      responseTime,
    };
  });
}

export function averageMetric(
  metrics: ProcessMetric[],
  field: 'waitingTime' | 'turnaroundTime' | 'responseTime'
): number {
  const values = metrics
    .map((metric) => metric[field])
    .filter((value): value is number => value !== null);
  if (values.length === 0) return 0;
  const total = values.reduce((sum, value) => sum + value, 0);
  return total / values.length;
}
