import { useCallback, useEffect, useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import StepController from '@/components/common/StepController';
import {
  MLQ_LEVELS,
  MLQ_WORKLOAD,
  runMlq,
} from '../lib/mlqScheduling';
import AlgorithmTimelineStrip from './timeline/AlgorithmTimelineStrip';
import MultiQueuePanel from './timeline/MultiQueuePanel';
import TimelineCurrentEventPanel from './timeline/TimelineCurrentEventPanel';
import TimelineWorkloadSummary from './timeline/TimelineWorkloadSummary';
import {
  calculateRemainingBursts,
  type TimelineProcessStyles,
} from './timeline/timelineTypes';

const PROCESS_STYLES: TimelineProcessStyles = {
  P1: {
    solid: 'bg-blue-600 dark:bg-blue-500',
    soft: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-200',
    border: 'border-blue-200 dark:border-blue-900',
  },
  P2: {
    solid: 'bg-violet-600 dark:bg-violet-500',
    soft: 'bg-violet-50 dark:bg-violet-950/30',
    text: 'text-violet-700 dark:text-violet-200',
    border: 'border-violet-200 dark:border-violet-900',
  },
  P3: {
    solid: 'bg-emerald-600 dark:bg-emerald-500',
    soft: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-200',
    border: 'border-emerald-200 dark:border-emerald-900',
  },
  P4: {
    solid: 'bg-amber-500 dark:bg-amber-400',
    soft: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-200',
    border: 'border-amber-200 dark:border-amber-900',
  },
};

export default function MlqSimulator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const result = useMemo(() => runMlq(MLQ_WORKLOAD, MLQ_LEVELS), []);
  const steps = result.steps;
  const totalSteps = steps.length;
  const current = steps[currentStep] ?? steps[0];
  const resultEnd = result.cpuSegments[result.cpuSegments.length - 1]?.end ?? 1;
  const totalTime = Math.max(resultEnd, 1);

  const remainingBursts = useMemo(
    () => calculateRemainingBursts(MLQ_WORKLOAD, current.cpuSegments),
    [current.cpuSegments]
  );

  const runningQueueId = useMemo(() => {
    if (!current.runningProcess) return undefined;
    const p = MLQ_WORKLOAD.find((x) => x.id === current.runningProcess);
    return p?.initialQueueId;
  }, [current.runningProcess]);

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
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(handleNext, 1600);
    return () => clearTimeout(t);
  }, [currentStep, handleNext, isPlaying]);

  return (
    <section
      className="space-y-4 rounded-2xl border bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
      dir="rtl"
    >
      <div>
        <div className="mb-1 text-sm font-bold text-rose-700 dark:text-rose-300">
          תצוגת Timeline: MLQ
        </div>
        <h2 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
          Multilevel Queue — Foreground / Background
        </h2>
        <p className="m-0 mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          כל תהליך מוקצה לתור <strong>קבוע</strong>. Foreground מקבל עדיפות גבוהה
          יותר ורץ עם Round Robin. Background רץ רק כשה-Foreground ריק, לפי FCFS.
        </p>
      </div>

      <section className="rounded-xl border bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="m-0 text-base font-bold text-slate-950 dark:text-slate-50">
            נתוני השאלה
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            הקצאה קבועה לתורים
          </span>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {MLQ_WORKLOAD.map((p) => {
            const level = MLQ_LEVELS.find((l) => l.id === p.initialQueueId);
            const style = PROCESS_STYLES[p.id];
            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-lg border p-2 text-xs',
                  style?.soft ?? 'bg-slate-50',
                  style?.border ?? 'border-slate-200'
                )}
              >
                <div className="mb-1.5 flex items-center gap-2">
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold text-white',
                      style?.solid ?? 'bg-slate-500'
                    )}
                  >
                    {p.id}
                  </div>
                  <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                    {level?.title ?? p.initialQueueId}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1 text-center text-slate-700 dark:text-slate-200">
                  <div>
                    <div className="font-mono font-bold">{p.arrivalTime}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      הגעה
                    </div>
                  </div>
                  <div>
                    <div className="font-mono font-bold">{p.burstTime}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                      burst
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

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
        <MultiQueuePanel
          runningProcess={current.runningProcess}
          runningQueueId={runningQueueId}
          queues={current.queues}
          remainingBursts={remainingBursts}
          processStyles={PROCESS_STYLES}
        />
      </div>

      <TimelineWorkloadSummary
        processes={MLQ_WORKLOAD}
        metrics={result.metrics}
        averageWaitingTime={result.averageWaitingTime}
        averageTurnaroundTime={result.averageTurnaroundTime}
        averageResponseTime={result.averageResponseTime}
      />
    </section>
  );
}
