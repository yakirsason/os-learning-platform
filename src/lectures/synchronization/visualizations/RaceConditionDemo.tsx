import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  CONSUMER_CODE,
  PRODUCER_CODE,
  RACE_SCENARIOS,
  getScenarioById,
  type Actor,
  type InterleavingScenario,
  type MachineState,
} from '../lib/raceConditionScenarios';

const INITIAL_STATE: MachineState = { counter: 5, r1: null, r2: null };

interface RegisterCellProps {
  label: string;
  value: number | null;
  active: boolean;
  accent: 'producer' | 'consumer';
}

function RegisterCell({ label, value, active, accent }: RegisterCellProps) {
  const accentClass =
    accent === 'producer'
      ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100'
      : 'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-100';
  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md border px-3 py-2 transition-all',
        accentClass,
        active ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-slate-950' : ''
      )}
    >
      <span className="font-mono text-xs font-bold" dir="ltr">
        {label}
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={`${label}-${value ?? 'empty'}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          className="font-mono text-base font-bold"
          dir="ltr"
        >
          {value === null ? '—' : value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

interface CodePanelProps {
  title: string;
  code: string[];
  activeLine: number | null;
  variant: Actor;
  active: boolean;
}

function CodePanel({ title, code, activeLine, variant, active }: CodePanelProps) {
  const headerColor =
    variant === 'producer'
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-amber-700 dark:text-amber-300';
  const borderColor =
    variant === 'producer'
      ? 'border-emerald-300 dark:border-emerald-800'
      : 'border-amber-300 dark:border-amber-800';
  const lineHighlight =
    variant === 'producer'
      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100'
      : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100';
  return (
    <div
      className={cn(
        'rounded-lg border bg-white p-3 transition-shadow dark:bg-slate-950',
        borderColor,
        active ? 'shadow-md' : 'opacity-90'
      )}
    >
      <div className={cn('mb-2 text-xs font-bold uppercase tracking-wide', headerColor)}>
        {title}
      </div>
      <ol className="m-0 list-none space-y-1 p-0" dir="ltr">
        {code.map((line, idx) => {
          const isActive = activeLine === idx;
          return (
            <li
              key={`${title}-${idx}`}
              className={cn(
                'rounded px-2 py-1 font-mono text-xs transition-colors',
                isActive
                  ? lineHighlight
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

interface TimelineStripProps {
  steps: { actor: Actor; code: string }[];
  currentIndex: number;
}

function TimelineStrip({ steps, currentIndex }: TimelineStripProps) {
  return (
    <div className="w-full min-w-0 max-w-full overflow-x-auto" dir="ltr">
      <div className="inline-flex gap-1 pb-1">
        {steps.map((step, idx) => {
          const isActive = idx === currentIndex;
          const wasExecuted = idx <= currentIndex;
          const actorColor =
            step.actor === 'producer'
              ? wasExecuted
                ? 'bg-emerald-500 text-white border-emerald-600'
                : 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
              : wasExecuted
                ? 'bg-amber-500 text-white border-amber-600'
                : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900';
          return (
            <div
              key={idx}
              className={cn(
                'flex w-[120px] shrink-0 flex-col items-start rounded-md border-2 px-2 py-1 transition-all',
                actorColor,
                isActive ? 'scale-105 ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''
              )}
            >
              <span className="text-[10px] font-bold uppercase opacity-80">
                {step.actor === 'producer' ? 'P' : 'C'} · t{idx + 1}
              </span>
              <span className="font-mono text-[11px]">{step.code}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function RaceConditionDemo() {
  const [scenarioId, setScenarioId] = useState<string>(RACE_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(-1); // -1 = initial state, 0..n-1 = after step k
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: InterleavingScenario = useMemo(() => getScenarioById(scenarioId), [scenarioId]);
  const totalSteps = scenario.steps.length;

  const state: MachineState = useMemo(() => {
    if (stepIndex < 0) {
      return { ...INITIAL_STATE, counter: scenario.initialCounter };
    }
    return scenario.steps[stepIndex].state;
  }, [scenario, stepIndex]);

  const currentStep = stepIndex >= 0 ? scenario.steps[stepIndex] : null;

  const producerActiveLine =
    currentStep && currentStep.actor === 'producer' ? currentStep.actorLine : null;
  const consumerActiveLine =
    currentStep && currentStep.actor === 'consumer' ? currentStep.actorLine : null;

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
    const timer = setTimeout(handleNext, 1600);
    return () => clearTimeout(timer);
  }, [stepIndex, isPlaying, handleNext]);

  const isFinalStep = stepIndex === totalSteps - 1;
  const finalCorrect =
    isFinalStep && scenario.steps[totalSteps - 1].state.counter === scenario.expectedFinal;

  const timelineSteps = scenario.steps.map((s) => ({ actor: s.actor, code: s.code }));

  return (
    <div className="w-full min-w-0 space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          תרחיש:
        </span>
        {RACE_SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          const isRace = s.intent === 'race';
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleScenarioChange(s.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? isRace
                    ? 'border-red-500 bg-red-500 text-white'
                    : 'border-emerald-500 bg-emerald-500 text-white'
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

      <div className="rounded-lg border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            משתנה משותף
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            ערך התחלתי: {scenario.initialCounter} · נכון מצופה: {scenario.expectedFinal}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="rounded-lg border-2 border-blue-400 bg-white px-6 py-3 shadow-sm dark:border-blue-700 dark:bg-slate-900">
            <div className="text-center text-[10px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              counter
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={`counter-${stepIndex}-${state.counter}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.22 }}
                className="text-center font-mono text-3xl font-bold text-slate-950 dark:text-slate-50"
                dir="ltr"
              >
                {state.counter}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <CodePanel
            title="Producer · counter++"
            code={PRODUCER_CODE}
            activeLine={producerActiveLine}
            variant="producer"
            active={currentStep?.actor === 'producer'}
          />
          <RegisterCell
            label="R1"
            value={state.r1}
            active={currentStep?.actor === 'producer'}
            accent="producer"
          />
        </div>
        <div className="min-w-0 space-y-2">
          <CodePanel
            title="Consumer · counter--"
            code={CONSUMER_CODE}
            activeLine={consumerActiveLine}
            variant="consumer"
            active={currentStep?.actor === 'consumer'}
          />
          <RegisterCell
            label="R2"
            value={state.r2}
            active={currentStep?.actor === 'consumer'}
            accent="consumer"
          />
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-lg border bg-white p-3 dark:border-slate-800 dark:bg-slate-900/40">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-200">
            ציר זמן — סדר ביצוע הצעדים
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            צעד {Math.max(stepIndex + 1, 0)} מתוך {totalSteps}
          </div>
        </div>
        <TimelineStrip steps={timelineSteps} currentIndex={stepIndex} />
      </div>

      <div className="rounded-md border bg-muted p-3 text-sm leading-relaxed">
        {currentStep ? (
          <>
            <strong>{currentStep.explanation}</strong>
            {currentStep.note ? (
              <div className="mt-2 flex gap-2 text-slate-700 dark:text-slate-200">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>{currentStep.note}</span>
              </div>
            ) : null}
            {isFinalStep ? (
              <div
                className={cn(
                  'mt-3 flex items-start gap-2 rounded-md border p-2',
                  finalCorrect
                    ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
                    : 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                )}
              >
                {finalCorrect ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
                )}
                <span className="text-sm">{scenario.summary}</span>
              </div>
            ) : null}
          </>
        ) : (
          <span className="text-slate-700 dark:text-slate-200">
            לחצו "הבא" כדי להתחיל. counter מתחיל בערך {scenario.initialCounter}, ושני התהליכים מוכנים לרוץ.
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
