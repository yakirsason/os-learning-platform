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

export interface MlfqLevel {
  id: string;
  title: string;
  quantum: number;
}

interface MlfqState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  remainingCpu: Record<string, number>;
  queues: Record<string, string[]>;
  currentQueue: Record<string, string>;
  arrived: Set<string>;
}

function buildQueueSnapshots(
  levels: MlfqLevel[],
  state: MlfqState
): QueueSnapshot[] {
  return levels.map((l) => ({
    id: l.id,
    title: l.title,
    processIds: [...state.queues[l.id]],
    quantum: l.quantum,
  }));
}

function findActiveIdx(levels: MlfqLevel[], state: MlfqState): number {
  for (let i = 0; i < levels.length; i++) {
    if (state.queues[levels[i].id].length > 0) return i;
  }
  return -1;
}

function enqueueArrivals(
  processes: SchedulingProcess[],
  state: MlfqState,
  levels: MlfqLevel[],
  time: number
): void {
  const topQ = levels[0].id;
  for (const p of processes) {
    if (
      p.arrivalTime <= time &&
      !state.arrived.has(p.id) &&
      !state.completed.has(p.id)
    ) {
      state.arrived.add(p.id);
      state.currentQueue[p.id] = topQ;
      state.queues[topQ].push(p.id);
    }
  }
}

function earliestHigherArrival(
  processes: SchedulingProcess[],
  state: MlfqState,
  time: number,
  excludeIdx: number
): number | null {
  if (excludeIdx <= 0) return null;
  let best: number | null = null;
  for (const p of processes) {
    if (state.arrived.has(p.id) || state.completed.has(p.id)) continue;
    if (p.arrivalTime <= time) continue;
    if (best === null || p.arrivalTime < best) best = p.arrivalTime;
  }
  return best;
}

function earliestArrival(
  processes: SchedulingProcess[],
  state: MlfqState,
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
  state: MlfqState;
  processes: SchedulingProcess[];
  levels: MlfqLevel[];
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

export function runMlfq(
  processes: SchedulingProcess[],
  levels: MlfqLevel[]
): SchedulingResult {
  resetTraceIds();
  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );

  const state: MlfqState = {
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
    currentQueue: {},
    arrived: new Set(),
  };

  let time = 0;
  enqueueArrivals(sorted, state, levels, time);

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
      enqueueArrivals(sorted, state, levels, time);
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
        description: `${pid} נבחר מתוך ${level.title} — התור הלא-ריק עם העדיפות הגבוהה ביותר. quantum=${level.quantum}.`,
      }),
    });

    const maxRun = Math.min(level.quantum, state.remainingCpu[pid]);
    const preemptTime = earliestHigherArrival(sorted, state, time, activeIdx);
    let runDuration = maxRun;
    let preempted = false;
    if (preemptTime !== null && preemptTime < time + maxRun) {
      runDuration = preemptTime - time;
      preempted = true;
    }

    const end = time + runDuration;
    const willComplete = !preempted && state.remainingCpu[pid] <= runDuration;
    const willQuantumExpire =
      !preempted && !willComplete && runDuration === level.quantum;
    const isBottom = activeIdx === levels.length - 1;
    const willDemote = willQuantumExpire && !isBottom;

    const segEventType: SchedulingEventType = preempted
      ? 'preemption'
      : willComplete
        ? 'completion'
        : willDemote
          ? 'queue-demotion'
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
    enqueueArrivals(sorted, state, levels, time);

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
            : `${pid} סיים את ה-CPU burst בזמן ${time} מתוך ${level.title}.`,
        }),
      });
    } else if (preempted) {
      state.queues[level.id].push(pid);
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
          title: `${pid} נעצר — תהליך חדש הגיע לתור העליון`,
          description: `תהליך חדש הגיע ל${levels[0].title}. ב-MLFQ תור גבוה יותר עוצר את מי שרץ בתור נמוך. ${pid} חוזר לסוף ${level.title}.`,
        }),
      });
    } else if (willDemote) {
      const nextLevel = levels[activeIdx + 1];
      state.currentQueue[pid] = nextLevel.id;
      state.queues[nextLevel.id].push(pid);
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'queue-demotion',
          time,
          processId: pid,
          fromQueueId: level.id,
          toQueueId: nextLevel.id,
          title: `${pid} יורד אל ${nextLevel.title}`,
          description: `${pid} ניצל את כל ה-quantum של ${level.title} ולא סיים. כלל MLFQ: תהליכי CPU כבדים יורדים לתור נמוך יותר. עכשיו quantum שלו הוא ${nextLevel.quantum}.`,
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
          title: `${pid} סיים quantum בתור התחתון`,
          description: `${pid} נמצא ב${level.title} (התור התחתון). ה-quantum נגמר והוא חוזר לסוף אותו תור.`,
        }),
      });
    } else {
      state.queues[level.id].unshift(pid);
    }
  }

  return buildSchedulingResult({
    algorithm: 'priority',
    title: 'Multilevel Feedback Queue',
    summary:
      'תורים מרובי רמות עם משוב: תהליך חדש נכנס לתור העליון, ומי שמנצל את כל ה-quantum יורד לתור נמוך יותר.',
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: [],
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}

export const MLFQ_LEVELS: MlfqLevel[] = [
  { id: 'q1', title: 'Q1 (עליון)', quantum: 2 },
  { id: 'q2', title: 'Q2 (אמצעי)', quantum: 4 },
  { id: 'q3', title: 'Q3 (תחתון)', quantum: 8 },
];

export const MLFQ_WORKLOAD: SchedulingProcess[] = [
  { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 1 },
  { id: 'P2', arrivalTime: 2, burstTime: 3, priority: 1 },
  { id: 'P3', arrivalTime: 5, burstTime: 5, priority: 1 },
];
