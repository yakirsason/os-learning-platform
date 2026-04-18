import { getProcessPhases } from './schedulingMetrics';
import {
  buildSchedulingResult,
  buildTraceStep,
  createCpuSegment,
  createIdleSegment,
  createIoSegment,
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

export interface MlfqOptions {
  /**
   * When true (default), a higher-priority queue arrival (or an I/O return
   * that re-enters a higher level) preempts a running lower-queue process.
   * When false, the running process keeps the CPU until its current quantum
   * expires, its CPU phase finishes, or it completes — matching exam
   * workloads that explicitly specify a non-preemptive MLFQ.
   */
  preemptive?: boolean;
}

interface MlfqState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  /** Index into `getProcessPhases(p)` — which phase pid is currently on. */
  phaseIndex: Record<string, number>;
  /** Time remaining in the current phase (CPU or I/O). */
  remainingInPhase: Record<string, number>;
  queues: Record<string, string[]>;
  /** Queue level pid is associated with right now (stays while pid is in I/O). */
  currentQueue: Record<string, string>;
  /** Absolute time at which pid's I/O completes. */
  ioCompletion: Record<string, number>;
  /** Currently blocked on I/O. */
  waitingProcesses: string[];
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
      ioSegments: state.ioSegments,
      events: state.events,
      event,
      completionTimes: state.completionTimes,
      firstStartTimes: state.firstStartTimes,
      remainingCpu: state.remainingInPhase,
      waitingProcesses: [...state.waitingProcesses],
    })
  );
}

/**
 * Handle all I/O completions whose end time is <= current time.
 * Each returning process re-enters the ready queue at the queue level it
 * held when it blocked (saved in `currentQueue[pid]`).
 */
function handleIoReturns(
  processes: SchedulingProcess[],
  state: MlfqState,
  levels: MlfqLevel[],
  time: number
): void {
  const returning = Object.entries(state.ioCompletion)
    .filter(([, t]) => t <= time)
    .map(([pid]) => pid)
    .sort(
      (a, b) =>
        state.ioCompletion[a] - state.ioCompletion[b] || a.localeCompare(b)
    );

  for (const pid of returning) {
    const actualEnd = state.ioCompletion[pid];
    delete state.ioCompletion[pid];
    state.waitingProcesses = state.waitingProcesses.filter((id) => id !== pid);

    const p = processes.find((pp) => pp.id === pid)!;
    const phases = getProcessPhases(p);
    const nextIdx = state.phaseIndex[pid] + 1;

    if (nextIdx < phases.length) {
      state.phaseIndex[pid] = nextIdx;
      state.remainingInPhase[pid] = phases[nextIdx].duration;
      const returnLevelId = state.currentQueue[pid];
      state.queues[returnLevelId].push(pid);

      const levelTitle =
        levels.find((l) => l.id === returnLevelId)?.title ?? returnLevelId;
      const lateNote =
        actualEnd < time
          ? ' ה-CPU היה תפוס, ולכן הוא הצטרף ל-Ready רק עכשיו.'
          : '';

      pushStep({
        state,
        processes,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'io-return',
          time,
          processId: pid,
          toQueueId: returnLevelId,
          title: `${pid} חוזר מ-I/O אל ${levelTitle}`,
          description: `${pid} סיים I/O בזמן ${actualEnd} ונכנס מחדש ל-${levelTitle} — אותה רמה שבה היה לפני ה-I/O (I/O לפני סוף ה-quantum לא גורם להורדה).${lateNote}`,
        }),
      });
    } else {
      // Process finished with an I/O phase as the last phase (unusual).
      // Treat as completion at this time.
      state.completionTimes[pid] = time;
      state.completed.add(pid);
      pushStep({
        state,
        processes,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'completion',
          time,
          processId: pid,
          title: `${pid} הסתיים אחרי I/O`,
          description: `${pid} סיים את פאזת ה-I/O האחרונה בזמן ${time}.`,
        }),
      });
    }
  }
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

function earliestIoCompletion(state: MlfqState): number | null {
  const values = Object.values(state.ioCompletion);
  if (values.length === 0) return null;
  return Math.min(...values);
}

function earliestHigherArrival(
  processes: SchedulingProcess[],
  state: MlfqState,
  time: number,
  excludeIdx: number
): number | null {
  // New arrivals always enter the top queue. So only an excludeIdx > 0 is
  // susceptible to preemption from arrivals.
  if (excludeIdx <= 0) return null;
  let best: number | null = null;
  for (const p of processes) {
    if (state.arrived.has(p.id) || state.completed.has(p.id)) continue;
    if (p.arrivalTime <= time) continue;
    if (best === null || p.arrivalTime < best) best = p.arrivalTime;
  }
  return best;
}

function earliestHigherIoReturn(
  state: MlfqState,
  levels: MlfqLevel[],
  time: number,
  excludeIdx: number
): number | null {
  // An I/O return re-enters at its saved `currentQueue[pid]` level.
  // If that level has priority strictly higher than the running process's
  // level (smaller idx), it can preempt.
  let best: number | null = null;
  for (const [pid, endTime] of Object.entries(state.ioCompletion)) {
    if (endTime <= time) continue;
    const qIdx = levels.findIndex((l) => l.id === state.currentQueue[pid]);
    if (qIdx >= 0 && qIdx < excludeIdx) {
      if (best === null || endTime < best) best = endTime;
    }
  }
  return best;
}

export function runMlfq(
  processes: SchedulingProcess[],
  levels: MlfqLevel[],
  options: MlfqOptions = {}
): SchedulingResult {
  const { preemptive = true } = options;
  resetTraceIds();
  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );

  const phaseIndex: Record<string, number> = {};
  const remainingInPhase: Record<string, number> = {};
  for (const p of sorted) {
    const phases = getProcessPhases(p);
    phaseIndex[p.id] = 0;
    remainingInPhase[p.id] = phases[0]?.duration ?? 0;
  }

  const state: MlfqState = {
    steps: [],
    events: [],
    cpuSegments: [],
    ioSegments: [],
    completed: new Set(),
    completionTimes: {},
    firstStartTimes: {},
    phaseIndex,
    remainingInPhase,
    queues: Object.fromEntries(levels.map((l) => [l.id, [] as string[]])),
    currentQueue: {},
    ioCompletion: {},
    waitingProcesses: [],
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
      // No ready process. Jump to the next event (arrival OR I/O return).
      const nextArrival = earliestArrival(sorted, state, time);
      const nextIo = earliestIoCompletion(state);
      const nextTime =
        nextArrival !== null && nextIo !== null
          ? Math.min(nextArrival, nextIo)
          : (nextArrival ?? nextIo);

      if (nextTime === null) break;

      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: nextTime,
          reason: 'אין תהליכים מוכנים — כל התהליכים ב-I/O או טרם הגיעו.',
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
          description: `אין תהליך מוכן. האירוע הבא בזמן ${nextTime} (הגעה או חזרה מ-I/O).`,
        }),
      });

      time = nextTime;
      handleIoReturns(sorted, state, levels, time);
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
        description: `${pid} נבחר מתוך ${level.title}. quantum=${level.quantum}, נותרו ${state.remainingInPhase[pid]} יחידות בפאזת ה-CPU.`,
      }),
    });

    // Run for min(quantum, remaining CPU phase). The CPU phase ends naturally
    // when remainingInPhase hits 0; the quantum ends if the whole slice is used.
    const maxRun = Math.min(level.quantum, state.remainingInPhase[pid]);

    let preemptTime: number | null = null;
    if (preemptive) {
      const arr = earliestHigherArrival(sorted, state, time, activeIdx);
      const ioRet = earliestHigherIoReturn(state, levels, time, activeIdx);
      if (arr !== null && ioRet !== null) preemptTime = Math.min(arr, ioRet);
      else preemptTime = arr ?? ioRet;
    }

    let runDuration = maxRun;
    let preempted = false;
    if (preemptTime !== null && preemptTime < time + maxRun) {
      runDuration = preemptTime - time;
      preempted = true;
    }

    const end = time + runDuration;
    const newRemainingInPhase = state.remainingInPhase[pid] - runDuration;
    const willFinishPhase = !preempted && newRemainingInPhase === 0;

    const phases = getProcessPhases(sorted.find((p) => p.id === pid)!);
    const nextPhaseIdx = state.phaseIndex[pid] + 1;
    const hasNextPhase = nextPhaseIdx < phases.length;
    const nextPhaseType = hasNextPhase ? phases[nextPhaseIdx].type : null;

    const willComplete = willFinishPhase && !hasNextPhase;
    const willBlockIo = willFinishPhase && nextPhaseType === 'io';
    const willContinueCpu = willFinishPhase && nextPhaseType === 'cpu';
    const willQuantumExpireMidPhase = !preempted && !willFinishPhase;
    const isBottom = activeIdx === levels.length - 1;
    const willDemote = willQuantumExpireMidPhase && !isBottom;

    const segEventType: SchedulingEventType = preempted
      ? 'preemption'
      : willComplete
        ? 'completion'
        : willBlockIo
          ? 'io-block'
          : willDemote
            ? 'queue-demotion'
            : willQuantumExpireMidPhase
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

    state.remainingInPhase[pid] = newRemainingInPhase;
    time = end;

    // Order: I/O returns first, then arrivals, then the running process's own
    // phase transition. Chronologically everything happens at `time`; the
    // ordering only shapes the step sequence shown to the student.
    handleIoReturns(sorted, state, levels, time);
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
            ? `${pid} סיים את כל שלביו בזמן ${time}. כל התהליכים סיימו — ההרצה הושלמה.`
            : `${pid} סיים את כל שלביו בזמן ${time} מתוך ${level.title}.`,
        }),
      });
    } else if (willBlockIo) {
      state.phaseIndex[pid] = nextPhaseIdx;
      const ioPhase = phases[nextPhaseIdx];
      state.remainingInPhase[pid] = ioPhase.duration;
      const ioEnd = time + ioPhase.duration;
      state.ioCompletion[pid] = ioEnd;
      state.waitingProcesses.push(pid);
      state.ioSegments.push(
        createIoSegment({
          processId: pid,
          start: time,
          end: ioEnd,
          reason: `${pid} מבצע I/O.`,
        })
      );
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'io-block',
          time,
          processId: pid,
          queueId: level.id,
          title: `${pid} עובר ל-I/O (נשאר ב-${level.title})`,
          description: `${pid} סיים את פאזת ה-CPU ומתחיל I/O של ${ioPhase.duration} יחידות (עד t=${ioEnd}). I/O לפני סוף ה-quantum לא גורם להורדה — הוא יחזור ל-${level.title}.`,
        }),
      });
    } else if (willContinueCpu) {
      // Back-to-back CPU phases are unusual but supported.
      state.phaseIndex[pid] = nextPhaseIdx;
      state.remainingInPhase[pid] = phases[nextPhaseIdx].duration;
      state.queues[level.id].push(pid);
      pushStep({
        state,
        processes: sorted,
        levels,
        time,
        runningProcess: null,
        event: createTraceEvent({
          type: 'cpu-run',
          time,
          processId: pid,
          queueId: level.id,
          title: `${pid} ממשיך לפאזת CPU הבאה ב-${level.title}`,
          description: `${pid} התקדם לפאזת CPU הבאה ונשאר ב-${level.title}.`,
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
          title: `${pid} נעצר — תהליך בתור גבוה יותר זמין`,
          description: `תהליך חדש (או חוזר מ-I/O) הגיע לרמה גבוהה יותר. ${pid} חוזר לסוף ${level.title} כדי לפנות CPU.`,
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
          description: `${pid} ניצל את כל ה-quantum של ${level.title} ועוד לא סיים את פאזת ה-CPU. כלל MLFQ: יורד אל ${nextLevel.title} (quantum=${nextLevel.quantum}).`,
        }),
      });
    } else if (willQuantumExpireMidPhase) {
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
          title: `${pid} סיים quantum ב-${level.title}`,
          description: `${pid} נמצא ב-${level.title} (התור התחתון). ה-quantum נגמר והוא חוזר לסוף אותו תור.`,
        }),
      });
    } else {
      // Safety net: should be unreachable given the exhaustive cases above.
      state.queues[level.id].unshift(pid);
    }
  }

  return buildSchedulingResult({
    algorithm: 'priority',
    title: 'Multilevel Feedback Queue',
    summary:
      'תורים מרובי רמות עם משוב ותמיכה ב-I/O. תהליך שחוזר מ-I/O נכנס מחדש לרמה שבה היה — רק quantum מלא ללא גמר פאזת CPU גורם להורדה.',
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: state.ioSegments,
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
