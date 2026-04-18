import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { Button } from '@/components/ui/button';

// הדמיית Dual-Mode Operation: תהליך משתמש קורא ל-printf(), שעובר ל-write()
// ב-kernel mode דרך trap, ואז חוזר חזרה. ה-Mode Bit משתנה 1→0→1.

interface Step {
  xPct: number; // מיקום אופקי של ה-token באחוזים (0-100)
  yPct: number; // מיקום אנכי (0-100), 25=User lane, 50=interface, 75=Kernel lane
  modeBit: 0 | 1;
  tokenLabel: string;
  caption: string;
  showTrapFlash: boolean;
}

const STEPS: Step[] = [
  {
    xPct: 10,
    yPct: 25,
    modeBit: 1,
    tokenLabel: 'User Code',
    caption:
      'התהליך רץ במצב משתמש (User Mode). ה-Mode Bit הוא 1 - המעבד מבצע הוראות רגילות בלבד ואינו מורשה לגשת ישירות לחומרה.',
    showTrapFlash: false,
  },
  {
    xPct: 30,
    yPct: 25,
    modeBit: 1,
    tokenLabel: 'printf()',
    caption:
      'התהליך קורא ל-printf() בספריית ה-C. הקריאה עדיין במצב משתמש - זו פונקציה רגילה בספרייה.',
    showTrapFlash: false,
  },
  {
    xPct: 48,
    yPct: 40,
    modeBit: 1,
    tokenLabel: 'trap',
    caption:
      'printf() מבקש להעביר נתונים לקובץ הפלט. הוא מפעיל הוראת trap שמבקשת מהמעבד לעבור ל-kernel mode.',
    showTrapFlash: true,
  },
  {
    xPct: 50,
    yPct: 50,
    modeBit: 0,
    tokenLabel: 'mode switch',
    caption:
      'המעבד ביצע את ה-trap: Mode Bit עובר 1 → 0. כעת הקוד רץ ב-Kernel Mode, עם הרשאות מלאות (Privileged Instructions).',
    showTrapFlash: false,
  },
  {
    xPct: 70,
    yPct: 75,
    modeBit: 0,
    tokenLabel: 'write()',
    caption:
      'הגרעין מבצע את write() - המימוש האמיתי של ה-System Call. הוא מעתיק את הנתונים מהחוצץ של התהליך למערכת הקבצים.',
    showTrapFlash: false,
  },
  {
    xPct: 50,
    yPct: 50,
    modeBit: 1,
    tokenLabel: 'return',
    caption:
      'write() הסתיים. המעבד מחזיר Mode Bit 0 → 1, משחזר registers ומחזיר שליטה למצב משתמש.',
    showTrapFlash: false,
  },
  {
    xPct: 90,
    yPct: 25,
    modeBit: 1,
    tokenLabel: 'User Code',
    caption:
      'התהליך ממשיך לרוץ במצב משתמש מהנקודה שעצר, כאילו שום דבר לא קרה - אבל הנתונים כבר נכתבו.',
    showTrapFlash: false,
  },
];

export default function DualModeSimulator() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [exceptionActive, setExceptionActive] = useState(false);
  const [modeBitShake, setModeBitShake] = useState(false);

  const totalSteps = STEPS.length;
  const current = STEPS[currentStep]!;

  const handleNext = useCallback(() => {
    setCurrentStep((s) => {
      if (s < totalSteps - 1) return s + 1;
      setIsPlaying(false);
      return s;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const handleReset = useCallback(() => {
    setCurrentStep(0);
    setIsPlaying(false);
    setExceptionActive(false);
    setModeBitShake(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1800);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  const tryPrivileged = useCallback(() => {
    setExceptionActive(true);
    setModeBitShake(true);
    const shakeTimer = setTimeout(() => setModeBitShake(false), 500);
    const msgTimer = setTimeout(() => setExceptionActive(false), 2500);
    return () => {
      clearTimeout(shakeTimer);
      clearTimeout(msgTimer);
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Main diagram - ה-dir="ltr" מונע היפוך אופקי של ציר הזמן */}
      <div
        dir="ltr"
        className="relative h-80 overflow-hidden rounded-lg border bg-white dark:bg-slate-900/60"
      >
        {/* User Mode lane (top half) */}
        <div className="absolute inset-x-0 top-0 h-1/2 bg-green-50/70 dark:bg-green-950/20">
          <div className="absolute left-3 top-3 text-xs font-semibold text-green-700 dark:text-green-400">
            User Mode
          </div>
          <div className="absolute inset-x-8 top-14 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="rounded bg-white px-2 py-1 shadow-sm dark:bg-slate-800">
              User Code
            </span>
            <span className="rounded bg-white px-2 py-1 shadow-sm dark:bg-slate-800">
              printf() in libc
            </span>
            <span className="rounded bg-white px-2 py-1 shadow-sm dark:bg-slate-800">
              User Code (resumed)
            </span>
          </div>
        </div>

        {/* Divider: System Call Interface */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2">
          <div className="border-t-2 border-dashed border-slate-400 dark:border-slate-500" />
          <div className="absolute inset-x-0 -top-3 flex justify-center">
            <span className="rounded-full bg-slate-700 px-3 py-1 text-[10px] font-medium text-white dark:bg-slate-300 dark:text-slate-900">
              System Call Interface
            </span>
          </div>
        </div>

        {/* Kernel Mode lane (bottom half) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-amber-50/70 dark:bg-amber-950/20">
          <div className="absolute bottom-3 left-3 text-xs font-semibold text-amber-700 dark:text-amber-400">
            Kernel Mode
          </div>
          <div className="absolute inset-x-8 bottom-14 flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
            <span className="rounded bg-white px-2 py-1 shadow-sm dark:bg-slate-800">
              Kernel Entry
            </span>
            <span className="rounded bg-white px-2 py-1 shadow-sm dark:bg-slate-800">
              write() implementation
            </span>
            <span className="rounded bg-white px-2 py-1 shadow-sm dark:bg-slate-800">
              Driver / Hardware
            </span>
          </div>
        </div>

        {/* Mode Bit indicator (physical top-right) */}
        <motion.div
          animate={modeBitShake ? { x: [-4, 4, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute right-3 top-3"
        >
          <ModeBit value={current.modeBit} />
        </motion.div>

        {/* Trap flash icon */}
        <AnimatePresence>
          {current.showTrapFlash ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: [0, 1, 0], scale: [0.6, 1.3, 1] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white shadow-lg"
            >
              TRAP
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* Animated execution token */}
        <motion.div
          animate={{
            left: `${current.xPct}%`,
            top: `${current.yPct}%`,
          }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute -translate-x-1/2 -translate-y-1/2"
        >
          <motion.div
            animate={{
              backgroundColor: current.modeBit === 1 ? '#16a34a' : '#d97706',
            }}
            transition={{ duration: 0.5 }}
            className="whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-semibold text-white shadow-lg"
          >
            {current.tokenLabel}
          </motion.div>
        </motion.div>

        {/* Exception full-screen red flash */}
        <AnimatePresence>
          {exceptionActive ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.35, 0.25] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="pointer-events-none absolute inset-0 bg-red-500"
            />
          ) : null}
        </AnimatePresence>
      </div>

      {/* Hebrew caption */}
      <div
        className="rounded-md bg-muted p-4 text-sm leading-relaxed"
        dir="rtl"
      >
        <div className="mb-1 text-xs font-semibold text-muted-foreground">
          שלב {currentStep + 1} מתוך {totalSteps}
        </div>
        {current.caption}
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

      {/* Mini-panel: privileged instruction attempt */}
      <div className="rounded-lg border bg-card p-4" dir="rtl">
        <h4 className="mb-2 text-sm font-semibold">
          ניסוי: הוראת Clear Memory ממצב משתמש
        </h4>
        <p className="mb-3 text-xs text-muted-foreground">
          מה קורה כשתהליך ב-User Mode מנסה להפעיל הוראת privileged? לחץ על
          הכפתור ותראה.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="outline"
            onClick={tryPrivileged}
            disabled={exceptionActive}
          >
            נסה להריץ הוראת Clear Memory ממצב משתמש
          </Button>
          <AnimatePresence>
            {exceptionActive ? (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="rounded-md border border-red-300 bg-red-50 px-3 py-1.5 font-mono text-xs text-red-700 dark:border-red-900 dark:bg-red-950/50 dark:text-red-400"
                dir="ltr"
              >
                ⛔ Exception: privileged instruction attempted in user mode
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ModeBit({ value }: { value: 0 | 1 }) {
  const isUser = value === 1;
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white px-3 py-2 shadow-sm dark:bg-slate-800">
      <div className="flex flex-col text-[10px] leading-tight">
        <span className="font-medium text-slate-600 dark:text-slate-300">
          Mode Bit
        </span>
        <span className="text-[9px] text-muted-foreground">
          {isUser ? 'user mode' : 'kernel mode'}
        </span>
      </div>
      <motion.span
        animate={{ backgroundColor: isUser ? '#16a34a' : '#d97706' }}
        transition={{ duration: 0.5 }}
        className="flex h-8 w-8 items-center justify-center rounded-md text-base font-bold text-white"
      >
        {value}
      </motion.span>
    </div>
  );
}
