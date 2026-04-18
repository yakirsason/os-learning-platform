import { useCallback, useEffect, useMemo, useState } from 'react';
import StepController from '@/components/common/StepController';
import { IO_RR_DEFAULT_QUANTUM, runIoRoundRobin } from '../lib/ioRoundRobinScheduling';
import {
  SCHEDULING_PRESETS_BY_ID,
  getPresetsForAlgorithm,
} from '../lib/schedulingPresets';
import type { SchedulingProcess } from '../lib/schedulingTypes';
import IoAwareTimelineStrip from './timeline/IoAwareTimelineStrip';
import IoTimelineQueuePanel from './timeline/IoTimelineQueuePanel';
import IoWorkloadStrip from './timeline/IoWorkloadStrip';
import PresetSelector from './timeline/PresetSelector';
import TimelineCurrentEventPanel from './timeline/TimelineCurrentEventPanel';
import TimelineWorkloadSummary from './timeline/TimelineWorkloadSummary';
import {
  calculateRemainingBursts,
  computeProcessStyles,
} from './timeline/timelineTypes';

const DEMO_WORKLOAD: SchedulingProcess[] = [
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

const AVAILABLE_PRESETS = getPresetsForAlgorithm('io-round-robin');

export default function IoSchedulingSimulator() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const preset = selectedPresetId
    ? SCHEDULING_PRESETS_BY_ID[selectedPresetId] ?? null
    : null;
  const workload = preset?.processes ?? DEMO_WORKLOAD;
  const quantum = preset?.roundRobinQuantum ?? IO_RR_DEFAULT_QUANTUM;
  const processStyles = useMemo(
    () => computeProcessStyles(workload),
    [workload]
  );

  const result = useMemo(
    () => runIoRoundRobin(workload, quantum),
    [workload, quantum]
  );
  const steps = result.steps;
  const totalSteps = steps.length;
  const current = steps[currentStep] ?? steps[0];
  const resultEnd = result.cpuSegments[result.cpuSegments.length - 1]?.end ?? 1;
  const ioEnd = result.ioSegments[result.ioSegments.length - 1]?.end ?? 0;
  const totalTime = Math.max(resultEnd, ioEnd, 1);
  const isRunComplete = currentStep === totalSteps - 1 && totalSteps > 0;

  const remainingBursts = useMemo(
    () => calculateRemainingBursts(workload, current.cpuSegments),
    [workload, current.cpuSegments]
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

  const handlePresetChange = useCallback((id: string | null) => {
    setSelectedPresetId(id);
    setCurrentStep(0);
    setIsPlaying(false);
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

      <PresetSelector
        presets={AVAILABLE_PRESETS}
        selectedId={selectedPresetId}
        onSelect={handlePresetChange}
      />

      <IoWorkloadStrip
        processes={workload}
        processStyles={processStyles}
        quantum={quantum}
      />

      <IoAwareTimelineStrip
        cpuEntries={current.cpuSegments}
        ioEntries={current.ioSegments}
        totalTime={totalTime}
        currentTime={current.time}
        processStyles={processStyles}
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
          processStyles={processStyles}
          queueLanes={current.queues}
        />
      </div>

      <TimelineWorkloadSummary
        processes={workload}
        metrics={result.metrics}
        averageWaitingTime={result.averageWaitingTime}
        averageTurnaroundTime={result.averageTurnaroundTime}
        averageResponseTime={result.averageResponseTime}
      />
    </section>
  );
}
