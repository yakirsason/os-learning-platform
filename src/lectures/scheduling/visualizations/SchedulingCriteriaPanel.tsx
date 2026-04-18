import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';

interface SchedulingCriteriaPanelProps {}

type ScenarioId = 'interactive' | 'batch';
type Direction = 'maximize' | 'minimize';

interface CriteriaStep {
  id: string;
  title: string;
  englishTerm: string;
  direction: Direction;
  simpleQuestion: string;
  explanation: string;
  examDistinction: string;
  scenarioNote: string;
}

interface ScenarioOption {
  id: ScenarioId;
  title: string;
  description: string;
}

const SCENARIOS: ScenarioOption[] = [
  {
    id: 'interactive',
    title: 'מערכת אינטראקטיבית',
    description: 'חשוב שהמשתמש ירגיש תגובה מהירה.',
  },
  {
    id: 'batch',
    title: 'עיבוד אצווה',
    description: 'חשוב לסיים הרבה עבודות בצורה יעילה.',
  },
];

function getScenarioNote(scenario: ScenarioId, metricId: string): string {
  if (scenario === 'interactive') {
    if (metricId === 'response') {
      return 'במערכת אינטראקטיבית זה מדד מרכזי: המשתמש מרגיש בעיקר את זמן התגובה הראשונה.';
    }
    if (metricId === 'waiting') {
      return 'גם המתנה בתור חשובה, כי היא יכולה להצטבר ולהרגיש כמו איטיות.';
    }
    return 'המדד עדיין חשוב, אבל הוא לא תמיד מה שהמשתמש מרגיש ראשון.';
  }

  if (metricId === 'throughput') {
    return 'בעיבוד אצווה זה מדד מרכזי: רוצים לסיים כמה שיותר עבודות ביחידת זמן.';
  }
  if (metricId === 'cpu-utilization') {
    return 'כאן חשוב מאוד לא להשאיר את ה-CPU פנוי בלי סיבה.';
  }
  return 'המדד עדיין נמדד, אבל המערכת עשויה להעדיף תפוקה וניצול CPU על פני תגובה מיידית.';
}

export default function SchedulingCriteriaPanel(_props: SchedulingCriteriaPanelProps) {
  const [scenario, setScenario] = useState<ScenarioId>('interactive');
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo<CriteriaStep[]>(() => {
    const baseSteps: Omit<CriteriaStep, 'scenarioNote'>[] = [
      {
        id: 'cpu-utilization',
        title: 'ניצול CPU',
        englishTerm: 'CPU utilization',
        direction: 'maximize',
        simpleQuestion: 'כמה מהזמן ה-CPU באמת עובד?',
        explanation:
          'אם ה-CPU פנוי בזמן שיש עבודה שאפשר להריץ, המערכת מבזבזת משאב חשוב.',
        examDistinction: 'זה מדד מערכתי: לא שייך לתהליך אחד, אלא לכל המערכת.',
      },
      {
        id: 'throughput',
        title: 'תפוקה',
        englishTerm: 'Throughput',
        direction: 'maximize',
        simpleQuestion: 'כמה תהליכים מסתיימים ביחידת זמן?',
        explanation:
          'מערכת עם throughput גבוה מסיימת יותר עבודות באותו פרק זמן.',
        examDistinction: 'לא מודדים כאן כמה תהליך יחיד חיכה, אלא כמה עבודות הושלמו.',
      },
      {
        id: 'turnaround',
        title: 'זמן סיבוב',
        englishTerm: 'Turnaround time',
        direction: 'minimize',
        simpleQuestion: 'כמה זמן עבר מהגעה עד סיום?',
        explanation:
          'זה הזמן הכולל של התהליך במערכת: המתנה, ריצה, עצירות וכל מה שביניהן.',
        examDistinction: 'Turnaround מסתיים רק כשהתהליך הסתיים. הוא לא תגובה ראשונה.',
      },
      {
        id: 'waiting',
        title: 'זמן המתנה',
        englishTerm: 'Waiting time',
        direction: 'minimize',
        simpleQuestion: 'כמה זמן התהליך חיכה ב-Ready Queue?',
        explanation:
          'זה לא כל זמן ההמתנה בעולם. סופרים כאן רק זמן שבו התהליך מוכן לרוץ ומחכה ל-CPU.',
        examDistinction: 'המתנה ל-I/O לא נספרת כ-waiting time במדד הזה.',
      },
      {
        id: 'response',
        title: 'זמן תגובה',
        englishTerm: 'Response time',
        direction: 'minimize',
        simpleQuestion: 'כמה זמן עד שהגיעה תגובה ראשונה?',
        explanation:
          'מודדים מההגעה של התהליך עד הפעם הראשונה שהוא מקבל CPU ומתחיל להגיב.',
        examDistinction: 'Response לא מחכה לסיום. Completion שייך ל-turnaround.',
      },
    ];

    return baseSteps.map((step) => ({
      ...step,
      scenarioNote: getScenarioNote(scenario, step.id),
    }));
  }, [scenario]);

  const totalSteps = steps.length;
  const current = steps[currentStep];

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
    setScenario('interactive');
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  const handleScenarioChange = useCallback((nextScenario: ScenarioId) => {
    setScenario(nextScenario);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 2000);
    return () => clearTimeout(timer);
  }, [currentStep, handleNext, isPlaying]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-lg border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-4">
          <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
            בחרו סוג מערכת
          </div>
          <div className="grid gap-2 md:grid-cols-2">
            {SCENARIOS.map((option) => {
              const isSelected = option.id === scenario;
              return (
                <Button
                  key={option.id}
                  type="button"
                  variant={isSelected ? 'default' : 'outline'}
                  className="h-auto justify-start whitespace-normal p-3 text-start"
                  onClick={() => handleScenarioChange(option.id)}
                >
                  <span>
                    <span className="block font-semibold">{option.title}</span>
                    <span className="block text-xs opacity-80">{option.description}</span>
                  </span>
                </Button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1fr_280px]">
          <div className="grid gap-2 sm:grid-cols-2">
            {steps.map((metric, index) => {
              const isActive = index === currentStep;
              return (
                <motion.div
                  key={metric.id}
                  layout
                  className={cn(
                    'rounded-lg border p-3',
                    isActive
                      ? 'border-blue-400 bg-blue-50 shadow-sm dark:border-blue-700 dark:bg-blue-950/30'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-semibold text-slate-950 dark:text-slate-50">
                        {metric.title}
                      </div>
                      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                        {metric.englishTerm}
                      </div>
                    </div>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[10px] font-bold',
                        metric.direction === 'maximize'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200'
                      )}
                    >
                      {metric.direction === 'maximize' ? 'למקסם' : 'למזער'}
                    </span>
                  </div>
                  <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                    {metric.simpleQuestion}
                  </p>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${scenario}-${current.id}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
              >
                <div>
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    המדד הפעיל
                  </div>
                  <h3 className="m-0 text-lg font-bold text-slate-950 dark:text-slate-50">
                    {current.title}
                  </h3>
                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {current.englishTerm}
                  </div>
                </div>

                <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
                  {current.explanation}
                </p>

                <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-950 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-100">
                  {current.scenarioNote}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3 text-sm leading-relaxed">
        <strong>להבחנה במבחן:</strong> {current.examDistinction}
      </div>

      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={currentStep > 0}
        canGoForward={currentStep < totalSteps - 1}
      />

      <div className="text-center text-xs text-muted-foreground">
        מדד {currentStep + 1} מתוך {totalSteps}
      </div>
    </div>
  );
}
