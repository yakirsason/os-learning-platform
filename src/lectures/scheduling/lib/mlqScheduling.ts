import { getTotalCpuTime } from './schedulingMetrics';
import {
  buildSchedulingResult,
  buildTraceStep,
  createCpuSegment,
  createIdleSegment,
  createTraceEvent,
  resetTraceIds,
} from './schedulingTrace';
import type {
  QueueSnapshot,
  SchedulingEventType,
  SchedulingProcess,
  SchedulingResult,
  SchedulingTraceEvent,
  SchedulingTraceStep,
  TimelineSegment,
} from './schedulingTypes';

export interface MlqLevel {
  id: string;
  title: string;
  policy: 'rr' | 'fcfs';
  quantum?: number;
}

interface MlqState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  remainingCpu: Record<string, number>;
  queues: Record<string, string[]>;
  assignedQueue: Record<string, string>;
  arrived: Set<string>;
}

function buildQueueSnapshots(levels: MlqLevel[], state: MlqState): QueueSnapshot[] {
  return levels.map((l) => ({
    id: l.id,
    title: l.title,
    processIds: [...state.queues[l.id]],
    quantum: l.quantum,
  }));
}

function findActiveIdx(levels: MlqLevel[], state: MlqState): number {
  for (let i = 0; i < levels.length; i++) {
    if (state.queues[levels[i].id].length > 0) return i;
  }
  return -1;
}

function enqueueArrivals(
  processes: SchedulingProcess[],
  state: MlqState,
  time: number
): void {
  for (const p of processes) {
    if (
      p.arrivalTime <= time &&
      !state.arrived.has(p.id) &&
      !state.completed.has(p.id)
    ) {
      state.arrived.add(p.id);
      const qId = state.assignedQueue[p.id];
      state.queues[qId].push(p.id);
    }
  }
}

function earliestHigherArrival(
  processes: SchedulingProcess[],
  state: MlqState,
  time: number,
  excludeIdx: number,
  levels: MlqLevel[]
): number | null {
  let best: number | null = null;
  for (const p of processes) {
    if (state.arrived.has(p.id) || state.completed.has(p.id)) continue;
    if (p.arrivalTime <= time) continue;
    const qId = state.assignedQueue[p.id];
    const qIdx = levels.findIndex((l) => l.id === qId);
    if (qIdx >= 0 && qIdx < excludeIdx) {
      if (best === null || p.arrivalTime < best) best = p.arrivalTime;
    }
  }
  return best;
}

function earliestArrival(
  processes: SchedulingProcess[],
  state: MlqState,
  time: number
): number | null {
  let best: number | null = null;
  for (const p of processes) {
    if (state.arrived.has(p.id) || state.completed.has(p.id)) continue;
    if (p.arrivalTime <= time) continue;
    if (best === null || p.arrivalTime < best) best = p.arrivalTime;
  }
  return best;
}

function pushStep(args: {
  state: MlqState;
  processes: SchedulingProcess[];
  levels: MlqLevel[];
  time: number;
  runningProcess: string | null;
  event: SchedulingTraceEvent;
}): void {
  const { state, processes, levels, time, runningProcess, event } = args;
  state.events.push(event);
  state.steps.push(
    buildTraceStep({
      processes,
      time,
      runningProcess,
      readyQueue: levels.flatMap((l) => state.queues[l.id]),
      queues: buildQueueSnapshots(levels, state),
      completed: state.completed,
      cpuSegments: state.cpuSegments,
      ioSegments: [],
      events: state.events,
      event,
      completionTimes: state.completionTimes,
      firstStartTimes: state.firstStartTimes,
      remainingCpu: state.remainingCpu,
    })
  );
}

export function runMlq(
  processes: SchedulingProcess[],
  levels: MlqLevel[]
): SchedulingResult {
  resetTraceIds();
  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );

  const state: MlqState = {
    steps: [],
    events: [],
    cpuSegments: [],
    completed: new Set(),
    completionTimes: {},
    firstStartTimes: {},
    remainingCpu: Object.fromEntries(
      sorted.map((p) => [p.id, getTotalCpuTime(p)])
    ),
    queues: Object.fromEntries(levels.map((l) => [l.id, [] as string[]])),
    assignedQueue: Object.fromEntries(
      sorted.map((p) => [p.id, p.initialQueueId ?? levels[0].id])
    ),
    arrived: new Set(),
  };

  let time = 0;
  enqueueArrivals(sorted, state, time);

  const MAX = 20000;
  let iter = 0;

  while (state.completed.size < sorted.length && iter < MAX) {
    iter++;

    const activeIdx = findActiveIdx(levels, state);
    if (activeIdx === -1) {
      const nextTime = earliestArrival(sorted, state, time);
      if (nextTime === null) break;

      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: nextTime,
          reason: 'אין תהליכים בתורים.',
        })
      );
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'idle',
          time,
          endTime: nextTime,
          title: 'CPU פנוי',
          description: `אין תהליך בתורים. ה-CPU ממתין עד זמן ${nextTime}.`,
        }),
      });
      time = nextTime;
      enqueueArrivals(sorted, state, time);
      continue;
    }

    const level = levels[activeIdx];
    const pid = state.queues[level.id].shift()!;

    if (state.firstStartTimes[pid] === undefined) {
      state.firstStartTimes[pid] = time;
    }

    pushStep({
      state,
      processes: sorted,
      levels,
      time,
      runningProcess: pid,
      event: createTraceEvent({
        type: 'dispatch',
        time,
        processId: pid,
        queueId: level.id,
        title: `${pid} מקבל CPU מתוך ${level.title}`,
        description: `${pid} נבחר מתוך ${level.title} — התור הלא-ריק בעדיפות הגבוהה ביותר.`,
      }),
    });

    const rrQ = level.policy === 'rr' ? level.quantum ?? 1 : Infinity;
    const maxRun = Math.min(rrQ, state.remainingCpu[pid]);
    const preemptTime = earliestHigherArrival(
      sorted,
      state,
      time,
      activeIdx,
      levels
    );
    let runDuration = maxRun;
    let preempted = false;
    if (preemptTime !== null && preemptTime < time + maxRun) {
      runDuration = preemptTime - time;
      preempted = true;
    }

    const end = time + runDuration;
    const willComplete = !preempted && state.remainingCpu[pid] <= runDuration;
    const willQuantumExpire =
      !preempted &&
      !willComplete &&
      level.policy === 'rr' &&
      runDuration === level.quantum;

    const segEventType: SchedulingEventType = preempted
      ? 'preemption'
      : willComplete
        ? 'completion'
        : willQuantumExpire
          ? 'quantum-expiry'
          : 'cpu-run';

    state.cpuSegments.push(
      createCpuSegment({
        processId: pid,
        start: time,
        end,
        eventType: segEventType,
        reason: `${pid} רץ מתוך ${level.title}.`,
        queueId: level.id,
      })
    );

    state.remainingCpu[pid] -= runDuration;
    time = end;
    enqueueArrivals(sorted, state, time);

    if (willComplete) {
      state.completionTimes[pid] = time;
      state.completed.add(pid);
      const isFinal = state.completed.size === sorted.length;
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'completion',
          time,
          processId: pid,
          queueId: level.id,
          title: isFinal
            ? `סיום ההרצה — ${pid} סיים אחרון`
            : `${pid} הסתיים`,
          description: isFinal
            ? `${pid} סיים את ה-CPU burst בזמן ${time}. כל התהליכים סיימו — ההרצה הושלמה.`
            : `${pid} סיים את ה-CPU burst בזמן ${time}.`,
        }),
      });
    } else if (preempted) {
      state.queues[level.id].push(pid);
      const higherTitles = levels
        .slice(0, activeIdx)
        .map((l) => l.title)
        .join(' / ');
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'preemption',
          time,
          processId: pid,
          queueId: level.id,
          title: `${pid} נעצר — הגיע תהליך לתור בעדיפות גבוהה יותר`,
          description: `תהליך חדש הגיע ל${higherTitles}. ${pid} חוזר לסוף ${level.title} וה-CPU עובר לתור גבוה יותר.`,
        }),
      });
    } else if (willQuantumExpire) {
      state.queues[level.id].push(pid);
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'quantum-expiry',
          time,
          processId: pid,
          queueId: level.id,
          title: `ה-quantum של ${pid} נגמר`,
          description: `${pid} לא סיים בזמן ה-quantum של ${level.title}. חוזר לסוף אותו תור.`,
        }),
      });
    } else {
      state.queues[level.id].unshift(pid);
    }
  }

  return buildSchedulingResult({
    algorithm: 'priority',
    title: 'Multilevel Queue',
    summary:
      'תורים מרובי רמות: כל תהליך מוקצה לתור קבוע. ה-CPU רץ מהתור הלא-ריק בעדיפות הגבוהה ביותר.',
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: [],
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}

export const MLQ_LEVELS: MlqLevel[] = [
  { id: 'foreground', title: 'Foreground (RR q=2)', policy: 'rr', quantum: 2 },
  { id: 'background', title: 'Background (FCFS)', policy: 'fcfs' },
];

export const MLQ_WORKLOAD: SchedulingProcess[] = [
  {
    id: 'P1',
    arrivalTime: 0,
    burstTime: 4,
    priority: 1,
    initialQueueId: 'foreground',
  },
  {
    id: 'P2',
    arrivalTime: 2,
    burstTime: 5,
    priority: 2,
    initialQueueId: 'background',
  },
  {
    id: 'P3',
    arrivalTime: 3,
    burstTime: 3,
    priority: 1,
    initialQueueId: 'foreground',
  },
  {
    id: 'P4',
    arrivalTime: 6,
    burstTime: 2,
    priority: 2,
    initialQueueId: 'background',
  },
];
