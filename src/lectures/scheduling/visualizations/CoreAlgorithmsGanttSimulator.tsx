import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import StepController from '@/components/common/StepController';
import { runCoreSchedulingAlgorithm } from '../lib/coreSchedulingAlgorithms';
import type { CoreSchedulingAlgorithm, SchedulingProcess } from '../lib/schedulingTypes';
import AlgorithmTimelineStrip from './timeline/AlgorithmTimelineStrip';
import TimelineCurrentEventPanel from './timeline/TimelineCurrentEventPanel';
import TimelineQueuePanel from './timeline/TimelineQueuePanel';
import TimelineWorkloadSummary from './timeline/TimelineWorkloadSummary';
import TimelineWorkloadStrip from './timeline/TimelineWorkloadStrip';
import {
  calculateRemainingBursts,
  type TimelineProcessStyles,
} from './timeline/timelineTypes';

interface CoreAlgorithmsGanttSimulatorProps {
  initialAlgorithm?: CoreSchedulingAlgorithm;
  availableAlgorithms?: CoreSchedulingAlgorithm[];
}

interface AlgorithmOption {
  id: CoreSchedulingAlgorithm;
  label: string;
  note: string;
  modeLabel: string;
  focusIntro: string;
}

const WORKLOAD: SchedulingProcess[] = [
  { id: 'P1', arrivalTime: 0, burstTime: 8, priority: 3 },
  { id: 'P2', arrivalTime: 1, burstTime: 4, priority: 1 },
  { id: 'P3', arrivalTime: 2, burstTime: 2, priority: 4 },
  { id: 'P4', arrivalTime: 3, burstTime: 1, priority: 2 },
];

const ALGORITHMS: AlgorithmOption[] = [
  {
    id: 'fcfs',
    label: 'FCFS',
    note: 'סדר הגעה בלבד',
    modeLabel: 'Nonpreemptive',
    focusIntro:
      'ב-FCFS מסתכלים על סדר ההגעה. ברגע שתהליך קיבל CPU, הוא ממשיך עד סיום ה-burst.',
  },
  {
    id: 'sjf',
    label: 'SJF',
    note: 'ה-burst הקצר ביותר',
    modeLabel: 'Nonpreemptive',
    focusIntro:
      'ב-SJF nonpreemptive בוחרים את ה-burst הקצר ביותר מבין המוכנים, ואז נותנים לו לרוץ עד הסוף.',
  },
  {
    id: 'srtf',
    label: 'SRTF',
    note: 'הזמן שנותר הקצר ביותר',
    modeLabel: 'Preemptive',
    focusIntro:
      'ב-SRTF בודקים בכל נקודת זמן אם הגיע תהליך עם זמן שנותר קצר יותר, ולכן preemption יכול לקרות.',
  },
  {
    id: 'priority',
    label: 'Priority',
    note: 'מספר קטן = עדיפות גבוהה',
    modeLabel: 'Preemptive בדמו הזה',
    focusIntro:
      'בדמו הזה Priority מוצג כגרסה preemptive: תהליך עם מספר עדיפות קטן יותר יכול לעצור את מי שרץ.',
  },
  {
    id: 'round-robin',
    label: 'Round Robin',
    note: 'quantum ואז חזרה לסוף התור',
    modeLabel: 'Preemptive',
    focusIntro:
      'ב-Round Robin כל תהליך מקבל quantum. אם הוא לא מסיים, ה-timer עוצר אותו והוא חוזר לסוף התור.',
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
  P4: {
    solid: 'bg-violet-600 dark:bg-violet-500',
    soft: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-200',
    border: 'border-violet-200 dark:border-violet-900',
  },
};

function getTotalTime(resultEnd: number): number {
  return Math.max(resultEnd, 1);
}

export default function CoreAlgorithmsGanttSimulator({
  initialAlgorithm = 'fcfs',
  availableAlgorithms = [initialAlgorithm],
}: CoreAlgorithmsGanttSimulatorProps) {
  const [algorithm, setAlgorithm] = useState<CoreSchedulingAlgorithm>(initialAlgorithm);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const result = useMemo(
    () => runCoreSchedulingAlgorithm(algorithm, WORKLOAD),
    [algorithm]
  );
  const visibleAlgorithms = useMemo(
    () => ALGORITHMS.filter((option) => availableAlgorithms.includes(option.id)),
    [availableAlgorithms]
  );
  const activeOption =
    ALGORITHMS.find((option) => option.id === algorithm) ?? ALGORITHMS[0];
  const canSwitchAlgorithms = visibleAlgorithms.length > 1;

  const steps = useMemo(() => result.steps, [result.steps]);
  const totalSteps = steps.length;
  const current = steps[currentStep] ?? steps[0];
  const resultEnd = result.cpuSegments[result.cpuSegments.length - 1]?.end ?? 1;
  const totalTime = useMemo(() => getTotalTime(resultEnd), [resultEnd]);
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
    setAlgorithm(initialAlgorithm);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [initialAlgorithm]);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  const handleAlgorithmChange = useCallback((nextAlgorithm: CoreSchedulingAlgorithm) => {
    setAlgorithm(nextAlgorithm);
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
        <div className="mb-1 text-sm font-bold text-blue-700 dark:text-blue-300">
          תצוגת Timeline לפתרון שאלות
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
            {canSwitchAlgorithms
              ? 'השוואת אלגוריתמים על אותו עומס עבודה'
              : `ציר זמן של ${activeOption.label}`}
          </h2>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200">
            {activeOption.modeLabel}
          </span>
        </div>
        <p className="m-0 mt-2 max-w-4xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {canSwitchAlgorithms
            ? 'במצב השוואה מחליפים אלגוריתם ורואים איך אותו עומס עבודה יוצר ציר זמן אחר.'
            : activeOption.focusIntro}
        </p>
      </div>

      {canSwitchAlgorithms ? (
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          {visibleAlgorithms.map((option) => {
            const isActive = option.id === algorithm;
            return (
              <Button
                key={option.id}
                type="button"
                variant={isActive ? 'default' : 'outline'}
                className="h-auto justify-start whitespace-normal p-3 text-start"
                onClick={() => handleAlgorithmChange(option.id)}
              >
                <span>
                  <span className="block font-semibold">{option.label}</span>
                  <span className="block text-xs opacity-80">{option.note}</span>
                </span>
              </Button>
            );
          })}
        </div>
      ) : null}

      <TimelineWorkloadStrip processes={WORKLOAD} processStyles={PROCESS_STYLES} />

      <AlgorithmTimelineStrip
        entries={current.cpuSegments}
        totalTime={totalTime}
        currentTime={current.time}
        processStyles={PROCESS_STYLES}
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
        <TimelineQueuePanel
          runningProcess={current.runningProcess}
          readyQueue={current.readyQueue}
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
