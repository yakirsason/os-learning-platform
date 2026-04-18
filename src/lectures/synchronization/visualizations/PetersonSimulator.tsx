import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  PETERSON_LINES_BY_PROCESS,
  PETERSON_SCENARIOS,
  PHASE_LABELS,
  getPetersonScenarioById,
  type PetersonLine,
  type PetersonPhase,
  type PetersonScenario,
  type PetersonState,
  type ProcessId,
} from '../lib/petersonScenarios';

const PHASE_TONE_CLASSES: Record<string, string> = {
  neutral:
    'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  progress:
    'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800',
  wait: 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700',
  critical:
    'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700',
};

interface SharedVarBoxProps {
  label: string;
  value: string;
  highlight: boolean;
  tone: 'flag-true' | 'flag-false' | 'turn';
}

function SharedVarBox({ label, value, highlight, tone }: SharedVarBoxProps) {
  const toneClass =
    tone === 'flag-true'
      ? 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100'
      : tone === 'flag-false'
        ? 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
        : 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100';
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border-2 px-3 py-2 transition-all',
        toneClass,
        highlight ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''
      )}
    >
      <div className="font-mono text-[10px] font-bold uppercase tracking-wide opacity-70" dir="ltr">
        {label}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={`${label}-${value}`}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.18 }}
          className="font-mono text-base font-bold"
          dir="ltr"
        >
          {value}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

interface ProcessColumnProps {
  pid: ProcessId;
  phase: PetersonPhase;
  active: boolean;
  activeLine: PetersonLine | null;
}

function ProcessColumn({ pid, phase, active, activeLine }: ProcessColumnProps) {
  const lines = PETERSON_LINES_BY_PROCESS[pid];
  const phaseLabel = PHASE_LABELS[phase];
  const headerColor =
    pid === 0
      ? 'text-blue-700 dark:text-blue-300'
      : 'text-violet-700 dark:text-violet-300';
  const borderColor =
    pid === 0
      ? 'border-blue-300 dark:border-blue-800'
      : 'border-violet-300 dark:border-violet-800';
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg border bg-white p-3 transition-shadow dark:bg-slate-950',
        borderColor,
        active ? 'shadow-md ring-1 ring-blue-400 dark:ring-blue-700' : 'opacity-95'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={cn('font-mono text-sm font-bold', headerColor)} dir="ltr">
          P{pid}
        </div>
        <div
          className={cn(
            'rounded-full border px-2 py-0.5 text-[10px] font-bold',
            PHASE_TONE_CLASSES[phaseLabel.tone]
          )}
        >
          {phaseLabel.hebrew}
        </div>
      </div>
      <ol className="m-0 list-none space-y-1 p-0" dir="ltr">
        {lines.map((line, idx) => {
          const lineNum = idx + 1; // 1..5
          // השורה הרביעית היא הערה ("// critical section")
          const isComment = lineNum === 4;
          const isActive =
            activeLine !== null &&
            ((activeLine === 0 && isComment) || activeLine === lineNum);
          return (
            <li
              key={`p${pid}-line-${idx}`}
              className={cn(
                'rounded px-2 py-1 font-mono text-[11px] transition-colors',
                isActive
                  ? pid === 0
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900/50 dark:text-blue-100'
                    : 'bg-violet-100 text-violet-900 dark:bg-violet-900/50 dark:text-violet-100'
                  : isComment
                    ? 'text-slate-400 dark:text-slate-500'
                    : 'text-slate-600 dark:text-slate-400'
              )}
            >
              <span className="me-2 text-[10px] opacity-50">{idx + 1}.</span>
              {line}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function PetersonSimulator() {
  const [scenarioId, setScenarioId] = useState<string>(PETERSON_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: PetersonScenario = useMemo(
    () => getPetersonScenarioById(scenarioId),
    [scenarioId]
  );
  const totalSteps = scenario.steps.length;

  const state: PetersonState = useMemo(() => {
    if (stepIndex < 0) return scenario.initial;
    return scenario.steps[stepIndex].state;
  }, [scenario, stepIndex]);

  const currentStep = stepIndex >= 0 ? scenario.steps[stepIndex] : null;
  const previousStep = stepIndex > 0 ? scenario.steps[stepIndex - 1] : null;
  const previousState = previousStep ? previousStep.state : scenario.initial;

  const flag0Changed =
    currentStep !== null && previousState.flag[0] !== state.flag[0];
  const flag1Changed =
    currentStep !== null && previousState.flag[1] !== state.flag[1];
  const turnChanged = currentStep !== null && previousState.turn !== state.turn;

  const activeLineP0 = currentStep && currentStep.actor === 0 ? currentStep.line : null;
  const activeLineP1 = currentStep && currentStep.actor === 1 ? currentStep.line : null;

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
    const timer = setTimeout(handleNext, 1700);
    return () => clearTimeout(timer);
  }, [stepIndex, isPlaying, handleNext]);

  const isFinalStep = stepIndex === totalSteps - 1;

  return (
    <div className="w-full min-w-0 space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">תרחיש:</span>
        {PETERSON_SCENARIOS.map((s) => {
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

      <div className="rounded-lg border bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          משתנים משותפים
        </div>
        <div className="grid grid-cols-3 gap-2">
          <SharedVarBox
            label="flag[0]"
            value={state.flag[0] ? 'true' : 'false'}
            highlight={flag0Changed}
            tone={state.flag[0] ? 'flag-true' : 'flag-false'}
          />
          <SharedVarBox
            label="flag[1]"
            value={state.flag[1] ? 'true' : 'false'}
            highlight={flag1Changed}
            tone={state.flag[1] ? 'flag-true' : 'flag-false'}
          />
          <SharedVarBox
            label="turn"
            value={String(state.turn)}
            highlight={turnChanged}
            tone="turn"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ProcessColumn
          pid={0}
          phase={state.p0Phase}
          active={currentStep?.actor === 0}
          activeLine={activeLineP0}
        />
        <ProcessColumn
          pid={1}
          phase={state.p1Phase}
          active={currentStep?.actor === 1}
          activeLine={activeLineP1}
        />
      </div>

      <div className="rounded-md border bg-muted p-3 text-sm leading-relaxed">
        {currentStep ? (
          <>
            <div className="mb-1 flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                צעד {stepIndex + 1} מתוך {totalSteps}
              </span>
              <span
                className={cn(
                  'rounded px-2 py-0.5 font-mono text-[11px] font-bold',
                  currentStep.actor === 0
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                    : 'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-200'
                )}
                dir="ltr"
              >
                P{currentStep.actor} · {currentStep.action}
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
            לחצו "הבא" כדי להתחיל. שני הדגלים מתחילים false ו-turn מתחיל ב-0. שני התהליכים ב-remainder.
          </span>
        )}
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
