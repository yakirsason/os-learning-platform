import { useCallback, useEffect, useMemo, useState } from 'react';
import StepController from '@/components/common/StepController';
import {
  MLFQ_LEVELS,
  MLFQ_WORKLOAD,
  runMlfq,
} from '../lib/mlfqScheduling';
import {
  SCHEDULING_PRESETS_BY_ID,
  getPresetsForAlgorithm,
} from '../lib/schedulingPresets';
import IoAwareTimelineStrip from './timeline/IoAwareTimelineStrip';
import IoWorkloadStrip from './timeline/IoWorkloadStrip';
import MultiQueuePanel from './timeline/MultiQueuePanel';
import PresetSelector from './timeline/PresetSelector';
import TimelineCurrentEventPanel from './timeline/TimelineCurrentEventPanel';
import TimelineWorkloadSummary from './timeline/TimelineWorkloadSummary';
import {
  calculateRemainingBursts,
  computeProcessStyles,
} from './timeline/timelineTypes';

const AVAILABLE_PRESETS = getPresetsForAlgorithm('mlfq');

export default function MlfqSimulator() {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const preset = selectedPresetId
    ? SCHEDULING_PRESETS_BY_ID[selectedPresetId] ?? null
    : null;

  const workload = preset?.processes ?? MLFQ_WORKLOAD;
  const levels = preset?.mlfqLevels ?? MLFQ_LEVELS;
  const preemptive = preset?.mlfqPreemptive ?? true;
  const processStyles = useMemo(
    () => computeProcessStyles(workload),
    [workload]
  );

  const result = useMemo(
    () => runMlfq(workload, levels, { preemptive }),
    [workload, levels, preemptive]
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

  const runningQueueId = useMemo(() => {
    if (!current.runningProcess) return undefined;
    if (current.event.queueId) return current.event.queueId;
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

  const handlePresetChange = useCallback((id: string | null) => {
    setSelectedPresetId(id);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const t = setTimeout(handleNext, 1600);
    return () => clearTimeout(t);
  }, [currentStep, handleNext, isPlaying]);

  const rulesText = useMemo(() => {
    const quanta = levels.map((l) => `${l.id.toUpperCase()} q=${l.quantum}`).join(', ');
    return `${quanta} · ${preemptive ? 'preemptive' : 'non-preemptive'}`;
  }, [levels, preemptive]);

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
          Multilevel Feedback Queue
        </h2>
        <p className="m-0 mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          תהליך חדש נכנס ל-<strong>התור העליון</strong>. אם הוא מנצל את כל
          ה-quantum בלי לסיים, הוא <strong>יורד</strong> לתור נמוך יותר.
          {preemptive
            ? ' תור גבוה יותר עוצר את מי שרץ בתור נמוך (preemption).'
            : ' בפריסט הזה ההרצה היא non-preemptive — תהליך שרץ לא נעצר גם אם מגיע תהליך לתור גבוה יותר.'}
        </p>
      </div>

      <PresetSelector
        presets={AVAILABLE_PRESETS}
        selectedId={selectedPresetId}
        onSelect={handlePresetChange}
      />

      <section className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm dark:border-rose-900 dark:bg-rose-950/20">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <div className="font-bold text-rose-900 dark:text-rose-200">
            כללי ההרצה הפעילים
          </div>
          <span className="rounded bg-white/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-rose-800 dark:bg-rose-900/40 dark:text-rose-200">
            {rulesText}
          </span>
        </div>
        <ul className="m-0 space-y-0.5 ps-5 text-rose-800 dark:text-rose-300">
          <li>תהליך חדש נכנס לראש התור העליון</li>
          <li>סיום quantum מלא בלי גמר פאזת CPU → ירידה לתור הבא</li>
          <li>
            I/O לפני סוף ה-quantum → התהליך <strong>לא</strong> יורד, וחוזר לאותה רמה אחרי ה-I/O
          </li>
          <li>
            {preemptive
              ? 'תור גבוה יותר עוצר את מי שרץ בתור נמוך'
              : 'אין preemption בין תורים בגרסה הזאת'}
          </li>
          <li>אין כאן promotion (aging) — תהליך לא חוזר מעצמו לתור גבוה יותר</li>
        </ul>
      </section>

      <IoWorkloadStrip
        processes={workload}
        processStyles={processStyles}
        rightBadge={`רמות: ${levels.length}`}
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
        <MultiQueuePanel
          runningProcess={current.runningProcess}
          runningQueueId={runningQueueId}
          queues={current.queues}
          waitingProcesses={current.waitingProcesses}
          remainingBursts={remainingBursts}
          processStyles={processStyles}
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
