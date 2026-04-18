import { getTotalCpuTime } from './schedulingMetrics';
import {
  buildReadyQueueSnapshot,
  buildSchedulingResult,
  buildTraceStep,
  createCpuSegment,
  createIdleSegment,
  createTraceEvent,
  resetTraceIds,
} from './schedulingTrace';
import type {
  SchedulingProcess,
  SchedulingResult,
  SchedulingTraceEvent,
  SchedulingTraceStep,
  TimelineSegment,
} from './schedulingTypes';

interface RoundRobinState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  remainingCpu: Record<string, number>;
  readyQueue: string[];
  arrived: Set<string>;
}

const DEFAULT_QUANTUM = 3;

function sortByArrival(processes: SchedulingProcess[]): SchedulingProcess[] {
  return [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );
}

function createState(processes: SchedulingProcess[]): RoundRobinState {
  return {
    steps: [],
    events: [],
    cpuSegments: [],
    ioSegments: [],
    completed: new Set<string>(),
    completionTimes: {},
    firstStartTimes: {},
    remainingCpu: Object.fromEntries(
      processes.map((process) => [process.id, getTotalCpuTime(process)])
    ),
    readyQueue: [],
    arrived: new Set<string>(),
  };
}

function enqueueArrivals(
  processes: SchedulingProcess[],
  state: RoundRobinState,
  time: number
): string[] {
  const arrivals = processes.filter(
    (process) =>
      process.arrivalTime <= time &&
      !state.arrived.has(process.id) &&
      !state.completed.has(process.id)
  );

  arrivals.forEach((process) => {
    state.arrived.add(process.id);
    if (!state.readyQueue.includes(process.id)) {
      state.readyQueue.push(process.id);
    }
  });

  return arrivals.map((process) => process.id);
}

function pushStep({
  state,
  processes,
  time,
  runningProcess,
  event,
  quantum,
}: {
  state: RoundRobinState;
  processes: SchedulingProcess[];
  time: number;
  runningProcess: string | null;
  event: SchedulingTraceEvent;
  quantum: number;
}) {
  state.events.push(event);
  state.steps.push(
    buildTraceStep({
      processes,
      time,
      runningProcess,
      readyQueue: [...state.readyQueue],
      queues: buildReadyQueueSnapshot([...state.readyQueue], 'Ready Queue').map((queue) => ({
        ...queue,
        quantum,
      })),
      completed: state.completed,
      cpuSegments: state.cpuSegments,
      ioSegments: state.ioSegments,
      events: state.events,
      event,
      completionTimes: state.completionTimes,
      firstStartTimes: state.firstStartTimes,
      remainingCpu: state.remainingCpu,
    })
  );
}

function markFirstStart(state: RoundRobinState, processId: string, time: number) {
  if (state.firstStartTimes[processId] === undefined) {
    state.firstStartTimes[processId] = time;
  }
}

function findNextArrivalTime(
  processes: SchedulingProcess[],
  state: RoundRobinState,
  time: number
): number | null {
  const next = processes.find(
    (process) =>
      process.arrivalTime > time &&
      !state.arrived.has(process.id) &&
      !state.completed.has(process.id)
  );
  return next?.arrivalTime ?? null;
}

export function runRoundRobin(
  processes: SchedulingProcess[],
  quantum = DEFAULT_QUANTUM
): SchedulingResult {
  resetTraceIds();
  const sorted = sortByArrival(processes);
  const state = createState(sorted);
  let time = 0;

  enqueueArrivals(sorted, state, time);

  while (state.completed.size < sorted.length) {
    if (state.readyQueue.length === 0) {
      const nextArrivalTime = findNextArrivalTime(sorted, state, time);
      if (nextArrivalTime === null) break;
      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: nextArrivalTime,
          reason: 'אין תהליך מוכן בתור.',
        })
      );
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        quantum,
        event: createTraceEvent({
          type: 'idle',
          time,
          endTime: nextArrivalTime,
          title: 'CPU פנוי',
          description: `אין תהליך מוכן. ה-CPU ממתין עד זמן ${nextArrivalTime}.`,
        }),
      });
      time = nextArrivalTime;
      enqueueArrivals(sorted, state, time);
      continue;
    }

    const processId = state.readyQueue.shift();
    if (!processId) continue;

    markFirstStart(state, processId, time);
    pushStep({
      state,
      processes: sorted,
      time,
      runningProcess: processId,
      quantum,
      event: createTraceEvent({
        type: 'dispatch',
        time,
        processId,
        queueId: 'ready',
        title: `${processId} מקבל CPU`,
        description: `${processId} יוצא מראש ה-Ready Queue ומקבל quantum של עד ${quantum} יחידות זמן.`,
      }),
    });

    const runDuration = Math.min(quantum, state.remainingCpu[processId]);
    const end = time + runDuration;
    const willComplete = state.remainingCpu[processId] <= quantum;

    state.cpuSegments.push(
      createCpuSegment({
        processId,
        start: time,
        end,
        eventType: willComplete ? 'completion' : 'quantum-expiry',
        reason: willComplete
          ? `${processId} מסיים לפני סוף ה-quantum.`
          : `ה-quantum של ${processId} נגמר.`,
      })
    );

    state.remainingCpu[processId] -= runDuration;
    time = end;
    enqueueArrivals(sorted, state, time);

    if (state.remainingCpu[processId] === 0) {
      state.completionTimes[processId] = time;
      state.completed.add(processId);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        quantum,
        event: createTraceEvent({
          type: 'completion',
          time,
          processId,
          title: `${processId} הסתיים`,
          description: `${processId} סיים את ה-CPU burst שלו בזמן ${time}, ולכן הוא לא חוזר לתור.`,
        }),
      });
    } else {
      state.readyQueue.push(processId);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        quantum,
        event: createTraceEvent({
          type: 'quantum-expiry',
          time,
          processId,
          queueId: 'ready',
          title: `ה-quantum של ${processId} נגמר`,
          description: `${processId} לא סיים בזמן ה-quantum, ולכן הוא חוזר לסוף ה-Ready Queue.`,
        }),
      });
    }
  }

  return buildSchedulingResult({
    algorithm: 'round-robin',
    title: 'Round Robin',
    summary:
      `כל תהליך מקבל quantum של ${quantum}. אם הוא לא מסיים, הוא חוזר לסוף ה-Ready Queue.`,
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: state.ioSegments,
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}
