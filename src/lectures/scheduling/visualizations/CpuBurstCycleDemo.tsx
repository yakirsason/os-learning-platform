import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { cn } from '@/lib/utils';

interface CpuBurstCycleDemoProps {}

type ProcessZone = 'ready' | 'cpu' | 'io' | 'terminated';

interface CycleStep {
  title: string;
  zone: ProcessZone;
  cpuLabel: string;
  ioLabel: string;
  schedulerDecision: boolean;
  cpuFreeForOtherProcess: boolean;
  explanation: string;
  schedulerNote: string;
}

interface ZoneDefinition {
  id: ProcessZone;
  title: string;
  englishLabel: string;
  className: string;
}

const ZONES: ZoneDefinition[] = [
  {
    id: 'ready',
    title: 'תור מוכנים',
    englishLabel: 'Ready Queue',
    className: 'border-blue-300 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
  },
  {
    id: 'cpu',
    title: 'מעבד',
    englishLabel: 'CPU',
    className:
      'border-emerald-300 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30',
  },
  {
    id: 'io',
    title: 'קלט/פלט',
    englishLabel: 'I/O',
    className:
      'border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
  },
  {
    id: 'terminated',
    title: 'סיום',
    englishLabel: 'Terminated',
    className:
      'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900',
  },
];

export default function CpuBurstCycleDemo(_props: CpuBurstCycleDemoProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo<CycleStep[]>(
    () => [
      {
        title: 'התהליך מוכן לרוץ',
        zone: 'ready',
        cpuLabel: 'פנוי לבחירה',
        ioLabel: 'אין בקשת I/O',
        schedulerDecision: true,
        cpuFreeForOtherProcess: true,
        explanation:
          'התהליך נמצא בזיכרון ומחכה ב-Ready Queue. הוא יכול לרוץ, אבל עדיין לא קיבל את ה-CPU.',
        schedulerNote:
          'כאן ה-Scheduler בוחר תהליך מוכן מתוך התור ומחליט מי יקבל את ה-CPU.',
      },
      {
        title: 'CPU burst מתחיל',
        zone: 'cpu',
        cpuLabel: 'מריץ את P1',
        ioLabel: 'אין בקשת I/O',
        schedulerDecision: false,
        cpuFreeForOtherProcess: false,
        explanation:
          'עכשיו התהליך משתמש ב-CPU. זהו CPU burst: זמן שבו הוא באמת מבצע חישוב.',
        schedulerNote:
          'בזמן שהתהליך רץ, לא חייבת להיות החלטת תזמון חדשה בכל רגע. ההחלטה הבאה תגיע מאירוע.',
      },
      {
        title: 'התהליך מבקש I/O',
        zone: 'io',
        cpuLabel: 'התפנה',
        ioLabel: 'P1 מחכה לדיסק',
        schedulerDecision: true,
        cpuFreeForOtherProcess: true,
        explanation:
          'התהליך ביקש קלט/פלט, ולכן הוא לא יכול להמשיך לרוץ. הוא עובר להמתנה, וה-CPU מתפנה.',
        schedulerNote:
          'זה רגע חשוב: כשהתהליך עובר מ-Running ל-Waiting, ה-Scheduler צריך לבחור מי ירוץ עכשיו.',
      },
      {
        title: 'I/O הסתיים',
        zone: 'ready',
        cpuLabel: 'אולי עסוק בתהליך אחר',
        ioLabel: 'הבקשה הושלמה',
        schedulerDecision: true,
        cpuFreeForOtherProcess: false,
        explanation:
          'פעולת ה-I/O הסתיימה. התהליך חוזר ל-Ready Queue, כי עכשיו הוא שוב מסוגל לרוץ.',
        schedulerNote:
          'כאן יכולה להיות החלטת תזמון. במערכת preemptive ייתכן שהתהליך שחזר יגרום לעצירה של תהליך אחר.',
      },
      {
        title: 'CPU burst נוסף',
        zone: 'cpu',
        cpuLabel: 'מריץ שוב את P1',
        ioLabel: 'אין בקשת I/O',
        schedulerDecision: false,
        cpuFreeForOtherProcess: false,
        explanation:
          'התהליך קיבל שוב את ה-CPU וממשיך לבצע עבודה. בתהליך אמיתי המחזור הזה יכול לקרות פעמים רבות.',
        schedulerNote:
          'שימו לב לדפוס: ריצה קצרה, המתנה, חזרה לתור, ושוב ריצה.',
      },
      {
        title: 'התהליך מסתיים',
        zone: 'terminated',
        cpuLabel: 'התפנה',
        ioLabel: 'אין בקשות פתוחות',
        schedulerDecision: true,
        cpuFreeForOtherProcess: true,
        explanation:
          'התהליך סיים את העבודה שלו. הוא כבר לא צריך CPU, ולכן המערכת יכולה לבחור תהליך אחר.',
        schedulerNote:
          'גם סיום תהליך הוא נקודת החלטה: ה-CPU פנוי וצריך לבחור מי יקבל אותו בהמשך.',
      },
    ],
    []
  );

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
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1800);
    return () => clearTimeout(timer);
  }, [currentStep, handleNext, isPlaying]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="relative min-h-[360px] rounded-lg border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
              CPU / I/O Cycle
            </div>
            <h3 className="m-0 text-lg font-bold text-slate-950 dark:text-slate-50">
              {current.title}
            </h3>
          </div>
          <div
            className={cn(
              'rounded-full px-3 py-1 text-xs font-semibold',
              current.schedulerDecision
                ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
            )}
          >
            {current.schedulerDecision ? 'יש החלטת Scheduler' : 'אין החלטה חדשה'}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {ZONES.map((zone) => {
            const isActive = zone.id === current.zone;
            return (
              <div
                key={zone.id}
                className={cn(
                  'relative min-h-36 rounded-lg border-2 p-3',
                  zone.className,
                  isActive ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950' : ''
                )}
              >
                <div className="text-sm font-bold text-slate-900 dark:text-slate-50">
                  {zone.title}
                </div>
                <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                  {zone.englishLabel}
                </div>

                <AnimatePresence mode="wait">
                  {isActive ? (
                    <motion.div
                      key={`${currentStep}-${zone.id}`}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, y: -10 }}
                      transition={{ duration: 0.28 }}
                      className="mt-6 rounded-lg bg-slate-900 px-3 py-2 text-center text-sm font-bold text-white shadow-lg dark:bg-slate-100 dark:text-slate-950"
                    >
                      P1
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
              מצב ה-CPU
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-200">
              {current.cpuLabel}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {current.cpuFreeForOtherProcess
                ? 'ברגע כזה תהליך אחר יכול לקבל את ה-CPU.'
                : 'כרגע ה-CPU לא פנוי לתהליך אחר.'}
            </div>
          </div>

          <div className="rounded-md border bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
            <div className="text-xs font-bold text-amber-700 dark:text-amber-300">
              מצב ה-I/O
            </div>
            <div className="text-sm text-slate-700 dark:text-slate-200">
              {current.ioLabel}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              I/O הוא הסיבה הקלאסית לכך שתהליך מפנה את ה-CPU לפני שסיים.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3 text-sm leading-relaxed">
        <strong>{current.explanation}</strong>
        <div className="mt-2 text-slate-700 dark:text-slate-300">
          {current.schedulerNote}
        </div>
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
        שלב {currentStep + 1} מתוך {totalSteps}
      </div>
    </div>
  );
}
