import { getTotalCpuTime } from './schedulingMetrics';
import { runRoundRobin } from './roundRobinScheduling';
import {
  buildSchedulingResult,
  buildTraceStep,
  createCpuSegment,
  createIdleSegment,
  createTraceEvent,
  resetTraceIds,
} from './schedulingTrace';
import type {
  CoreSchedulingAlgorithm,
  SchedulingProcess,
  SchedulingResult,
  SchedulingTraceEvent,
  SchedulingTraceStep,
  TimelineSegment,
} from './schedulingTypes';

const ALGORITHM_TITLES: Record<CoreSchedulingAlgorithm, string> = {
  fcfs: 'FCFS',
  sjf: 'SJF',
  srtf: 'SRTF',
  priority: 'Priority Scheduling',
  'round-robin': 'Round Robin',
};

const ALGORITHM_SUMMARIES: Record<CoreSchedulingAlgorithm, string> = {
  fcfs:
    'מריץ לפי סדר הגעה. פשוט ולא preemptive, אבל סדר הגעה לא מוצלח יכול לייקר את ההמתנה.',
  sjf:
    'בוחר את ה-CPU burst הקצר ביותר מבין התהליכים שהגיעו. בגרסה הזאת אין עצירה באמצע.',
  srtf:
    'הגרסה ה-preemptive של SJF. בכל זמן בוחרים את הזמן שנותר הקצר ביותר.',
  priority:
    'בוחר לפי priority. כאן מדגימים גרסה preemptive: כשמגיע תהליך עם מספר עדיפות קטן יותר, הוא יכול לקבל את ה-CPU.',
  'round-robin':
    'כל תהליך מקבל quantum קבוע. אם הוא לא מסיים בזמן, הוא חוזר לסוף ה-Ready Queue.',
};

interface TraceState {
  steps: SchedulingTraceStep[];
  events: SchedulingTraceEvent[];
  cpuSegments: TimelineSegment[];
  ioSegments: TimelineSegment[];
  completed: Set<string>;
  completionTimes: Record<string, number>;
  firstStartTimes: Record<string, number | undefined>;
  remainingCpu: Record<string, number>;
}

function sortByArrival(processes: SchedulingProcess[]): SchedulingProcess[] {
  return [...processes].sort(
    (a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id)
  );
}

function createTraceState(processes: SchedulingProcess[]): TraceState {
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
  };
}

function arrivedUnfinished(
  processes: SchedulingProcess[],
  time: number,
  completed: Set<string>,
  runningProcess: string | null
): SchedulingProcess[] {
  return processes.filter(
    (process) =>
      process.arrivalTime <= time &&
      !completed.has(process.id) &&
      process.id !== runningProcess
  );
}

function readyQueueByArrival(
  processes: SchedulingProcess[],
  time: number,
  completed: Set<string>,
  runningProcess: string | null
): string[] {
  return arrivedUnfinished(processes, time, completed, runningProcess)
    .sort((a, b) => a.arrivalTime - b.arrivalTime || a.id.localeCompare(b.id))
    .map((process) => process.id);
}

function readyQueueByBurst(
  processes: SchedulingProcess[],
  time: number,
  completed: Set<string>,
  runningProcess: string | null
): string[] {
  return arrivedUnfinished(processes, time, completed, runningProcess)
    .sort(
      (a, b) =>
        a.burstTime - b.burstTime ||
        a.arrivalTime - b.arrivalTime ||
        a.id.localeCompare(b.id)
    )
    .map((process) => process.id);
}

function readyQueueByRemaining(
  processes: SchedulingProcess[],
  time: number,
  completed: Set<string>,
  runningProcess: string | null,
  remainingCpu: Record<string, number>
): string[] {
  return arrivedUnfinished(processes, time, completed, runningProcess)
    .sort(
      (a, b) =>
        remainingCpu[a.id] - remainingCpu[b.id] ||
        a.arrivalTime - b.arrivalTime ||
        a.id.localeCompare(b.id)
    )
    .map((process) => process.id);
}

function readyQueueByPriority(
  processes: SchedulingProcess[],
  time: number,
  completed: Set<string>,
  runningProcess: string | null
): string[] {
  return arrivedUnfinished(processes, time, completed, runningProcess)
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        a.arrivalTime - b.arrivalTime ||
        a.id.localeCompare(b.id)
    )
    .map((process) => process.id);
}

function pushStep({
  state,
  processes,
  time,
  runningProcess,
  readyQueue,
  event,
}: {
  state: TraceState;
  processes: SchedulingProcess[];
  time: number;
  runningProcess: string | null;
  readyQueue: string[];
  event: SchedulingTraceEvent;
}) {
  state.events.push(event);
  state.steps.push(
    buildTraceStep({
      processes,
      time,
      runningProcess,
      readyQueue,
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

function markFirstStart(state: TraceState, processId: string, time: number) {
  if (state.firstStartTimes[processId] === undefined) {
    state.firstStartTimes[processId] = time;
  }
}

function buildResult(
  algorithm: CoreSchedulingAlgorithm,
  processes: SchedulingProcess[],
  state: TraceState
): SchedulingResult {
  return buildSchedulingResult({
    algorithm,
    title: ALGORITHM_TITLES[algorithm],
    summary: ALGORITHM_SUMMARIES[algorithm],
    processes,
    steps: state.steps,
    events: state.events,
    cpuSegments: state.cpuSegments,
    ioSegments: state.ioSegments,
    completionTimes: state.completionTimes,
    firstStartTimes: state.firstStartTimes,
  });
}

export function runFcfs(processes: SchedulingProcess[]): SchedulingResult {
  resetTraceIds();
  const sorted = sortByArrival(processes);
  const state = createTraceState(sorted);
  let time = 0;

  sorted.forEach((process) => {
    if (time < process.arrivalTime) {
      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: process.arrivalTime,
          reason: `אין תהליך מוכן עד ש-${process.id} מגיע.`,
        })
      );
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        readyQueue: readyQueueByArrival(sorted, time, state.completed, null),
        event: createTraceEvent({
          type: 'idle',
          time,
          endTime: process.arrivalTime,
          title: 'CPU פנוי',
          description: `ה-CPU פנוי עד ש-${process.id} מגיע בזמן ${process.arrivalTime}.`,
        }),
      });
      time = process.arrivalTime;
    }

    markFirstStart(state, process.id, time);
    pushStep({
      state,
      processes: sorted,
      time,
      runningProcess: process.id,
      readyQueue: readyQueueByArrival(sorted, time, state.completed, process.id),
      event: createTraceEvent({
        type: 'dispatch',
        time,
        processId: process.id,
        queueId: 'ready',
        title: `${process.id} מקבל CPU`,
        description: `${process.id} הגיע ראשון מבין הממתינים, ולכן FCFS נותן לו לרוץ עד הסוף.`,
      }),
    });

    const end = time + process.burstTime;
    state.cpuSegments.push(
      createCpuSegment({
        processId: process.id,
        start: time,
        end,
        eventType: 'dispatch',
        reason: 'FCFS הוא nonpreemptive.',
      })
    );
    state.remainingCpu[process.id] = 0;
    time = end;
    state.completionTimes[process.id] = time;
    state.completed.add(process.id);

    pushStep({
      state,
      processes: sorted,
      time,
      runningProcess: null,
      readyQueue: readyQueueByArrival(sorted, time, state.completed, null),
      event: createTraceEvent({
        type: 'completion',
        time,
        processId: process.id,
        title: `${process.id} הסתיים`,
        description: `${process.id} הסתיים בזמן ${time}. רק עכשיו FCFS עובר לתהליך הבא.`,
      }),
    });
  });

  return buildResult('fcfs', sorted, state);
}

export function runSjf(processes: SchedulingProcess[]): SchedulingResult {
  resetTraceIds();
  const sorted = sortByArrival(processes);
  const state = createTraceState(sorted);
  let time = 0;

  while (state.completed.size < sorted.length) {
    const available = sorted
      .filter((process) => process.arrivalTime <= time && !state.completed.has(process.id))
      .sort(
        (a, b) =>
          a.burstTime - b.burstTime ||
          a.arrivalTime - b.arrivalTime ||
          a.id.localeCompare(b.id)
      );

    if (available.length === 0) {
      const nextArrival = sorted.find((process) => !state.completed.has(process.id));
      if (!nextArrival) break;
      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: nextArrival.arrivalTime,
          reason: 'אין תהליך מוכן.',
        })
      );
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        readyQueue: readyQueueByBurst(sorted, time, state.completed, null),
        event: createTraceEvent({
          type: 'idle',
          time,
          endTime: nextArrival.arrivalTime,
          title: 'CPU פנוי',
          description: `אין תהליך מוכן. ה-CPU ממתין עד זמן ${nextArrival.arrivalTime}.`,
        }),
      });
      time = nextArrival.arrivalTime;
      continue;
    }

    const selected = available[0];
    markFirstStart(state, selected.id, time);
    pushStep({
      state,
      processes: sorted,
      time,
      runningProcess: selected.id,
      readyQueue: readyQueueByBurst(sorted, time, state.completed, selected.id),
      event: createTraceEvent({
        type: 'dispatch',
        time,
        processId: selected.id,
        queueId: 'ready',
        title: `${selected.id} מקבל CPU`,
        description: `${selected.id} נבחר כי יש לו את ה-CPU burst הקצר ביותר מבין התהליכים המוכנים.`,
      }),
    });

    const end = time + selected.burstTime;
    state.cpuSegments.push(
      createCpuSegment({
        processId: selected.id,
        start: time,
        end,
        eventType: 'dispatch',
        reason: 'SJF nonpreemptive לא עוצר באמצע burst.',
      })
    );
    state.remainingCpu[selected.id] = 0;
    time = end;
    state.completionTimes[selected.id] = time;
    state.completed.add(selected.id);

    pushStep({
      state,
      processes: sorted,
      time,
      runningProcess: null,
      readyQueue: readyQueueByBurst(sorted, time, state.completed, null),
      event: createTraceEvent({
        type: 'completion',
        time,
        processId: selected.id,
        title: `${selected.id} הסתיים`,
        description: `${selected.id} הסתיים. ב-SJF nonpreemptive לא עוצרים אותו באמצע.`,
      }),
    });
  }

  return buildResult('sjf', sorted, state);
}

export function runSrtf(processes: SchedulingProcess[]): SchedulingResult {
  resetTraceIds();
  const sorted = sortByArrival(processes);
  const state = createTraceState(sorted);
  let time = 0;
  let lastRunning: string | null = null;

  while (state.completed.size < sorted.length) {
    const available = sorted
      .filter((process) => process.arrivalTime <= time && !state.completed.has(process.id))
      .sort(
        (a, b) =>
          state.remainingCpu[a.id] - state.remainingCpu[b.id] ||
          a.arrivalTime - b.arrivalTime ||
          a.id.localeCompare(b.id)
      );

    if (available.length === 0) {
      const nextArrival = sorted.find((process) => !state.completed.has(process.id));
      if (!nextArrival) break;
      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: nextArrival.arrivalTime,
          reason: 'אין תהליך מוכן.',
        })
      );
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        readyQueue: readyQueueByRemaining(
          sorted,
          time,
          state.completed,
          null,
          state.remainingCpu
        ),
        event: createTraceEvent({
          type: 'idle',
          time,
          endTime: nextArrival.arrivalTime,
          title: 'CPU פנוי',
          description: `אין תהליך מוכן. ה-CPU ממתין עד זמן ${nextArrival.arrivalTime}.`,
        }),
      });
      time = nextArrival.arrivalTime;
      lastRunning = null;
      continue;
    }

    const selected = available[0];
    if (selected.id !== lastRunning) {
      const event =
        lastRunning === null
          ? createTraceEvent({
              type: 'dispatch',
              time,
              processId: selected.id,
              queueId: 'ready',
              title: `${selected.id} מקבל CPU`,
              description: `${selected.id} נבחר כי הזמן שנותר שלו הוא הקצר ביותר כרגע.`,
            })
          : createTraceEvent({
              type: 'preemption',
              time,
              processId: selected.id,
              fromProcessId: lastRunning,
              toProcessId: selected.id,
              queueId: 'ready',
              title: `${selected.id} עוצר את ${lastRunning}`,
              description: `${selected.id} מקבל את ה-CPU כי הזמן שנותר שלו קצר יותר מזה של ${lastRunning}.`,
            });
      markFirstStart(state, selected.id, time);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: selected.id,
        readyQueue: readyQueueByRemaining(
          sorted,
          time,
          state.completed,
          selected.id,
          state.remainingCpu
        ),
        event,
      });
      lastRunning = selected.id;
    }

    state.cpuSegments.push(
      createCpuSegment({
        processId: selected.id,
        start: time,
        end: time + 1,
        eventType: lastRunning === selected.id ? 'cpu-run' : 'dispatch',
        reason: 'SRTF בודק בכל רגע מי בעל הזמן שנותר הקצר ביותר.',
      })
    );
    state.remainingCpu[selected.id] -= 1;
    time += 1;

    if (state.remainingCpu[selected.id] === 0) {
      state.completionTimes[selected.id] = time;
      state.completed.add(selected.id);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        readyQueue: readyQueueByRemaining(
          sorted,
          time,
          state.completed,
          null,
          state.remainingCpu
        ),
        event: createTraceEvent({
          type: 'completion',
          time,
          processId: selected.id,
          title: `${selected.id} הסתיים`,
          description: `${selected.id} הסתיים בזמן ${time}. SRTF יבחר שוב לפי הזמן שנותר הקצר ביותר.`,
        }),
      });
      lastRunning = null;
    }
  }

  return buildResult('srtf', sorted, state);
}

export function runPriorityScheduling(processes: SchedulingProcess[]): SchedulingResult {
  resetTraceIds();
  const sorted = sortByArrival(processes);
  const state = createTraceState(sorted);
  let time = 0;
  let lastRunning: string | null = null;

  while (state.completed.size < sorted.length) {
    const available = sorted
      .filter((process) => process.arrivalTime <= time && !state.completed.has(process.id))
      .sort(
        (a, b) =>
          a.priority - b.priority ||
          a.arrivalTime - b.arrivalTime ||
          a.id.localeCompare(b.id)
      );

    if (available.length === 0) {
      const nextArrival = sorted.find((process) => !state.completed.has(process.id));
      if (!nextArrival) break;
      state.cpuSegments.push(
        createIdleSegment({
          start: time,
          end: nextArrival.arrivalTime,
          reason: 'אין תהליך מוכן.',
        })
      );
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        readyQueue: readyQueueByPriority(sorted, time, state.completed, null),
        event: createTraceEvent({
          type: 'idle',
          time,
          endTime: nextArrival.arrivalTime,
          title: 'CPU פנוי',
          description: `אין תהליך מוכן. ה-CPU ממתין עד זמן ${nextArrival.arrivalTime}.`,
        }),
      });
      time = nextArrival.arrivalTime;
      lastRunning = null;
      continue;
    }

    const selected = available[0];
    if (selected.id !== lastRunning) {
      const event =
        lastRunning === null
          ? createTraceEvent({
              type: 'dispatch',
              time,
              processId: selected.id,
              queueId: 'ready',
              title: `${selected.id} מקבל CPU`,
              description: `${selected.id} נבחר כי priority=${selected.priority}. בשקפים: מספר קטן יותר הוא עדיפות גבוהה יותר.`,
            })
          : createTraceEvent({
              type: 'preemption',
              time,
              processId: selected.id,
              fromProcessId: lastRunning,
              toProcessId: selected.id,
              queueId: 'ready',
              title: `${selected.id} עוצר את ${lastRunning}`,
              description: `${selected.id} מבצע preemption ל-${lastRunning}, כי priority=${selected.priority} גבוה יותר.`,
            });
      markFirstStart(state, selected.id, time);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: selected.id,
        readyQueue: readyQueueByPriority(sorted, time, state.completed, selected.id),
        event,
      });
      lastRunning = selected.id;
    }

    state.cpuSegments.push(
      createCpuSegment({
        processId: selected.id,
        start: time,
        end: time + 1,
        eventType: 'cpu-run',
        reason: 'Priority preemptive בודק אם יש תהליך עם עדיפות גבוהה יותר.',
      })
    );
    state.remainingCpu[selected.id] -= 1;
    time += 1;

    if (state.remainingCpu[selected.id] === 0) {
      state.completionTimes[selected.id] = time;
      state.completed.add(selected.id);
      pushStep({
        state,
        processes: sorted,
        time,
        runningProcess: null,
        readyQueue: readyQueueByPriority(sorted, time, state.completed, null),
        event: createTraceEvent({
          type: 'completion',
          time,
          processId: selected.id,
          title: `${selected.id} הסתיים`,
          description: `${selected.id} הסתיים בזמן ${time}. Priority Scheduling בוחר שוב את המספר הקטן ביותר מבין המוכנים.`,
        }),
      });
      lastRunning = null;
    }
  }

  return buildResult('priority', sorted, state);
}

export function runCoreSchedulingAlgorithm(
  algorithm: CoreSchedulingAlgorithm,
  processes: SchedulingProcess[]
): SchedulingResult {
  if (algorithm === 'fcfs') return runFcfs(processes);
  if (algorithm === 'sjf') return runSjf(processes);
  if (algorithm === 'srtf') return runSrtf(processes);
  if (algorithm === 'round-robin') return runRoundRobin(processes);
  return runPriorityScheduling(processes);
}
