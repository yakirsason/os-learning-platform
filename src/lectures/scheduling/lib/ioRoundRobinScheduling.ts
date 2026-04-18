import { getProcessPhases } from './schedulingMetrics';
import {
  buildReadyQueueSnapshot,
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

export const IO_RR_DEFAULT_QUANTUM = 2;

interface IoRRState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  readyQueue: string[];
  arrived: Set<string>;
  phaseIndex: Record<string, number>;
  remainingInPhase: Record<string, number>;
  ioCompletion: Record<string, number>;
  waitingProcesses: string[];
}

function sortByArrival(processes: SchedulingProcess[]): SchedulingProcess[] {
  return [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );
}

function createState(processes: SchedulingProcess[]): IoRRState {
  const phaseIndex: Record<string, number> = {};
  const remainingInPhase: Record<string, number> = {};
  for (const p of processes) {
    const phases = getProcessPhases(p);
    phaseIndex[p.id] = 0;
    remainingInPhase[p.id] = phases[0]?.duration ?? p.burstTime;
  }
  return {
    steps: [],
    events: [],
    cpuSegments: [],
    ioSegments: [],
    completed: new Set(),
    completionTimes: {},
    firstStartTimes: {},
    readyQueue: [],
    arrived: new Set(),
    phaseIndex,
    remainingInPhase,
    ioCompletion: {},
    waitingProcesses: [],
  };
}

function enqueueArrivals(
  processes: SchedulingProcess[],
  state: IoRRState,
  time: number
): void {
  for (const p of processes) {
    if (p.arrivalTime <= time && !state.arrived.has(p.id) && !state.completed.has(p.id)) {
      state.arrived.add(p.id);
      state.readyQueue.push(p.id);
    }
  }
}

function handleIoReturns(
  processes: SchedulingProcess[],
  state: IoRRState,
  time: number,
  quantum: number
): void {
  const returning = Object.entries(state.ioCompletion)
    .filter(([, t]) => t <= time)
    .map(([pid]) => pid)
    .sort((a, b) => state.ioCompletion[a] - state.ioCompletion[b] || a.localeCompare(b));

  for (const pid of returning) {
    const actualIoEnd = state.ioCompletion[pid];
    delete state.ioCompletion[pid];
    state.waitingProcesses = state.waitingProcesses.filter((id) => id !== pid);

    const p = processes.find((proc) => proc.id === pid)!;
    const phases = getProcessPhases(p);
    const nextPhaseIdx = state.phaseIndex[pid] + 1;

    if (nextPhaseIdx < phases.length) {
      state.phaseIndex[pid] = nextPhaseIdx;
      state.remainingInPhase[pid] = phases[nextPhaseIdx].duration;
      state.readyQueue.push(pid);

      const description =
        actualIoEnd < time
          ? `${pid} סיים I/O בזמן ${actualIoEnd}. ה-CPU היה תפוס, ולכן הוא נכנס ל-Ready Queue עכשיו עם ${phases[nextPhaseIdx].duration} יחידות CPU.`
          : `${pid} סיים I/O בזמן ${actualIoEnd} ונכנס ל-Ready Queue עם ${phases[nextPhaseIdx].duration} יחידות CPU.`;

      const event = createTraceEvent({
        type: 'io-return',
        time,
        processId: pid,
        title: `${pid} חוזר מ-I/O`,
        description,
      });
      pushStep({ state, processes, time, runningProcess: null, event, quantum });
    }
  }
}

function pushStep({
  state,
  processes,
  time,
  runningProcess,
  event,
  quantum,
}: {
  state: IoRRState;
  processes: SchedulingProcess[];
  time: number;
  runningProcess: string | null;
  event: SchedulingTraceEvent;
  quantum: number;
}): void {
  state.events.push(event);
  state.steps.push(
    buildTraceStep({
      processes,
      time,
      runningProcess,
      readyQueue: [...state.readyQueue],
      queues: buildReadyQueueSnapshot([...state.readyQueue], 'Ready Queue').map((q) => ({
        ...q,
        quantum,
      })),
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

export function runIoRoundRobin(
  processes: SchedulingProcess[],
  quantum = IO_RR_DEFAULT_QUANTUM
): SchedulingResult {
  resetTraceIds();
  const sorted = sortByArrival(processes);
  const state = createState(sorted);
  let time = 0;

  enqueueArrivals(sorted, state, time);

  const MAX_ITER = 20000;
  let iter = 0;

  while (state.completed.size < sorted.length && iter < MAX_ITER) {
    iter++;

    if (state.readyQueue.length === 0) {
      const nextArrival = sorted
        .filter((p) => !state.arrived.has(p.id) && !state.completed.has(p.id))
        .map((p) => p.arrivalTime)
        .reduce<number | null>((min, t) => (min === null || t < min ? t : min), null);

      const nextIo =
        Object.values(state.ioCompletion).length > 0
          ? Math.min(...Object.values(state.ioCompletion))
          : null;

      const nextTime =
        nextArrival !== null && nextIo !== null
          ? Math.min(nextArrival, nextIo)
          : (nextArrival ?? nextIo);

      if (nextTime === null) break;

      state.cpuSegments.push(
        createIdleSegment({ start: time, end: nextTime, reason: 'אין תהליך מוכן.' })
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
          endTime: nextTime,
          title: 'CPU פנוי',
          description: `ה-CPU ממתין. האירוע הבא בזמן ${nextTime}.`,
        }),
      });

      time = nextTime;
      handleIoReturns(sorted, state, time, quantum);
      enqueueArrivals(sorted, state, time);
      continue;
    }

    const pid = state.readyQueue.shift()!;

    if (state.firstStartTimes[pid] === undefined) {
      state.firstStartTimes[pid] = time;
    }

    const runDuration = Math.min(quantum, state.remainingInPhase[pid]);
    const end = time + runDuration;
    const willFinishPhase = state.remainingInPhase[pid] <= quantum;

    const phases = getProcessPhases(sorted.find((p) => p.id === pid)!);
    const isLastPhase = state.phaseIndex[pid] === phases.length - 1;

    let cpuEventType: SchedulingEventType;
    if (willFinishPhase) {
      cpuEventType = isLastPhase ? 'completion' : 'io-block';
    } else {
      cpuEventType = 'quantum-expiry';
    }

    pushStep({
      state,
      processes: sorted,
      time,
      runningProcess: pid,
      quantum,
      event: createTraceEvent({
        type: 'dispatch',
        time,
        processId: pid,
        queueId: 'ready',
        title: `${pid} מקבל CPU`,
        description: `${pid} יוצא מ-Ready Queue ומקבל quantum של עד ${quantum} יחידות.`,
      }),
    });

    state.cpuSegments.push(
      createCpuSegment({
        processId: pid,
        start: time,
        end,
        eventType: cpuEventType,
        reason: willFinishPhase
          ? `${pid} מסיים שלב CPU.`
          : `ה-quantum של ${pid} נגמר.`,
      })
    );

    state.remainingInPhase[pid] -= runDuration;
    time = end;

    handleIoReturns(sorted, state, time, quantum);
    enqueueArrivals(sorted, state, time);

    if (state.remainingInPhase[pid] === 0) {
      const nextPhaseIdx = state.phaseIndex[pid] + 1;

      if (nextPhaseIdx >= phases.length) {
        state.completionTimes[pid] = time;
        state.completed.add(pid);
        const isFinalProcess = state.completed.size === sorted.length;
        pushStep({
          state,
          processes: sorted,
          time,
          runningProcess: null,
          quantum,
          event: createTraceEvent({
            type: 'completion',
            time,
            processId: pid,
            title: isFinalProcess
              ? `סיום ההרצה — ${pid} סיים אחרון`
              : `${pid} הסתיים`,
            description: isFinalProcess
              ? `${pid} סיים את כל שלביו בזמן ${time}. כל התהליכים סיימו — ההרצה הושלמה בזמן ${time}. ה-CPU פנוי ואין יותר עבודה לתזמן.`
              : `${pid} סיים את כל שלביו בזמן ${time}.`,
          }),
        });
      } else {
        state.phaseIndex[pid] = nextPhaseIdx;
        const nextPhase = phases[nextPhaseIdx];
        state.remainingInPhase[pid] = nextPhase.duration;

        if (nextPhase.type === 'io') {
          const ioEnd = time + nextPhase.duration;
          state.ioCompletion[pid] = ioEnd;
          state.waitingProcesses.push(pid);
          state.ioSegments.push(
            createIoSegment({
              processId: pid,
              start: time,
              end: ioEnd,
              reason: `${pid} מבצע I/O למשך ${nextPhase.duration} יחידות.`,
            })
          );
          pushStep({
            state,
            processes: sorted,
            time,
            runningProcess: null,
            quantum,
            event: createTraceEvent({
              type: 'io-block',
              time,
              processId: pid,
              title: `${pid} עובר ל-I/O`,
              description: `${pid} סיים שלב CPU ועובר ל-I/O למשך ${nextPhase.duration} יחידות (עד t=${ioEnd}).`,
            }),
          });
        } else {
          state.readyQueue.push(pid);
        }
      }
    } else {
      state.readyQueue.push(pid);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        quantum,
        event: createTraceEvent({
          type: 'quantum-expiry',
          time,
          processId: pid,
          queueId: 'ready',
          title: `ה-quantum של ${pid} נגמר`,
          description: `${pid} לא סיים את שלב ה-CPU וחוזר לסוף ה-Ready Queue.`,
        }),
      });
    }
  }

  return buildSchedulingResult({
    algorithm: 'round-robin',
    title: 'Round Robin עם I/O',
    summary: `Round Robin עם quantum=${quantum}. כל תהליך עובר בין CPU ל-I/O לפי השלבים שלו.`,
    processes: sorted,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: state.ioSegments,
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}
