---
name: os-visualization
description: This skill should be used whenever creating, modifying, or debugging an interactive visualization for the OS learning platform - including process state diagrams, CPU scheduling simulators, memory management visualizations, page replacement algorithms, synchronization demos, deadlock detection, or disk scheduling. Use this skill whenever the user mentions building any animation, diagram, simulator, or interactive demo for OS concepts. This skill is critical for maintaining visual consistency, proper Framer Motion usage, and the mandatory step-controller pattern across all visualizations.
---

# Skill: Building Interactive Simulations

## Non-Negotiable Requirements

Every simulation on the platform must include:

1. **StepController** — fixed control bar: Reset / Previous / PlayPause / Next
2. **Pre-computed step array** — `steps[]` computed in `useMemo`; never derive state on the fly during render
3. **Framer Motion animations** — no manual CSS transitions
4. **Hebrew explanation panel** — updates with each step; tells the student what is happening and why
5. **Real reset behavior** — returns to the exact initial state, including all parameters
6. **At least one simulation per lecture must allow parameter changes** (e.g., number of processes, quantum size, frame count)

Simulations are a core learning tool. Give each one enough visual space and make the active step immediately obvious. See **Simulation prominence** in `CLAUDE.md` for full requirements.

**Build only the visualizations listed in the approved wave.** Do not add extra demos, parameter panels, or supporting simulations beyond what the plan specifies.

### Pedagogical Intent

Before designing, identify which pattern fits the concept (from the approved plan):

- **Timeline-first** — scheduling, I/O queues, process lifecycle: show time on an axis
- **State-first** — process states, deadlock: show state transitions between nodes
- **Queue-first** — producer-consumer, disk scheduling, ready queue: show data moving through queues
- **Trace-first** — page replacement, Banker's algorithm: step through a trace table row by row

Supporting panels (Hebrew explanation, counters, metrics) must support the main learning visual, not compete with it for screen space. Every step should help the student answer: **"what happened now and why?"**

---

## Base Template

```tsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StepController from '@/components/common/StepController';

interface MyVisualizationProps {
  // simulation-specific props
}

// Snapshot of state at a single step
interface Step {
  description: string; // Hebrew explanation shown in the UI
  // additional fields as needed (running, ready, frames, ...)
}

export default function MyVisualization(_props: MyVisualizationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Pre-compute all steps — required for Previous and Reset to work correctly
  const steps = useMemo<Step[]>(() => {
    return [
      { description: 'מצב התחלתי' },
      // ...
    ];
  }, [/* dependencies that affect step computation */]);

  const totalSteps = steps.length;
  const current = steps[currentStep];

  const handleNext = useCallback(() => {
    setCurrentStep((s) => {
      if (s < totalSteps - 1) return s + 1;
      setIsPlaying(false);
      return s;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  // Auto-advance when playing — use setTimeout per step, never setInterval
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  return (
    <div className="space-y-4">
      {/* Diagram area — keep large enough to read comfortably */}
      <div className="relative min-h-[320px] rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {/* Render visualization content from `current` */}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step explanation — compact and focused */}
      <div className="rounded-md bg-muted p-3 text-sm leading-relaxed" dir="rtl">
        {current.description}
      </div>

      {/* Step controller */}
      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={currentStep > 0}
        canGoForward={currentStep < totalSteps - 1}
      />

      {/* Progress indicator */}
      <div className="text-center text-xs text-muted-foreground">
        שלב {currentStep + 1} מתוך {totalSteps}
      </div>
    </div>
  );
}
```

---

## Category Templates

### Processes and Threads (`visualizations/processes/`)
- **ProcessStates** — 5 circles connected by arrows (New, Ready, Running, Waiting, Terminated); active circle glows; use `--color-state-*` tokens.
- **ContextSwitch** — two processes, CPU in center, animated state transition between them.

### CPU Scheduling (`visualizations/scheduling/`)
- **Gantt Chart** — SVG rectangles with `framer-motion` `layoutId` for smooth transitions.
- Separate component per algorithm (FCFS, SJF, RR) with a mathematical explanation panel.
- Display metrics: Waiting Time, Turnaround Time, Response Time.

### Memory Management (`visualizations/memory/`)
- **Paging** — two grids (Physical / Virtual) connected by animated arrows.
- **Address Translation** — animated flow: Virtual Address → Page Table → Physical Address.

### Virtual Memory / Page Replacement (`visualizations/vmem/`)
- Frame row + page reference queue.
- Green = Hit, Red = Miss (Page Fault).
- Live hit/miss counter.

### Synchronization (`visualizations/sync/`)
- **Producer-Consumer** — buffer in the center, two actors on each side.
- **Dining Philosophers** — 5 circles in a ring, forks between them.
- State colors: thinking (gray), hungry (yellow), eating (green), blocked (red).

### Deadlocks (`visualizations/deadlock/`)
- **Resource Allocation Graph** — processes as squares, resources as circles, directed arrows.
- **Banker's Algorithm** — live-updating tables: Available / Allocation / Max / Need.

### Disk Scheduling (`visualizations/io/`)
- X-axis = cylinder number, Y-axis = time.
- Animated line tracing head movement.
- Side-by-side comparison of FCFS, SSTF, SCAN, C-SCAN.

---

## Process State Color System

Use the CSS token names, not hex values directly:

| State | Token | Color |
|-------|-------|-------|
| New | `--color-state-new` / `bg-state-new` | slate (#64748b) |
| Ready | `--color-state-ready` / `bg-state-ready` | blue (#3b82f6) |
| Running | `--color-state-running` / `bg-state-running` | green (#22c55e) |
| Waiting | `--color-state-waiting` / `bg-state-waiting` | amber (#f59e0b) |
| Terminated | `--color-state-terminated` / `bg-state-terminated` | gray (#6b7280) |

Do not override these mappings.

---

## Strict Rules

- ❌ Never use `setInterval` — use `setTimeout` re-triggered on each step
- ❌ Never mutate state inside render
- ❌ Never compute the current visualization state on the fly during render
- ✅ Always pre-compute all steps in a `useMemo` array
- ✅ Always use `AnimatePresence` for step transitions
- ✅ Always assign a unique `key` per step on the motion element
- ✅ Use `--color-state-*` tokens from `src/index.css`
- ✅ Verify the component works correctly in dark mode (`dark:` classes)
- ✅ Use `ps-*` / `pe-*` for padding/margin — never `pl-*` / `pr-*`
