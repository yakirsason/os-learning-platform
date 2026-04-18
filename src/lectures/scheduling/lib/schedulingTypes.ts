export type CoreSchedulingAlgorithm =
  | 'fcfs'
  | 'sjf'
  | 'srtf'
  | 'priority'
  | 'round-robin';

export type SchedulingWorkPhase =
  | {
      type: 'cpu';
      duration: number;
    }
  | {
      type: 'io';
      duration: number;
    };

export interface SchedulingProcess {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  phases?: SchedulingWorkPhase[];
  initialQueueId?: string;
}

export type SchedulingEventType =
  | 'arrival'
  | 'dispatch'
  | 'cpu-run'
  | 'completion'
  | 'preemption'
  | 'quantum-expiry'
  | 'io-block'
  | 'io-return'
  | 'idle'
  | 'queue-enter'
  | 'queue-exit'
  | 'queue-promotion'
  | 'queue-demotion'
  | 'no-preemption';

export interface SchedulingTraceEvent {
  id: string;
  type: SchedulingEventType;
  time: number;
  endTime?: number;
  processId?: string;
  fromProcessId?: string;
  toProcessId?: string;
  queueId?: string;
  fromQueueId?: string;
  toQueueId?: string;
  title: string;
  description: string;
}

export interface GanttEntry {
  processId: string;
  start: number;
  end: number;
  queueId?: string;
  eventType?: SchedulingEventType;
  reason?: string;
}

export interface TimelineSegment {
  id: string;
  lane: 'cpu' | 'io' | 'idle';
  processId: string | null;
  start: number;
  end: number;
  label: string;
  queueId?: string;
  eventType?: SchedulingEventType;
  reason?: string;
}

export interface QueueSnapshot {
  id: string;
  title: string;
  processIds: string[];
  quantum?: number;
}

export type ProcessRuntimeStatus =
  | 'not-arrived'
  | 'ready'
  | 'running'
  | 'waiting'
  | 'terminated';

export interface ProcessRuntimeSnapshot {
  processId: string;
  status: ProcessRuntimeStatus;
  queueId?: string;
  currentPhaseIndex: number;
  remainingCpuBurst: number;
  remainingTotalCpu: number;
  firstResponseTime: number | null;
}

export interface ProcessMetric {
  processId: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  firstStartTime: number | null;
  completionTime: number;
  turnaroundTime: number;
  waitingTime: number;
  responseTime: number | null;
}

export interface SchedulingTraceStep {
  id: string;
  time: number;
  runningProcess: string | null;
  readyQueue: string[];
  queues: QueueSnapshot[];
  waitingProcesses: string[];
  completed: string[];
  processSnapshots: ProcessRuntimeSnapshot[];
  event: SchedulingTraceEvent;
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  gantt: GanttEntry[];
  metrics: ProcessMetric[];
  description: string;
}

export interface SchedulingResult {
  algorithm: CoreSchedulingAlgorithm;
  title: string;
  summary: string;
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  gantt: GanttEntry[];
  metrics: ProcessMetric[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
}
