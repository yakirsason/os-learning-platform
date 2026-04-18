import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  BB_SCENARIOS,
  CONSUMER_CODE,
  PHASE_LABELS,
  PRODUCER_CODE,
  getBBScenarioById,
  type ActorPhase,
  type ActorRole,
  type ActorSnapshot,
  type BBScenario,
  type BBState,
  type ChangedSemaphore,
} from '../lib/boundedBufferScenarios';

const PHASE_TONE_CLASSES: Record<string, string> = {
  neutral:
    'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  wait: 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700',
  critical:
    'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700',
  done: 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700',
};

interface BufferViewProps {
  buffer: (string | null)[];
  highlight: boolean;
}

function BufferView({ buffer, highlight }: BufferViewProps) {
  return (
    <div
      className={cn(
        'rounded-lg border-2 bg-white p-3 transition-all dark:bg-slate-950',
        highlight
          ? 'border-blue-500 ring-2 ring-blue-300 dark:border-blue-600 dark:ring-blue-900'
          : 'border-slate-300 dark:border-slate-700'
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
          חוצץ ({buffer.length} מקומות)
        </div>
        <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400" dir="ltr">
          buffer[]
        </div>
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${buffer.length}, minmax(0, 1fr))` }}>
        {buffer.map((item, idx) => (
          <div
            key={idx}
            className={cn(
              'flex h-16 items-center justify-center rounded-md border-2 transition-colors',
              item !== null
                ? 'border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/40'
                : 'border-dashed border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40'
            )}
          >
            <AnimatePresence mode="wait">
              {item !== null ? (
                <motion.div
                  key={`item-${idx}-${item}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded bg-emerald-600 px-2 py-1 font-mono text-sm font-bold text-white shadow-sm dark:bg-emerald-500 dark:text-slate-950"
                  dir="ltr"
                >
                  {item}
                </motion.div>
              ) : (
                <motion.span
                  key={`empty-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[10px] text-slate-400 dark:text-slate-500"
                >
                  empty
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}

interface SemaphoreCellProps {
  label: string;
  value: number;
  highlight: boolean;
  tone: 'mutex' | 'empty' | 'full';
}

function SemaphoreCell({ label, value, highlight, tone }: SemaphoreCellProps) {
  const toneClass =
    tone === 'mutex'
      ? value > 0
        ? 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100'
        : 'border-slate-400 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
      : tone === 'empty'
        ? value < 0
          ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
          : 'border-violet-400 bg-violet-50 text-violet-900 dark:border-violet-700 dark:bg-violet-950/40 dark:text-violet-100'
        : value < 0
          ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
          : 'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100';
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
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.18 }}
          className="font-mono text-xl font-bold"
          dir="ltr"
        >
          {value}
        </motion.div>
      </AnimatePresence>
      {value < 0 ? (
        <div className="text-[9px] opacity-70">{Math.abs(value)} ממתינים</div>
      ) : null}
    </div>
  );
}

interface ActorCardProps {
  role: ActorRole;
  snapshot: ActorSnapshot;
  active: boolean;
  woke: boolean;
}

function ActorCard({ role, snapshot, active, woke }: ActorCardProps) {
  const isProducer = role === 'producer';
  const code = isProducer ? PRODUCER_CODE : CONSUMER_CODE;
  const phaseLabel = PHASE_LABELS[snapshot.phase];
  const headerColor = isProducer
    ? 'text-emerald-700 dark:text-emerald-300'
    : 'text-amber-700 dark:text-amber-300';
  const borderColor = isProducer
    ? 'border-emerald-300 dark:border-emerald-800'
    : 'border-amber-300 dark:border-amber-800';
  const lineHighlight = isProducer
    ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100'
    : 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-100';
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg border bg-white p-3 transition-shadow dark:bg-slate-950',
        borderColor,
        active ? 'shadow-md ring-1 ring-blue-400 dark:ring-blue-700' : 'opacity-95',
        woke ? 'ring-2 ring-emerald-500 dark:ring-emerald-600' : ''
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className={cn('flex items-center gap-2 font-bold', headerColor)}>
          <span className="font-mono text-sm">{isProducer ? 'Producer' : 'Consumer'}</span>
          {woke ? (
            <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
              התעורר
            </span>
          ) : null}
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
        {code.map((line, idx) => {
          const lineNum = idx + 1;
          const isActive = snapshot.line === lineNum;
          return (
            <li
              key={`${role}-line-${idx}`}
              className={cn(
                'rounded px-2 py-1 font-mono text-[11px] transition-colors',
                isActive ? lineHighlight : 'text-slate-600 dark:text-slate-400'
              )}
            >
              <span className="me-2 text-[10px] opacity-50">{lineNum}.</span>
              {line}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function getInitialActorPhase(_role: ActorRole): ActorPhase {
  return 'idle';
}

export default function BoundedBufferDemo() {
  const [scenarioId, setScenarioId] = useState<string>(BB_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: BBScenario = useMemo(() => getBBScenarioById(scenarioId), [scenarioId]);
  const totalSteps = scenario.steps.length;

  const state: BBState = useMemo(() => {
    if (stepIndex < 0) return scenario.initial;
    return scenario.steps[stepIndex].state;
  }, [scenario, stepIndex]);

  const currentStep = stepIndex >= 0 ? scenario.steps[stepIndex] : null;

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
  const changed: ChangedSemaphore | undefined = currentStep?.changed;

  // הוודא שהפזה ההתחלתית נקבעת אם המצב הראשוני לא הוגדר
  void getInitialActorPhase;

  return (
    <div className="w-full min-w-0 space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">תרחיש:</span>
        {BB_SCENARIOS.map((s) => {
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

      <BufferView buffer={state.buffer} highlight={changed === 'buffer'} />

      <div className="grid grid-cols-3 gap-2">
        <SemaphoreCell label="mutex" value={state.mutex} tone="mutex" highlight={changed === 'mutex'} />
        <SemaphoreCell label="empty" value={state.empty} tone="empty" highlight={changed === 'empty'} />
        <SemaphoreCell label="full" value={state.full} tone="full" highlight={changed === 'full'} />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ActorCard
          role="producer"
          snapshot={state.producer}
          active={currentStep?.actor === 'producer'}
          woke={currentStep?.wokeUp === 'producer'}
        />
        <ActorCard
          role="consumer"
          snapshot={state.consumer}
          active={currentStep?.actor === 'consumer'}
          woke={currentStep?.wokeUp === 'consumer'}
        />
      </div>

      <div className="rounded-md border bg-muted p-3 text-sm leading-relaxed">
        {currentStep ? (
          <>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                צעד {stepIndex + 1} מתוך {totalSteps}
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[11px] font-bold',
                  currentStep.actor === 'producer'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                )}
                dir="ltr"
              >
                {currentStep.actor === 'producer' ? 'P' : 'C'} · {currentStep.action}
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
                <span className="text-sm text-slate-800 dark:text-slate-100">{scenario.conclusion}</span>
              </div>
            ) : null}
          </>
        ) : (
          <span className="text-slate-700 dark:text-slate-200">
            לחצו "הבא" כדי להתחיל. mutex={scenario.initial.mutex}, empty={scenario.initial.empty}, full=
            {scenario.initial.full}.
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
