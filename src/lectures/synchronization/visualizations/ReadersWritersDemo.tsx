import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, BookOpen, CheckCircle2, Lock, PenTool, Unlock } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  PHASE_LABELS,
  READER_CODE,
  RW_SCENARIOS,
  WRITER_CODE,
  getRWScenarioById,
  type ActorSnapshot,
  type ChangedKey,
  type CodePath,
  type DbState,
  type RWScenario,
  type RWState,
} from '../lib/readersWritersScenarios';

const PHASE_TONE_CLASSES: Record<string, string> = {
  neutral:
    'bg-slate-100 text-slate-600 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700',
  entering:
    'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/40 dark:text-blue-200 dark:border-blue-800',
  reading:
    'bg-emerald-100 text-emerald-900 border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-700',
  writing:
    'bg-red-100 text-red-900 border-red-400 dark:bg-red-950/40 dark:text-red-200 dark:border-red-700',
  wait: 'bg-amber-100 text-amber-900 border-amber-400 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-700',
  done: 'bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800/50 dark:text-slate-500 dark:border-slate-700',
};

const DB_STATE_CONFIG: Record<DbState, { label: string; class: string; Icon: typeof Lock }> = {
  free: {
    label: 'פנוי',
    class:
      'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    Icon: Unlock,
  },
  reading: {
    label: 'בקריאה משותפת',
    class:
      'border-emerald-400 bg-emerald-50 text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100',
    Icon: BookOpen,
  },
  writing: {
    label: 'בכתיבה בלעדית',
    class:
      'border-red-500 bg-red-50 text-red-900 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100',
    Icon: PenTool,
  },
};

interface CodeBlockProps {
  path: CodePath;
  activeLine: number | null;
  active: boolean;
}

function CodeBlock({ path, activeLine, active }: CodeBlockProps) {
  const lines = path === 'reader' ? READER_CODE : WRITER_CODE;
  const headerColor =
    path === 'reader'
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-red-700 dark:text-red-300';
  const borderColor =
    path === 'reader'
      ? active
        ? 'border-emerald-500 dark:border-emerald-600'
        : 'border-emerald-200 dark:border-emerald-900'
      : active
        ? 'border-red-500 dark:border-red-600'
        : 'border-red-200 dark:border-red-900';
  const highlightClass =
    path === 'reader'
      ? 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/60 dark:text-emerald-50'
      : 'bg-red-100 text-red-900 dark:bg-red-900/60 dark:text-red-50';
  const dimmed = !active;
  return (
    <div
      className={cn(
        'flex min-w-0 flex-col rounded-lg border-2 bg-white p-3 transition-all dark:bg-slate-950',
        borderColor,
        active ? 'shadow-md' : 'opacity-70'
      )}
    >
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <div className={cn('font-mono text-xs font-bold', headerColor)} dir="ltr">
          {path === 'reader' ? 'Reader' : 'Writer'}
        </div>
        {active ? (
          <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[9px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-200">
            מופעל עכשיו
          </span>
        ) : null}
      </div>
      <div className="rounded-md bg-slate-50 p-2 dark:bg-slate-900/60" dir="ltr">
        <ol className="m-0 list-none p-0">
          {lines.map((line) => {
            const isActive = active && activeLine === line.num;
            return (
              <li
                key={`${path}-${line.num}`}
                className={cn(
                  'relative flex items-center gap-2 rounded px-2 py-1 font-mono text-[11px] transition-colors',
                  isActive
                    ? highlightClass
                    : dimmed
                      ? 'text-slate-400 dark:text-slate-600'
                      : 'text-slate-700 dark:text-slate-300'
                )}
              >
                <span
                  className={cn(
                    'inline-block w-5 shrink-0 text-[10px] font-bold',
                    isActive ? 'opacity-100' : 'opacity-40'
                  )}
                >
                  {line.num}.
                </span>
                <span>{line.text}</span>
                {isActive ? (
                  <motion.span
                    layoutId={`${path}-arrow`}
                    className="absolute -start-1 top-1/2 -translate-y-1/2 text-sm"
                    aria-hidden
                  >
                    ◂
                  </motion.span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

interface DatabasePanelProps {
  state: RWState;
  highlight: boolean;
}

function DatabasePanel({ state, highlight }: DatabasePanelProps) {
  const dbConfig = DB_STATE_CONFIG[state.dbState];
  const DbIcon = dbConfig.Icon;
  const activeReaders = state.actors.filter(
    (a) => a.role === 'reader' && a.phase === 'reading'
  );
  const activeWriter = state.actors.find(
    (a) => a.role === 'writer' && a.phase === 'writing'
  );
  return (
    <div
      className={cn(
        'rounded-lg border-2 p-3 transition-all',
        dbConfig.class,
        highlight ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''
      )}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <DbIcon className="h-5 w-5" />
          <div className="flex flex-col">
            <span className="text-[11px] font-bold uppercase tracking-wide opacity-70">
              מסד הנתונים
            </span>
            <span className="text-sm font-bold">{dbConfig.label}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {activeReaders.length > 0 ? (
            <div className="flex gap-1">
              {activeReaders.map((r) => (
                <motion.span
                  key={r.id}
                  layout
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.2 }}
                  className="rounded border-2 border-emerald-500 bg-white px-2 py-0.5 font-mono text-xs font-bold text-emerald-900 dark:bg-slate-950 dark:text-emerald-100"
                  dir="ltr"
                >
                  {r.id}
                </motion.span>
              ))}
            </div>
          ) : null}
          {activeWriter ? (
            <motion.span
              layout
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.2 }}
              className="rounded border-2 border-red-500 bg-white px-2 py-0.5 font-mono text-xs font-bold text-red-900 dark:bg-slate-950 dark:text-red-100"
              dir="ltr"
            >
              {activeWriter.id}
            </motion.span>
          ) : null}
        </div>
      </div>
    </div>
  );
}

interface CounterCellProps {
  label: string;
  value: number | string;
  sub?: string;
  highlight: boolean;
  toneNegative?: boolean;
}

function CounterCell({ label, value, sub, highlight, toneNegative }: CounterCellProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-md border-2 px-3 py-1.5 transition-all',
        toneNegative
          ? 'border-amber-400 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100'
          : 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100',
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
          className="font-mono text-lg font-bold"
          dir="ltr"
        >
          {value}
        </motion.div>
      </AnimatePresence>
      {sub ? <div className="text-[9px] opacity-70">{sub}</div> : null}
    </div>
  );
}

interface ActorRowProps {
  actor: ActorSnapshot;
  active: boolean;
  woke: boolean;
}

function ActorRow({ actor, active, woke }: ActorRowProps) {
  const phaseLabel = PHASE_LABELS[actor.phase];
  const roleClass =
    actor.role === 'reader'
      ? 'border-emerald-300 dark:border-emerald-800'
      : 'border-red-300 dark:border-red-800';
  const roleHeader =
    actor.role === 'reader'
      ? 'text-emerald-700 dark:text-emerald-300'
      : 'text-red-700 dark:text-red-300';
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2 rounded-md border bg-white px-3 py-1.5 transition-all dark:bg-slate-950',
        roleClass,
        active ? 'shadow-md ring-1 ring-blue-400 dark:ring-blue-700' : '',
        woke ? 'ring-2 ring-emerald-500 dark:ring-emerald-600' : ''
      )}
    >
      <div className="flex items-center gap-2">
        <span className={cn('font-mono text-sm font-bold', roleHeader)} dir="ltr">
          {actor.id}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {actor.role === 'reader' ? 'Reader' : 'Writer'}
        </span>
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
  );
}

export default function ReadersWritersDemo() {
  const [scenarioId, setScenarioId] = useState<string>(RW_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: RWScenario = useMemo(() => getRWScenarioById(scenarioId), [scenarioId]);
  const totalSteps = scenario.steps.length;

  const state: RWState = useMemo(() => {
    if (stepIndex < 0) return scenario.initial;
    return scenario.steps[stepIndex].state;
  }, [scenario, stepIndex]);

  const currentStep = stepIndex >= 0 ? scenario.steps[stepIndex] : null;
  const previousState: RWState = useMemo(() => {
    if (stepIndex <= 0) return scenario.initial;
    return scenario.steps[stepIndex - 1].state;
  }, [scenario, stepIndex]);

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
    const timer = setTimeout(handleNext, 1500);
    return () => clearTimeout(timer);
  }, [stepIndex, isPlaying, handleNext]);

  const isFinalStep = stepIndex === totalSteps - 1;
  const changed: ChangedKey | undefined = currentStep?.changed;
  const dbChanged = currentStep !== null && previousState.dbState !== state.dbState;

  const activeReaderLine =
    currentStep?.codePath === 'reader' ? currentStep.codeLine : null;
  const activeWriterLine =
    currentStep?.codePath === 'writer' ? currentStep.codeLine : null;

  return (
    <div className="w-full min-w-0 space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">תרחיש:</span>
        {RW_SCENARIOS.map((s) => {
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

      {/* קוד — העיקרי. Reader רחב יותר (9 שורות), Writer צר (3 שורות). */}
      <div className="grid gap-3 md:grid-cols-[3fr_2fr]">
        <CodeBlock
          path="reader"
          activeLine={activeReaderLine}
          active={currentStep?.codePath === 'reader'}
        />
        <CodeBlock
          path="writer"
          activeLine={activeWriterLine}
          active={currentStep?.codePath === 'writer'}
        />
      </div>

      {/* הסבר — נצמד לשורת הקוד הפעילה */}
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
                  currentStep.codePath === 'reader'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200'
                )}
                dir="ltr"
              >
                {currentStep.actorId} · {currentStep.codePath} · שורה {currentStep.codeLine}
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
            לחצו "הבא" כדי להתחיל. readcount=0, mutex=1, wrt=1. המסד פנוי.
          </span>
        )}
      </div>

      {/* מצב המערכת — משני. מה שהשורה הפעילה הובילה אליו. */}
      <div className="space-y-2">
        <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          התוצאה: מצב המערכת אחרי השורה הזו
        </div>

        <DatabasePanel state={state} highlight={dbChanged || changed === 'db'} />

        <div className="grid grid-cols-3 gap-2">
          <CounterCell
            label="readcount"
            value={state.readcount}
            highlight={changed === 'readcount'}
            sub="קוראים פעילים"
          />
          <CounterCell
            label="mutex"
            value={state.mutex}
            highlight={changed === 'mutex'}
            sub="מגן על readcount"
          />
          <CounterCell
            label="wrt"
            value={state.wrt}
            highlight={changed === 'wrt'}
            toneNegative={state.wrt < 0}
            sub={state.wrt < 0 ? `${Math.abs(state.wrt)} ממתינים` : 'מגן על המסד'}
          />
        </div>

        <div className="grid gap-1.5">
          {state.actors.map((actor) => (
            <ActorRow
              key={actor.id}
              actor={actor}
              active={currentStep?.actorId === actor.id}
              woke={currentStep?.wokeUp === actor.id}
            />
          ))}
        </div>
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
