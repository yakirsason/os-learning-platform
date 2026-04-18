import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, CheckCircle2 } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  PROCESS_STATE_LABELS,
  SEMAPHORE_SCENARIOS,
  getSemaphoreScenarioById,
  type ActionType,
  type ProcessState,
  type SemaphoreScenario,
  type SemaphoreState,
} from '../lib/semaphoreScenarios';

const PROCESS_STATE_STYLES: Record<ProcessState, string> = {
  ready: 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300',
  critical:
    'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100',
  blocked:
    'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100',
  done: 'border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-500',
};

interface SemaphoreBoxProps {
  value: number;
  queue: string[];
  highlight: boolean;
}

function SemaphoreBox({ value, queue, highlight }: SemaphoreBoxProps) {
  const valueClass =
    value > 0
      ? 'text-emerald-700 dark:text-emerald-300'
      : value === 0
        ? 'text-slate-700 dark:text-slate-200'
        : 'text-amber-700 dark:text-amber-300';
  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-white p-3 transition-all dark:bg-slate-950',
        value < 0
          ? 'border-amber-400 dark:border-amber-700'
          : 'border-blue-400 dark:border-blue-700',
        highlight ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center justify-center rounded-md border bg-slate-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-900">
          <div className="font-mono text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            S.value
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={`semval-${value}`}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className={cn('font-mono text-3xl font-bold', valueClass)}
              dir="ltr"
            >
              {value}
            </motion.div>
          </AnimatePresence>
          {value < 0 ? (
            <div className="mt-0.5 text-[9px] text-amber-700 dark:text-amber-400">
              {Math.abs(value)} בתור
            </div>
          ) : null}
        </div>
        <div className="min-w-0">
          <div className="mb-1 flex items-center justify-between">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
              תור הסמאפור (FIFO)
            </div>
            <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400" dir="ltr">
              S.list
            </div>
          </div>
          <div
            className={cn(
              'flex min-h-[44px] items-center gap-1.5 rounded-md border-2 border-dashed p-1.5',
              queue.length === 0
                ? 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/40'
                : 'border-amber-300 bg-amber-50/60 dark:border-amber-800 dark:bg-amber-950/20'
            )}
            dir="ltr"
          >
            <AnimatePresence initial={false}>
              {queue.length === 0 ? (
                <motion.span
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="px-2 text-[10px] italic text-slate-400 dark:text-slate-500"
                  dir="rtl"
                >
                  ריק
                </motion.span>
              ) : (
                queue.map((pid, idx) => (
                  <motion.div
                    key={pid}
                    layout
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 rounded border-2 border-amber-400 bg-white px-2 py-1 font-mono text-xs font-bold text-amber-900 shadow-sm dark:border-amber-700 dark:bg-slate-950 dark:text-amber-100"
                  >
                    {idx === 0 ? (
                      <span className="text-[9px] opacity-70" dir="rtl">
                        ראש →
                      </span>
                    ) : null}
                    {pid}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ProcessRowProps {
  pid: string;
  state: ProcessState;
  active: boolean;
  woke: boolean;
}

function ProcessRow({ pid, state, active, woke }: ProcessRowProps) {
  const label = PROCESS_STATE_LABELS[state];
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md border-2 px-3 py-2 transition-all',
        PROCESS_STATE_STYLES[state],
        active ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : '',
        woke ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-950' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm font-bold" dir="ltr">
          {pid}
        </span>
        {woke ? (
          <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
            התעורר
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold">{label.hebrew}</span>
        <span className="font-mono text-[9px] opacity-70" dir="ltr">
          {label.english}
        </span>
      </div>
    </div>
  );
}

const ACTION_BADGE: Record<ActionType, { label: string; class: string; Icon: typeof ArrowDownToLine }> = {
  wait: {
    label: 'wait()',
    class: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
    Icon: ArrowDownToLine,
  },
  signal: {
    label: 'signal()',
    class: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200',
    Icon: ArrowUpFromLine,
  },
  enter: {
    label: 'enter',
    class: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200',
    Icon: ArrowDownToLine,
  },
};

export default function SemaphoreSimulator() {
  const [scenarioId, setScenarioId] = useState<string>(SEMAPHORE_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: SemaphoreScenario = useMemo(
    () => getSemaphoreScenarioById(scenarioId),
    [scenarioId]
  );
  const totalSteps = scenario.steps.length;

  const state: SemaphoreState = useMemo(() => {
    if (stepIndex < 0) return scenario.initial;
    return scenario.steps[stepIndex].state;
  }, [scenario, stepIndex]);

  const currentStep = stepIndex >= 0 ? scenario.steps[stepIndex] : null;
  const previousState = useMemo(() => {
    if (stepIndex <= 0) return scenario.initial;
    return scenario.steps[stepIndex - 1].state;
  }, [scenario, stepIndex]);

  const semaphoreChanged =
    currentStep !== null &&
    (previousState.semaphore.value !== state.semaphore.value ||
      previousState.semaphore.queue.length !== state.semaphore.queue.length);

  const handleNext = useCallback(() => {
    setStepIndex((idx) => {
      if (idx < totalSteps - 1) return idx + 1;
      setIsPlaying(false);
      return idx;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setStepIndex((idx) => (idx > -1 ? idx - 1 : idx));
  }, []);

  const handleReset = useCallback(() => {
    setStepIndex(-1);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleScenarioChange = useCallback((id: string) => {
    setScenarioId(id);
    setStepIndex(-1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1800);
    return () => clearTimeout(timer);
  }, [stepIndex, isPlaying, handleNext]);

  const isFinalStep = stepIndex === totalSteps - 1;
  const actionBadge = currentStep ? ACTION_BADGE[currentStep.actionType] : null;

  return (
    <div className="w-full min-w-0 space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">תרחיש:</span>
        {SEMAPHORE_SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleScenarioChange(s.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800'
              )}
            >
              {s.title}
            </button>
          );
        })}
      </div>

      <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        {scenario.subtitle}
      </p>

      <SemaphoreBox
        value={state.semaphore.value}
        queue={state.semaphore.queue}
        highlight={semaphoreChanged}
      />

      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          תהליכים
        </div>
        <div className="space-y-2">
          {scenario.participants.map((pid) => (
            <ProcessRow
              key={pid}
              pid={pid}
              state={state.processes[pid] ?? 'ready'}
              active={currentStep?.actor === pid}
              woke={currentStep?.wokeUp === pid}
            />
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-muted p-3 text-sm leading-relaxed">
        {currentStep && actionBadge ? (
          <>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                צעד {stepIndex + 1} מתוך {totalSteps}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-bold',
                  actionBadge.class
                )}
                dir="ltr"
              >
                <actionBadge.Icon className="h-3 w-3" />
                {currentStep.action}
              </span>
            </div>
            <div className="text-slate-800 dark:text-slate-100">{currentStep.explanation}</div>
            {currentStep.note ? (
              <div className="mt-2 flex gap-2 text-slate-700 dark:text-slate-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span className="text-xs">{currentStep.note}</span>
              </div>
            ) : null}
            {isFinalStep ? (
              <div className="mt-3 flex items-start gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-2 dark:border-emerald-800 dark:bg-emerald-950/30">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <span className="text-sm text-slate-800 dark:text-slate-100">
                  {scenario.conclusion}
                </span>
              </div>
            ) : null}
          </>
        ) : (
          <span className="text-slate-700 dark:text-slate-200">
            לחצו "הבא" כדי להתחיל. ערך התחלתי: {scenario.initialValue}. כל התהליכים מוכנים.
          </span>
        )}
      </div>

      <div className="rounded-md border border-violet-200 bg-violet-50 p-3 text-xs leading-relaxed dark:border-violet-900 dark:bg-violet-950/30">
        <div className="mb-1 font-bold text-violet-800 dark:text-violet-300">
          השוואה: blocking מול busy waiting
        </div>
        <p className="m-0 text-slate-700 dark:text-slate-200">
          ההדמיה משתמשת ב-<strong>blocking</strong>: ערך שלילי = יש בתור, התהליכים לא מבזבזים CPU.
          במימוש <strong>busy waiting</strong> (spinlock) הערך לעולם לא יורד מתחת ל-0,
          אין תור, ותהליך שמחכה רץ בלולאה ובוזבז CPU עד שהערך יחזור להיות חיובי.
        </p>
      </div>

      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={stepIndex > -1}
        canGoForward={stepIndex < totalSteps - 1}
      />
    </div>
  );
}
