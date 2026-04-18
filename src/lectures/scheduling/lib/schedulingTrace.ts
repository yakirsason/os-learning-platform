import {
  averageMetric,
  calculateMetrics,
  getTotalCpuTime,
  mergeGanttEntries,
  mergeTimelineSegments,
} from './schedulingMetrics';
import type {
  CoreSchedulingAlgorithm,
  GanttEntry,
  ProcessRuntimeSnapshot,
  QueueSnapshot,
  SchedulingEventType,
  SchedulingProcess,
  SchedulingResult,
  SchedulingTraceEvent,
  SchedulingTraceStep,
  TimelineSegment,
} from './schedulingTypes';

interface TraceStepInput {
  processes: SchedulingProcess[];
  time: number;
  runningProcess: string | null;
  readyQueue: string[];
  completed: Set<string>;
  cpuSegments: TimelineSegment[];
  ioSegments?: TimelineSegment[];
  events: SchedulingTraceEvent[];
  event: SchedulingTraceEvent;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  remainingCpu: Record<string, number>;
  waitingProcesses?: string[];
  queues?: QueueSnapshot[];
}

interface TraceResultInput {
  algorithm: CoreSchedulingAlgorithm;
  title: string;
  summary: string;
  processes: SchedulingProcess[];
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
}

export const DEFAULT_READY_QUEUE_ID = 'ready';

let eventSequence = 0;
let segmentSequence = 0;

export function resetTraceIds() {
  eventSequence = 0;
  segmentSequence = 0;
}

export function createTraceEvent({
  type,
  time,
  endTime,
  processId,
  fromProcessId,
  toProcessId,
  queueId,
  fromQueueId,
  toQueueId,
  title,
  description,
}: Omit<SchedulingTraceEvent, 'id'>): SchedulingTraceEvent {
  eventSequence += 1;
  return {
    id: `event-${eventSequence}`,
    type,
    time,
    endTime,
    processId,
    fromProcessId,
    toProcessId,
    queueId,
    fromQueueId,
    toQueueId,
    title,
    description,
  };
}

export function createCpuSegment({
  processId,
  start,
  end,
  eventType,
  reason,
  queueId = DEFAULT_READY_QUEUE_ID,
}: {
  processId: string;
  start: number;
  end: number;
  eventType: SchedulingEventType;
  reason: string;
  queueId?: string;
}): TimelineSegment {
  segmentSequence += 1;
  return {
    id: `cpu-${segmentSequence}`,
    lane: 'cpu',
    processId,
    start,
    end,
    label: processId,
    queueId,
    eventType,
    reason,
  };
}

export function createIoSegment({
  processId,
  start,
  end,
  reason,
}: {
  processId: string;
  start: number;
  end: number;
  reason: string;
}): TimelineSegment {
  segmentSequence += 1;
  return {
    id: `io-${segmentSequence}`,
    lane: 'io',
    processId,
    start,
    end,
    label: processId,
    eventType: 'io-block',
    reason,
  };
}

export function createIdleSegment({
  start,
  end,
  reason,
}: {
  start: number;
  end: number;
  reason: string;
}): TimelineSegment {
  segmentSequence += 1;
  return {
    id: `idle-${segmentSequence}`,
    lane: 'idle',
    processId: null,
    start,
    end,
    label: 'Idle',
    eventType: 'idle',
    reason,
  };
}

export function buildReadyQueueSnapshot(
  readyQueue: string[],
  title = 'Ready Queue'
): QueueSnapshot[] {
  return [
    {
      id: DEFAULT_READY_QUEUE_ID,
      title,
      processIds: readyQueue,
    },
  ];
}

function toGanttEntries(cpuSegments: TimelineSegment[]): GanttEntry[] {
  return mergeGanttEntries(
    cpuSegments
      .filter((segment) => segment.lane === 'cpu' && segment.processId !== null)
      .map((segment) => ({
        processId: segment.processId as string,
        start: segment.start,
        end: segment.end,
        queueId: segment.queueId,
        eventType: segment.eventType,
        reason: segment.reason,
      }))
  );
}

function buildProcessSnapshots({
  processes,
  time,
  runningProcess,
  readyQueue,
  completed,
  remainingCpu,
  firstStartTimes,
  waitingProcesses,
}: {
  processes: SchedulingProcess[];
  time: number;
  runningProcess: string | null;
  readyQueue: string[];
  completed: Set<string>;
  remainingCpu: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  waitingProcesses: string[];
}): ProcessRuntimeSnapshot[] {
  return processes.map((process) => {
    const isWaiting = waitingProcesses.includes(process.id);
    const isReady = readyQueue.includes(process.id);
    const status =
      completed.has(process.id)
        ? 'terminated'
        : runningProcess === process.id
          ? 'running'
          : isWaiting
            ? 'waiting'
            : process.arrivalTime > time
              ? 'not-arrived'
              : isReady
                ? 'ready'
                : 'ready';

    return {
      processId: process.id,
      status,
      queueId: status === 'ready' ? DEFAULT_READY_QUEUE_ID : undefined,
      currentPhaseIndex: 0,
      remainingCpuBurst: remainingCpu[process.id] ?? getTotalCpuTime(process),
      remainingTotalCpu: remainingCpu[process.id] ?? getTotalCpuTime(process),
      firstResponseTime:
        firstStartTimes[process.id] === undefined
          ? null
          : (firstStartTimes[process.id] ?? 0) - process.arrivalTime,
    };
  });
}

export function buildTraceStep({
  processes,
  time,
  runningProcess,
  readyQueue,
  completed,
  cpuSegments,
  ioSegments = [],
  events,
  event,
  completionTimes,
  firstStartTimes,
  remainingCpu,
  waitingProcesses = [],
  queues = buildReadyQueueSnapshot(readyQueue),
}: TraceStepInput): SchedulingTraceStep {
  const mergedCpuSegments = mergeTimelineSegments(cpuSegments);
  const mergedIoSegments = mergeTimelineSegments(ioSegments);

  return {
    id: `step-${event.id}`,
    time,
    runningProcess,
    readyQueue,
    queues,
    waitingProcesses,
    completed: Array.from(completed),
    processSnapshots: buildProcessSnapshots({
      processes,
      time,
      runningProcess,
      readyQueue,
      completed,
      remainingCpu,
      firstStartTimes,
      waitingProcesses,
    }),
    event,
    events: [...events],
    cpuSegments: mergedCpuSegments,
    ioSegments: mergedIoSegments,
    gantt: toGanttEntries(mergedCpuSegments),
    metrics: calculateMetrics(
      processes.filter((process) => completed.has(process.id)),
      completionTimes,
      firstStartTimes
    ),
    description: event.description,
  };
}

export function buildSchedulingResult({
  algorithm,
  title,
  summary,
  processes,
  steps,
  events,
  cpuSegments,
  ioSegments,
  completionTimes,
  firstStartTimes,
}: TraceResultInput): SchedulingResult {
  const mergedCpuSegments = mergeTimelineSegments(cpuSegments);
  const mergedIoSegments = mergeTimelineSegments(ioSegments);
  const metrics = calculateMetrics(processes, completionTimes, firstStartTimes);

  return {
    algorithm,
    title,
    summary,
    steps,
    events,
    cpuSegments: mergedCpuSegments,
    ioSegments: mergedIoSegments,
    gantt: toGanttEntries(mergedCpuSegments),
    metrics,
    averageWaitingTime: averageMetric(metrics, 'waitingTime'),
    averageTurnaroundTime: averageMetric(metrics, 'turnaroundTime'),
    averageResponseTime: averageMetric(metrics, 'responseTime'),
  };
}
