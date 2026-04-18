import { useCallback, useEffect, useMemo, useState } from 'react';
import StepController from '@/components/common/StepController';
import { IO_RR_DEFAULT_QUANTUM, runIoRoundRobin } from '../lib/ioRoundRobinScheduling';
import type { SchedulingProcess } from '../lib/schedulingTypes';
import IoAwareTimelineStrip from './timeline/IoAwareTimelineStrip';
import IoTimelineQueuePanel from './timeline/IoTimelineQueuePanel';
import IoWorkloadStrip from './timeline/IoWorkloadStrip';
import TimelineCurrentEventPanel from './timeline/TimelineCurrentEventPanel';
import TimelineWorkloadSummary from './timeline/TimelineWorkloadSummary';
import {
  calculateRemainingBursts,
  type TimelineProcessStyles,
} from './timeline/timelineTypes';

const WORKLOAD: SchedulingProcess[] = [
  {
    id: 'P1',
    arrivalTime: 0,
    burstTime: 6,
    priority: 1,
    phases: [
      { type: 'cpu', duration: 4 },
      { type: 'io', duration: 2 },
      { type: 'cpu', duration: 2 },
    ],
  },
  {
    id: 'P2',
    arrivalTime: 1,
    burstTime: 5,
    priority: 2,
    phases: [
      { type: 'cpu', duration: 2 },
      { type: 'io', duration: 4 },
      { type: 'cpu', duration: 3 },
    ],
  },
  {
    id: 'P3',
    arrivalTime: 2,
    burstTime: 5,
    priority: 3,
    phases: [
      { type: 'cpu', duration: 3 },
      { type: 'io', duration: 1 },
      { type: 'cpu', duration: 2 },
    ],
  },
];

const PROCESS_STYLES: TimelineProcessStyles = {
  P1: {
    solid: 'bg-blue-600 dark:bg-blue-500',
    soft: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-900',
  },
  P2: {
    solid: 'bg-emerald-600 dark:bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  P3: {
    solid: 'bg-amber-500 dark:bg-amber-400',
    soft: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-900',
  },
};

export default function IoSchedulingSimulator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const result = useMemo(() => runIoRoundRobin(WORKLOAD, IO_RR_DEFAULT_QUANTUM), []);
  const steps = result.steps;
  const totalSteps = steps.length;
  const current = steps[currentStep] ?? steps[0];
  const resultEnd = result.cpuSegments[result.cpuSegments.length - 1]?.end ?? 1;
  const ioEnd = result.ioSegments[result.ioSegments.length - 1]?.end ?? 0;
  const totalTime = Math.max(resultEnd, ioEnd, 1);
  const isRunComplete = currentStep === totalSteps - 1 && totalSteps > 0;

  const remainingBursts = useMemo(
    () => calculateRemainingBursts(WORKLOAD, current.cpuSegments),
    [current.cpuSegments]
  );

  const handleNext = useCallback(() => {
    setCurrentStep((step) => {
      if (step < totalSteps - 1) return step + 1;
      setIsPlaying(false);
      return step;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((step) => (step > 0 ? step - 1 : step));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1600);
    return () => clearTimeout(timer);
  }, [currentStep, handleNext, isPlaying]);

  return (
    <section
      className="space-y-4 rounded-2xl border bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
      dir="rtl"
    >
      <div>
        <div className="mb-1 text-sm font-bold text-amber-700 dark:text-amber-300">
          תצוגת Timeline עם I/O
        </div>
        <h2 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
          Round Robin עם I/O — ציר זמן מלא
        </h2>
        <p className="m-0 mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          כל תהליך עובר בין שלבי CPU ו-I/O. ה-Scheduler לא יכול להריץ תהליך שממתין ל-I/O —
          הוא בוחר רק מהתהליכים שב-Ready Queue. עקוב אחרי המעברים בין השורות.
        </p>
      </div>

      <IoWorkloadStrip
        processes={WORKLOAD}
        processStyles={PROCESS_STYLES}
        quantum={IO_RR_DEFAULT_QUANTUM}
      />

      <IoAwareTimelineStrip
        cpuEntries={current.cpuSegments}
        ioEntries={current.ioSegments}
        totalTime={totalTime}
        currentTime={current.time}
        processStyles={PROCESS_STYLES}
        isRunComplete={isRunComplete}
      />

      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={currentStep > 0}
        canGoForward={currentStep < totalSteps - 1}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <TimelineCurrentEventPanel
          current={current}
          currentStep={currentStep}
          totalSteps={totalSteps}
        />
        <IoTimelineQueuePanel
          runningProcess={current.runningProcess}
          readyQueue={current.readyQueue}
          waitingProcesses={current.waitingProcesses}
          remainingBursts={remainingBursts}
          processStyles={PROCESS_STYLES}
          queueLanes={current.queues}
        />
      </div>

      <TimelineWorkloadSummary
        processes={WORKLOAD}
        metrics={result.metrics}
        averageWaitingTime={result.averageWaitingTime}
        averageTurnaroundTime={result.averageTurnaroundTime}
        averageResponseTime={result.averageResponseTime}
      />
    </section>
  );
}
