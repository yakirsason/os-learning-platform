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
  SchedulingEventType,
  SchedulingProcess,
  SchedulingResult,
  SchedulingTraceEvent,
  SchedulingTraceStep,
  TimelineSegment,
} from './schedulingTypes';

/**
 * I/O-aware SJF (non-preemptive) and SRTF (preemptive) implementations used
 * by the comparison view. They share the phase-state / I/O-return plumbing
 * with runMlfq and runIoRoundRobin but pick the next process by CPU length
 * rather than queue priority.
 */

interface SharedState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  phaseIndex: Record<string, number>;
  remainingInPhase: Record<string, number>;
  readyQueue: string[];
  ioCompletion: Record<string, number>;
  waitingProcesses: string[];
  arrived: Set<string>;
}

function initState(sorted: SchedulingProcess[]): SharedState {
  const phaseIndex: Record<string, number> = {};
  const remainingInPhase: Record<string, number> = {};
  for (const p of sorted) {
    const phases = getProcessPhases(p);
    phaseIndex[p.id] = 0;
    remainingInPhase[p.id] = phases[0]?.duration ?? 0;
  }
  return {
    steps: [],
    events: [],
    cpuSegments: [],
    ioSegments: [],
    completed: new Set(),
    completionTimes: {},
    firstStartTimes: {},
    phaseIndex,
    remainingInPhase,
    readyQueue: [],
    ioCompletion: {},
    waitingProcesses: [],
    arrived: new Set(),
  };
}

function enqueueArrivals(
  sorted: SchedulingProcess[],
  state: SharedState,
  time: number
): void {
  for (const p of sorted) {
    if (
      p.arrivalTime <= time &&
      !state.arrived.has(p.id) &&
      !state.completed.has(p.id)
    ) {
      state.arrived.add(p.id);
      state.readyQueue.push(p.id);
    }
  }
}

function pushStep(
  sorted: SchedulingProcess[],
  state: SharedState,
  time: number,
  runningProcess: string | null,
  event: SchedulingTraceEvent
): void {
  state.events.push(event);
  state.steps.push(
    buildTraceStep({
      processes: sorted,
      time,
      runningProcess,
      readyQueue: [...state.readyQueue],
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

function handleIoReturns(
  sorted: SchedulingProcess[],
  state: SharedState,
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
    const p = sorted.find((pp) => pp.id === pid)!;
    const phases = getProcessPhases(p);
    const nextIdx = state.phaseIndex[pid] + 1;
    if (nextIdx < phases.length) {
      state.phaseIndex[pid] = nextIdx;
      state.remainingInPhase[pid] = phases[nextIdx].duration;
      state.readyQueue.push(pid);
      pushStep(
        sorted,
        state,
        time,
        null,
        createTraceEvent({
          type: 'io-return',
          time,
          processId: pid,
          title: `${pid} חוזר מ-I/O`,
          description: `${pid} סיים I/O בזמן ${actualEnd} ונכנס ל-Ready עם פאזת CPU של ${phases[nextIdx].duration} יחידות.`,
        })
      );
    }
  }
}

function earliestIoCompletion(state: SharedState): number | null {
  const vals = Object.values(state.ioCompletion);
  return vals.length ? Math.min(...vals) : null;
}

function earliestArrival(
  sorted: SchedulingProcess[],
  state: SharedState,
  time: number
): number | null {
  let best: number | null = null;
  for (const p of sorted) {
    if (state.arrived.has(p.id) || state.completed.has(p.id)) continue;
    if (p.arrivalTime <= time) continue;
    if (best === null || p.arrivalTime < best) best = p.arrivalTime;
  }
  return best;
}

function emitIdleUntilNextEvent(
  sorted: SchedulingProcess[],
  state: SharedState,
  time: number
): number | null {
  const na = earliestArrival(sorted, state, time);
  const ni = earliestIoCompletion(state);
  const next =
    na !== null && ni !== null ? Math.min(na, ni) : (na ?? ni);
  if (next === null) return null;
  state.cpuSegments.push(
    createIdleSegment({ start: time, end: next, reason: 'אין תהליך מוכן.' })
  );
  pushStep(
    sorted,
    state,
    time,
    null,
    createTraceEvent({
      type: 'idle',
      time,
      endTime: next,
      title: 'CPU פנוי',
      description: `אין תהליך מוכן. האירוע הבא בזמן ${next}.`,
    })
  );
  return next;
}

function completeProcess(
  sorted: SchedulingProcess[],
  state: SharedState,
  time: number,
  pid: string,
  extraDescription = ''
): void {
  state.completionTimes[pid] = time;
  state.completed.add(pid);
  const isFinal = state.completed.size === sorted.length;
  pushStep(
    sorted,
    state,
    time,
    null,
    createTraceEvent({
      type: 'completion',
      time,
      processId: pid,
      title: isFinal ? `סיום ההרצה — ${pid} סיים אחרון` : `${pid} הסתיים`,
      description: isFinal
        ? `${pid} סיים את כל שלביו בזמן ${time}. כל התהליכים סיימו — ההרצה הושלמה.${extraDescription}`
        : `${pid} סיים את כל שלביו בזמן ${time}.${extraDescription}`,
    })
  );
}

function blockOnIo(
  sorted: SchedulingProcess[],
  state: SharedState,
  time: number,
  pid: string,
  nextPhaseIdx: number
): void {
  const p = sorted.find((pp) => pp.id === pid)!;
  const phases = getProcessPhases(p);
  const ioPhase = phases[nextPhaseIdx];
  state.phaseIndex[pid] = nextPhaseIdx;
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
  pushStep(
    sorted,
    state,
    time,
    null,
    createTraceEvent({
      type: 'io-block',
      time,
      processId: pid,
      title: `${pid} עובר ל-I/O`,
      description: `${pid} סיים פאזת CPU ומבצע I/O של ${ioPhase.duration} יחידות (עד t=${ioEnd}).`,
    })
  );
}

// =============================================================================
// I/O-aware SJF (non-preemptive)
// =============================================================================

export function runIoSjf(processes: SchedulingProcess[]): SchedulingResult {
  resetTraceIds();
  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );
  const state = initState(sorted);
  let time = 0;
  enqueueArrivals(sorted, state, time);

  const MAX = 20000;
  let iter = 0;
  while (state.completed.size < sorted.length && iter < MAX) {
    iter++;

    if (state.readyQueue.length === 0) {
      const next = emitIdleUntilNextEvent(sorted, state, time);
      if (next === null) break;
      time = next;
      handleIoReturns(sorted, state, time);
      enqueueArrivals(sorted, state, time);
      continue;
    }

    // SJF: select shortest current CPU phase.
    state.readyQueue.sort((a, b) => {
      if (state.remainingInPhase[a] !== state.remainingInPhase[b]) {
        return state.remainingInPhase[a] - state.remainingInPhase[b];
      }
      const pa = sorted.find((p) => p.id === a)!;
      const pb = sorted.find((p) => p.id === b)!;
      if (pa.arrivalTime !== pb.arrivalTime) {
        return pa.arrivalTime - pb.arrivalTime;
      }
      return a.localeCompare(b);
    });

    const pid = state.readyQueue.shift()!;
    if (state.firstStartTimes[pid] === undefined) {
      state.firstStartTimes[pid] = time;
    }

    pushStep(
      sorted,
      state,
      time,
      pid,
      createTraceEvent({
        type: 'dispatch',
        time,
        processId: pid,
        title: `${pid} מקבל CPU (SJF)`,
        description: `${pid} נבחר כי פאזת ה-CPU הנוכחית שלו הקצרה ביותר (${state.remainingInPhase[pid]} יחידות).`,
      })
    );

    const runDuration = state.remainingInPhase[pid];
    const end = time + runDuration;
    const p = sorted.find((pp) => pp.id === pid)!;
    const phases = getProcessPhases(p);
    const nextPhaseIdx = state.phaseIndex[pid] + 1;
    const hasNextPhase = nextPhaseIdx < phases.length;
    const nextPhaseType = hasNextPhase ? phases[nextPhaseIdx].type : null;
    const willBlockIo = hasNextPhase && nextPhaseType === 'io';
    const willComplete = !hasNextPhase;

    const segEventType: SchedulingEventType = willComplete
      ? 'completion'
      : willBlockIo
        ? 'io-block'
        : 'cpu-run';

    state.cpuSegments.push(
      createCpuSegment({
        processId: pid,
        start: time,
        end,
        eventType: segEventType,
        reason: 'SJF nonpreemptive — לא עוצר באמצע פאזת CPU.',
      })
    );
    state.remainingInPhase[pid] = 0;
    time = end;

    handleIoReturns(sorted, state, time);
    enqueueArrivals(sorted, state, time);

    if (willComplete) {
      completeProcess(sorted, state, time, pid);
    } else if (willBlockIo) {
      blockOnIo(sorted, state, time, pid, nextPhaseIdx);
    } else {
      // Back-to-back CPU phases (unusual).
      state.phaseIndex[pid] = nextPhaseIdx;
      state.remainingInPhase[pid] = phases[nextPhaseIdx].duration;
      state.readyQueue.push(pid);
    }
  }

  return buildSchedulingResult({
    algorithm: 'sjf',
    title: 'SJF (I/O-aware)',
    summary:
      'SJF nonpreemptive עם תמיכה ב-I/O: בוחר תמיד את פאזת ה-CPU הקצרה מבין התהליכים המוכנים.',
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: state.ioSegments,
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}

// =============================================================================
// I/O-aware SRTF (preemptive)
// =============================================================================

/**
 * Total CPU time remaining for a process across its current and future CPU
 * phases. Used as the SRTF sort key (Shortest Remaining Time).
 */
function totalCpuRemainingFor(p: SchedulingProcess, state: SharedState): number {
  const phases = getProcessPhases(p);
  const idx = state.phaseIndex[p.id];
  let total = 0;
  if (idx < phases.length && phases[idx].type === 'cpu') {
    total += state.remainingInPhase[p.id];
  }
  for (let i = idx + 1; i < phases.length; i++) {
    if (phases[i].type === 'cpu') total += phases[i].duration;
  }
  return total;
}

export function runIoSrtf(processes: SchedulingProcess[]): SchedulingResult {
  resetTraceIds();
  const sorted = [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );
  const state = initState(sorted);
  let time = 0;
  enqueueArrivals(sorted, state, time);

  let lastRunning: string | null = null;

  const MAX = 20000;
  let iter = 0;
  while (state.completed.size < sorted.length && iter < MAX) {
    iter++;

    if (state.readyQueue.length === 0) {
      const next = emitIdleUntilNextEvent(sorted, state, time);
      if (next === null) break;
      time = next;
      handleIoReturns(sorted, state, time);
      enqueueArrivals(sorted, state, time);
      lastRunning = null;
      continue;
    }

    // SRTF: sort by total remaining CPU (current phase + future CPU phases).
    state.readyQueue.sort((a, b) => {
      const pa = sorted.find((p) => p.id === a)!;
      const pb = sorted.find((p) => p.id === b)!;
      const ra = totalCpuRemainingFor(pa, state);
      const rb = totalCpuRemainingFor(pb, state);
      if (ra !== rb) return ra - rb;
      if (pa.arrivalTime !== pb.arrivalTime) return pa.arrivalTime - pb.arrivalTime;
      return a.localeCompare(b);
    });

    const selected = state.readyQueue[0];

    if (selected !== lastRunning) {
      if (state.firstStartTimes[selected] === undefined) {
        state.firstStartTimes[selected] = time;
      }
      const event =
        lastRunning !== null
          ? createTraceEvent({
              type: 'preemption',
              time,
              processId: selected,
              fromProcessId: lastRunning,
              toProcessId: selected,
              title: `${selected} עוצר את ${lastRunning}`,
              description: `${selected} בעל הזמן הקצר ביותר שנותר כרגע. ${lastRunning} חוזר ל-Ready.`,
            })
          : createTraceEvent({
              type: 'dispatch',
              time,
              processId: selected,
              title: `${selected} מקבל CPU (SRTF)`,
              description: `${selected} בעל הזמן הקצר ביותר שנותר.`,
            });
      pushStep(sorted, state, time, selected, event);
      lastRunning = selected;
    }

    state.cpuSegments.push(
      createCpuSegment({
        processId: selected,
        start: time,
        end: time + 1,
        eventType: 'cpu-run',
        reason: 'SRTF בודק בכל רגע מי עם הזמן הקצר ביותר.',
      })
    );
    state.remainingInPhase[selected] -= 1;
    time += 1;

    handleIoReturns(sorted, state, time);
    enqueueArrivals(sorted, state, time);

    if (state.remainingInPhase[selected] === 0) {
      // Phase just ended — take it out of the ready queue.
      state.readyQueue = state.readyQueue.filter((id) => id !== selected);
      const p = sorted.find((pp) => pp.id === selected)!;
      const phases = getProcessPhases(p);
      const nextPhaseIdx = state.phaseIndex[selected] + 1;
      const hasNextPhase = nextPhaseIdx < phases.length;
      const nextPhaseType = hasNextPhase ? phases[nextPhaseIdx].type : null;

      if (!hasNextPhase) {
        completeProcess(sorted, state, time, selected);
      } else if (nextPhaseType === 'io') {
        blockOnIo(sorted, state, time, selected, nextPhaseIdx);
      } else {
        // Back-to-back CPU phases.
        state.phaseIndex[selected] = nextPhaseIdx;
        state.remainingInPhase[selected] = phases[nextPhaseIdx].duration;
        state.readyQueue.push(selected);
      }
      lastRunning = null;
    }
    // Else: selected keeps running; next iter will re-sort and continue or preempt.
  }

  return buildSchedulingResult({
    algorithm: 'srtf',
    title: 'SRTF (I/O-aware)',
    summary:
      'SRTF preemptive עם תמיכה ב-I/O: בכל רגע רץ התהליך בעל הזמן הקצר ביותר שנותר לו.',
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: state.ioSegments,
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}
