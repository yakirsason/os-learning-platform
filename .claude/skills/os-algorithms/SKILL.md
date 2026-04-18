---
name: os-algorithms
description: This skill should be used whenever implementing operating systems algorithms in TypeScript - including CPU scheduling (FCFS, SJF, SRTF, Round Robin, Priority), page replacement (FIFO, LRU, Optimal, Clock), disk scheduling (FCFS, SSTF, SCAN, C-SCAN, LOOK), deadlock detection/avoidance (Banker's Algorithm), or synchronization primitives. Use this skill whenever the user asks to implement any OS algorithm, even casually. This ensures correct implementation, proper types, step-by-step trace output for visualizations, and consistency across all algorithm implementations in src/lib/algorithms/.
---

# Skill: Implementing OS Algorithms

## Core Implementation Principles

Every algorithm in `src/lib/algorithms/` must follow these rules:

1. **Pure function** — same input always produces the same output; no side effects
2. **Full step trace** — return not just the final result but every intermediate step (the visualization depends on this)
3. **Explicit types** — `interface` for input, `interface` for output; no `any`
4. **No input mutation** — always work on a copy (`[...arr]`)
5. **Step descriptions in Hebrew** — each `SchedulingStep.description` is displayed directly in the UI

---

## Separation of Concerns

Algorithm logic and UI are strictly separated:

| Layer | Location | Responsibility |
|-------|----------|---------------|
| Pure algorithm | `src/lib/algorithms/` | Computes steps, metrics, traces |
| Visualization | `src/components/visualizations/` | Renders steps using Framer Motion |
| Lecture page | `src/lectures/{id}/index.mdx` | Composes visualizations into content |

Never put rendering logic in algorithm files. Never put computation logic in visualization components.

---

## Base Template

```typescript
// src/lib/algorithms/scheduling.ts

export interface Process {
  id: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
}

export interface SchedulingStep {
  time: number;
  runningProcess: string | null;
  readyQueue: string[];
  completed: string[];
  description: string; // Hebrew explanation — shown directly in the UI
}

export interface GanttEntry {
  processId: string;
  start: number;
  end: number;
}

export interface SchedulingResult {
  steps: SchedulingStep[];
  metrics: {
    averageWaitingTime: number;
    averageTurnaroundTime: number;
    averageResponseTime: number;
  };
  ganttChart: GanttEntry[];
}

/**
 * First Come First Served — non-preemptive scheduling by arrival order.
 * @param processes array of processes
 * @returns full simulation trace + metrics
 */
export function fcfs(processes: Process[]): SchedulingResult {
  const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
  const steps: SchedulingStep[] = [];
  const ganttChart: GanttEntry[] = [];

  let currentTime = 0;
  const completed: string[] = [];
  const waitTimes: Record<string, number> = {};
  const turnaroundTimes: Record<string, number> = {};

  for (const process of sorted) {
    if (currentTime < process.arrivalTime) {
      steps.push({
        time: currentTime,
        runningProcess: null,
        readyQueue: [],
        completed: [...completed],
        description: `המעבד ב-idle. ממתין לתהליך הבא (${process.id}).`,
      });
      currentTime = process.arrivalTime;
    }

    const waitTime = currentTime - process.arrivalTime;
    waitTimes[process.id] = waitTime;

    ganttChart.push({
      processId: process.id,
      start: currentTime,
      end: currentTime + process.burstTime,
    });

    steps.push({
      time: currentTime,
      runningProcess: process.id,
      readyQueue: sorted
        .filter(
          (p) =>
            p.arrivalTime <= currentTime &&
            !completed.includes(p.id) &&
            p.id !== process.id
        )
        .map((p) => p.id),
      completed: [...completed],
      description: `תהליך ${process.id} מתחיל לרוץ. זמן המתנה: ${waitTime}.`,
    });

    currentTime += process.burstTime;
    turnaroundTimes[process.id] = currentTime - process.arrivalTime;
    completed.push(process.id);
  }

  const n = processes.length || 1;
  const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);

  return {
    steps,
    ganttChart,
    metrics: {
      averageWaitingTime: sum(Object.values(waitTimes)) / n,
      averageTurnaroundTime: sum(Object.values(turnaroundTimes)) / n,
      averageResponseTime: sum(Object.values(waitTimes)) / n,
    },
  };
}
```

---

## Expected Algorithm Inventory

### `scheduling.ts`
- `fcfs(processes)` — First Come First Served
- `sjf(processes)` — Shortest Job First (non-preemptive)
- `srtf(processes)` — Shortest Remaining Time First (preemptive)
- `roundRobin(processes, quantum)` — Round Robin
- `priorityScheduling(processes, preemptive)` — Priority Scheduling

### `pageReplacement.ts`
- `fifo(references, frames)`
- `lru(references, frames)`
- `optimal(references, frames)` — Belady's optimal
- `clock(references, frames)` — Second chance

### `diskScheduling.ts`
- `diskFcfs(queue, head)`
- `sstf(queue, head)` — Shortest Seek Time First
- `scan(queue, head, direction, maxCylinder)`
- `cScan(queue, head, maxCylinder)`
- `look(queue, head, direction)`

### `deadlock.ts`
- `bankersAlgorithm(available, max, allocation)` — safe state check
- `detectDeadlock(resourceAllocationGraph)` — cycle detection

---

## Strict Rules

- ✅ Always return a **`steps` array** — the visualization layer depends on it
- ✅ Each step must include a **Hebrew `description`** — it is displayed directly in the UI
- ✅ **Metrics must be mathematically correct** — verify averages
- ✅ Algorithms in the same category (e.g., all scheduling) must share the same `SchedulingStep` interface
- ✅ Algorithm files export only pure functions and their types — no React, no imports from `src/components`
- ❌ Never mutate the input array — always use `[...arr]`
- ❌ No `any` — including in callbacks and generics
- ❌ No `console.log`, I/O, or any side effects
