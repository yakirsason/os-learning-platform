import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleDashed, XCircle } from 'lucide-react';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';
import {
  RULE_SCENARIOS,
  SECTIONS_ORDER,
  getRuleLabel,
  getRuleScenarioById,
  getSectionLabel,
  type ProcessSnapshot,
  type Rule,
  type RuleScenario,
  type RuleStatus,
  type Section,
} from '../lib/criticalSectionScenarios';

const ALL_RULES: Rule[] = ['mutex', 'progress', 'bounded-waiting'];

const SECTION_STYLES: Record<Section, string> = {
  remainder: 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
  entry: 'border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100',
  critical: 'border-red-400 bg-red-100 text-red-900 dark:border-red-800 dark:bg-red-900/40 dark:text-red-100',
  exit: 'border-emerald-300 bg-emerald-100 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100',
};

interface ProcessTrackProps {
  process: ProcessSnapshot;
}

function ProcessTrack({ process }: ProcessTrackProps) {
  return (
    <div className="rounded-lg border bg-white p-3 dark:border-slate-800 dark:bg-slate-900/40">
      <div className="mb-2 flex items-center justify-between">
        <div className="font-mono text-sm font-bold text-slate-900 dark:text-slate-50">{process.id}</div>
        {process.acted ? (
          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
            פעל עכשיו
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-4 gap-1">
        {SECTIONS_ORDER.map((section) => {
          const isCurrent = section === process.section;
          const sectionLabel = getSectionLabel(section);
          return (
            <div
              key={section}
              className={cn(
                'rounded-md border-2 px-1.5 py-2 text-center transition-all',
                isCurrent ? SECTION_STYLES[section] : 'border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-500'
              )}
            >
              <div className="text-[10px] font-bold leading-tight">{sectionLabel.hebrew}</div>
              <div className="font-mono text-[9px] opacity-70">{sectionLabel.english}</div>
              <AnimatePresence mode="wait">
                {isCurrent ? (
                  <motion.div
                    key={`${process.id}-${section}`}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1 inline-block rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-white dark:text-slate-900"
                  >
                    {process.id}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface RuleBadgeProps {
  rule: Rule;
  status: RuleStatus;
  highlighted: boolean;
}

function RuleBadge({ rule, status, highlighted }: RuleBadgeProps) {
  const label = getRuleLabel(rule);
  const statusConfig =
    status === 'ok'
      ? {
          icon: CheckCircle2,
          color: 'text-emerald-700 dark:text-emerald-300',
          bg: 'bg-emerald-50 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-800',
          text: 'נשמר',
        }
      : status === 'violated'
        ? {
            icon: XCircle,
            color: 'text-red-700 dark:text-red-300',
            bg: 'bg-red-50 border-red-400 dark:bg-red-950/40 dark:border-red-700',
            text: 'הופר',
          }
        : {
            icon: CircleDashed,
            color: 'text-slate-500 dark:text-slate-400',
            bg: 'bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-700',
            text: 'עוד לא נבדק',
          };
  const Icon = statusConfig.icon;
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md border p-2 transition-all',
        statusConfig.bg,
        highlighted ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', statusConfig.color)} />
      <div className="min-w-0 flex-1">
        <div className="text-[11px] font-bold text-slate-900 dark:text-slate-50">{label.hebrew}</div>
        <div className="font-mono text-[9px] text-slate-500 dark:text-slate-400">{label.english}</div>
        <div className={cn('mt-0.5 text-[10px] font-semibold', statusConfig.color)}>
          {statusConfig.text}
        </div>
      </div>
    </div>
  );
}

export default function CriticalSectionRuleChecker() {
  const [scenarioId, setScenarioId] = useState<string>(RULE_SCENARIOS[0].id);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const scenario: RuleScenario = useMemo(() => getRuleScenarioById(scenarioId), [scenarioId]);
  const totalSteps = scenario.steps.length;
  const currentStep = scenario.steps[stepIndex];

  const handleNext = useCallback(() => {
    setStepIndex((idx) => {
      if (idx < totalSteps - 1) return idx + 1;
      setIsPlaying(false);
      return idx;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setStepIndex((idx) => (idx > 0 ? idx - 1 : idx));
  }, []);

  const handleReset = useCallback(() => {
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  const handleScenarioChange = useCallback((id: string) => {
    setScenarioId(id);
    setStepIndex(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1900);
    return () => clearTimeout(timer);
  }, [stepIndex, isPlaying, handleNext]);

  const isFinalStep = stepIndex === totalSteps - 1;

  return (
    <div className="space-y-4" dir="rtl">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">תרחיש:</span>
        {RULE_SCENARIOS.map((s) => {
          const active = s.id === scenarioId;
          const isViolation = s.outcome === 'violated';
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => handleScenarioChange(s.id)}
              className={cn(
                'rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors',
                active
                  ? isViolation
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

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200">
        <strong className="block text-sm">{scenario.title}</strong>
        <p className="m-0 mt-1">{scenario.description}</p>
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_240px]">
        <div className="space-y-2">
          {currentStep.processes.map((p) => (
            <ProcessTrack key={p.id} process={p} />
          ))}
        </div>

        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300">
            סטטוס שלושת הכללים
          </div>
          {ALL_RULES.map((rule) => (
            <RuleBadge
              key={rule}
              rule={rule}
              status={currentStep.ruleStatus[rule]}
              highlighted={rule === scenario.rule}
            />
          ))}
        </div>
      </div>

      <div className="rounded-md border bg-muted p-3 text-sm leading-relaxed">
        <div className="mb-1 text-xs font-bold text-slate-600 dark:text-slate-300">
          {currentStep.title} · צעד {stepIndex + 1} מתוך {totalSteps}
        </div>
        <div className="text-slate-800 dark:text-slate-100">{currentStep.explanation}</div>
        {isFinalStep ? (
          <div
            className={cn(
              'mt-3 flex items-start gap-2 rounded-md border p-2',
              scenario.outcome === 'violated'
                ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30'
                : 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30'
            )}
          >
            {scenario.outcome === 'violated' ? (
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            )}
            <span className="text-sm">{scenario.conclusion}</span>
          </div>
        ) : null}
      </div>

      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={stepIndex > 0}
        canGoForward={stepIndex < totalSteps - 1}
      />
    </div>
  );
}
