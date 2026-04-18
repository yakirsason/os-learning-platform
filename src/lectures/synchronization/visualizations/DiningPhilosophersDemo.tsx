import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  DP_REMEDY_CARDS,
  DP_SCENARIOS,
  PHILOSOPHER_STATE_LABELS,
  getDPScenarioById,
  type ChopstickSnapshot,
  type DPScenario,
  type DPState,
  type PhilosopherSnapshot,
  type PhilosopherState,
  type ProgressState,
} from '../lib/diningPhilosophersScenarios';

const STATE_CLASSES: Record<PhilosopherState, string> = {
  thinking:
    'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
  hungry:
    'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100',
  waiting:
    'border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-100',
  eating:
    'border-emerald-400 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100',
};

const PROGRESS_CLASSES: Record<ProgressState, string> = {
  possible:
    'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100',
  danger:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100',
  deadlocked:
    'border-red-400 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100',
};

const PROGRESS_LABELS: Record<ProgressState, { title: string; detail: string }> = {
  possible: {
    title: 'התקדמות אפשרית',
    detail: 'לפחות פילוסוף אחד יכול לאכול או לשחרר מקלות.',
  },
  danger: {
    title: 'מצב מסוכן',
    detail: 'כל המקלות תפוסים, ואם כולם יבקשו את השני נגיע ל-deadlock.',
  },
  deadlocked: {
    title: 'Deadlock',
    detail: 'כולם ממתינים למשאב שמוחזק על ידי מישהו אחר, ואין פעולה שיכולה להתקדם.',
  },
};

function chopstickLabel(id: number) {
  return `C${id}`;
}

function philosopherLabel(id: number) {
  return `P${id}`;
}

interface CodePanelProps {
  scenario: DPScenario;
  activeLine: number | null;
}

function CodePanel({ scenario, activeLine }: CodePanelProps) {
  return (
    <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{scenario.codeTitle}</div>
        {scenario.remedyLabel ? (
          <span className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
            {scenario.remedyLabel}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 overflow-x-auto rounded-md bg-slate-950 p-2" dir="ltr">
        <ol className="m-0 list-none space-y-1 p-0">
          {scenario.code.map((line) => {
            const active = line.num === activeLine;
            return (
              <li
                key={`${scenario.id}-code-${line.num}`}
                className={cn(
                  'flex min-w-max items-center gap-2 rounded px-2 py-1 font-mono text-[11px] transition-colors',
                  active ? 'bg-blue-500 text-white' : 'text-slate-300'
                )}
              >
                <span className={cn('w-5 shrink-0 text-[10px] font-bold', active ? 'text-white' : 'text-slate-500')}>
                  {line.num}.
                </span>
                <span>{line.text}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

interface PhilosopherCardProps {
  philosopher: PhilosopherSnapshot;
  active: boolean;
  activeChopsticks: number[];
}

function PhilosopherCard({ philosopher, active, activeChopsticks }: PhilosopherCardProps) {
  const stateLabel = PHILOSOPHER_STATE_LABELS[philosopher.state];
  const blocked = philosopher.state === 'waiting' && philosopher.waitingFor.length > 0;

  return (
    <motion.div
      layout
      className={cn(
        'flex min-w-0 flex-col gap-2 rounded-lg border-2 bg-white p-3 transition-all dark:bg-slate-950',
        STATE_CLASSES[philosopher.state],
        active ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : '',
        blocked ? 'shadow-sm shadow-amber-200 dark:shadow-none' : ''
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-sm font-black" dir="ltr">
          {philosopherLabel(philosopher.id)}
        </span>
        <span className="rounded border bg-white/70 px-2 py-0.5 text-[10px] font-bold dark:bg-slate-950/50">
          {stateLabel.label}
        </span>
      </div>

      <div className="space-y-1 text-[11px] leading-relaxed">
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-600 dark:text-slate-300">מחזיק:</span>
          {philosopher.heldChopsticks.length > 0 ? (
            philosopher.heldChopsticks.map((id) => (
              <span
                key={`held-${philosopher.id}-${id}`}
                className={cn(
                  'rounded border px-1.5 py-0.5 font-mono font-bold',
                  activeChopsticks.includes(id)
                    ? 'border-blue-500 bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-100'
                    : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200'
                )}
                dir="ltr"
              >
                {chopstickLabel(id)}
              </span>
            ))
          ) : (
            <span className="text-slate-500 dark:text-slate-400">כלום</span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1">
          <span className="text-slate-600 dark:text-slate-300">ממתין ל:</span>
          {philosopher.waitingFor.length > 0 ? (
            philosopher.waitingFor.map((id) => (
              <span
                key={`wait-${philosopher.id}-${id}`}
                className="rounded border border-amber-500 bg-amber-100 px-1.5 py-0.5 font-mono font-bold text-amber-950 dark:bg-amber-950 dark:text-amber-100"
                dir="ltr"
              >
                {chopstickLabel(id)}
              </span>
            ))
          ) : (
            <span className="text-slate-500 dark:text-slate-400">לא ממתין</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ChopstickCellProps {
  chopstick: ChopstickSnapshot;
  active: boolean;
  deadlocked: boolean;
}

function ChopstickCell({ chopstick, active, deadlocked }: ChopstickCellProps) {
  const owned = chopstick.owner !== null;

  return (
    <motion.div
      layout
      className={cn(
        'flex min-w-0 flex-col items-center justify-center rounded-lg border-2 px-3 py-2 text-center transition-all',
        owned
          ? deadlocked
            ? 'border-red-400 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/40 dark:text-red-100'
            : 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-100'
          : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
        active ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''
      )}
    >
      <span className="font-mono text-sm font-black" dir="ltr">
        {chopstickLabel(chopstick.id)}
      </span>
      <span className="mt-1 text-[11px]">
        {chopstick.owner !== null ? (
          <>
            אצל{' '}
            <span className="font-mono font-bold" dir="ltr">
              {philosopherLabel(chopstick.owner)}
            </span>
          </>
        ) : (
          'פנוי'
        )}
      </span>
    </motion.div>
  );
}

interface ResourceBoardProps {
  state: DPState;
  activePhilosophers: number[];
  activeChopsticks: number[];
}

function ResourceBoard({ state, activePhilosophers, activeChopsticks }: ResourceBoardProps) {
  const deadlocked = state.progress === 'deadlocked';

  return (
    <div className="space-y-3">
      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          פילוסופים
        </div>
        <div className="grid min-w-0 gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {state.philosophers.map((philosopher) => (
            <PhilosopherCard
              key={philosopher.id}
              philosopher={philosopher}
              active={activePhilosophers.includes(philosopher.id)}
              activeChopsticks={activeChopsticks}
            />
          ))}
        </div>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
          מקלות אכילה כמשאבים
        </div>
        <div className="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {state.chopsticks.map((chopstick) => (
            <ChopstickCell
              key={chopstick.id}
              chopstick={chopstick}
              active={activeChopsticks.includes(chopstick.id)}
              deadlocked={deadlocked}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface ProgressBannerProps {
  progress: ProgressState;
}

function ProgressBanner({ progress }: ProgressBannerProps) {
  const config = PROGRESS_LABELS[progress];
  const Icon = progress === 'deadlocked' || progress === 'danger' ? AlertTriangle : CheckCircle2;

  return (
    <div className={cn('flex items-start gap-2 rounded-lg border p-3', PROGRESS_CLASSES[progress])}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0">
        <div className="text-sm font-bold">{config.title}</div>
        <div className="text-xs leading-relaxed">{config.detail}</div>
      </div>
    </div>
  );
}

export default function DiningPhilosophersDemo() {
  const [scenarioId, setScenarioId] = useState<string>(DP_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: DPScenario = useMemo(() => getDPScenarioById(scenarioId), [scenarioId]);
  const totalSteps = scenario.steps.length;

  const currentStep = stepIndex >= 0 ? scenario.steps[stepIndex] : null;
  const state = currentStep?.state ?? scenario.initial;
  const activePhilosophers = currentStep?.activePhilosophers ?? [];
  const activeChopsticks = currentStep?.activeChopsticks ?? [];

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
    setIsPlaying((playing) => !playing);
  }, []);

  const handleScenarioChange = useCallback((id: string) => {
    setScenarioId(id);
    setStepIndex(-1);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(handleNext, 1700);
    return () => window.clearTimeout(timer);
  }, [handleNext, isPlaying, stepIndex]);

  const isFinalStep = stepIndex === totalSteps - 1;

  return (
    <div className="w-full min-w-0 space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">תרחיש:</span>
        {DP_SCENARIOS.map((item) => {
          const active = item.id === scenarioId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleScenarioChange(item.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800'
              )}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        {scenario.subtitle}
      </p>

      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="min-w-0 space-y-3">
          <ResourceBoard
            state={state}
            activePhilosophers={activePhilosophers}
            activeChopsticks={activeChopsticks}
          />
          <ProgressBanner progress={state.progress} />
        </div>

        <div className="min-w-0 space-y-3">
          <CodePanel scenario={scenario} activeLine={currentStep?.codeLine ?? null} />

          <div className="rounded-lg border bg-white p-3 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-950">
            {currentStep ? (
              <>
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                    צעד {stepIndex + 1} מתוך {totalSteps}
                  </span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200" dir="ltr">
                    {currentStep.action}
                  </span>
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-50">{currentStep.title}</div>
                <p className="mb-0 mt-1 text-slate-700 dark:text-slate-200">{currentStep.explanation}</p>
                {currentStep.note ? (
                  <div className="mt-2 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-950 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-100">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{currentStep.note}</span>
                  </div>
                ) : null}
                {isFinalStep ? (
                  <div className="mt-3 flex gap-2 rounded-md border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{scenario.conclusion}</span>
                  </div>
                ) : null}
              </>
            ) : (
              <span className="text-slate-700 dark:text-slate-200">
                לחצו על "הבא" כדי להתחיל. המצב ההתחלתי מדויק: כל הפילוסופים חושבים וכל חמשת המקלות פנויים.
              </span>
            )}
          </div>
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

      <div className="grid min-w-0 gap-2 md:grid-cols-3">
        {DP_REMEDY_CARDS.map((card) => (
          <div
            key={card.title}
            className={cn(
              'rounded-lg border bg-white p-3 text-sm leading-relaxed dark:bg-slate-950',
              card.highlighted
                ? 'border-emerald-300 dark:border-emerald-800'
                : 'border-slate-200 dark:border-slate-800'
            )}
          >
            <div className="mb-1 font-semibold text-slate-900 dark:text-slate-50">{card.title}</div>
            <p className="m-0 text-xs text-slate-600 dark:text-slate-300">{card.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
