import { useCallback, useEffect, useMemo, useState } from 'react';
import StepController from '@/components/common/StepController';
import {
  MLFQ_LEVELS,
  MLFQ_WORKLOAD,
  runMlfq,
} from '../lib/mlfqScheduling';
import AlgorithmTimelineStrip from './timeline/AlgorithmTimelineStrip';
import MultiQueuePanel from './timeline/MultiQueuePanel';
import TimelineCurrentEventPanel from './timeline/TimelineCurrentEventPanel';
import TimelineWorkloadStrip from './timeline/TimelineWorkloadStrip';
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

export default function MlfqSimulator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const result = useMemo(() => runMlfq(MLFQ_WORKLOAD, MLFQ_LEVELS), []);
  const steps = result.steps;
  const totalSteps = steps.length;
  const current = steps[currentStep] ?? steps[0];
  const resultEnd = result.cpuSegments[result.cpuSegments.length - 1]?.end ?? 1;
  const totalTime = Math.max(resultEnd, 1);

  const remainingBursts = useMemo(
    () => calculateRemainingBursts(MLFQ_WORKLOAD, current.cpuSegments),
    [current.cpuSegments]
  );

  const runningQueueId = useMemo(() => {
    if (!current.runningProcess) return undefined;
    // On dispatch steps the event carries the source queue id
    if (current.event.queueId) return current.event.queueId;
    // Fallback: last CPU segment for this process
    const lastSeg = current.cpuSegments
      .filter((s) => s.processId === current.runningProcess)
      .pop();
    return lastSeg?.queueId;
  }, [current.event.queueId, current.runningProcess, current.cpuSegments]);

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
          תצוגת Timeline: MLFQ
        </div>
        <h2 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
          Multilevel Feedback Queue — Q1 / Q2 / Q3
        </h2>
        <p className="m-0 mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          תהליך חדש נכנס ל-<strong>Q1</strong>. אם הוא מנצל את כל ה-quantum בלי
          לסיים, הוא <strong>יורד</strong> לתור נמוך יותר. תור גבוה יותר עוצר
          את מי שרץ בתור נמוך (preemption).
        </p>
      </div>

      <section className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/20">
        <div className="mb-1 font-bold text-rose-900 dark:text-rose-200">
          כללי MLFQ בהדמיה הזאת
        </div>
        <ul className="m-0 space-y-0.5 ps-5 text-rose-800 dark:text-rose-300">
          <li>Q1 quantum = 2, Q2 quantum = 4, Q3 quantum = 8</li>
          <li>תהליך חדש נכנס לראש Q1</li>
          <li>סיום quantum בלי גמר → ירידה לתור הבא</li>
          <li>תור גבוה יותר עוצר את מי שרץ בתור נמוך</li>
          <li>
            אין כאן promotion (aging) — תהליך לא חוזר לתור גבוה יותר בגל הזה
          </li>
        </ul>
      </section>

      <TimelineWorkloadStrip
        processes={MLFQ_WORKLOAD}
        processStyles={PROCESS_STYLES}
      />

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
        processes={MLFQ_WORKLOAD}
        metrics={result.metrics}
        averageWaitingTime={result.averageWaitingTime}
        averageTurnaroundTime={result.averageTurnaroundTime}
        averageResponseTime={result.averageResponseTime}
      />
    </section>
  );
}
