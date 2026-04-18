import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { Slider } from '@/components/ui/slider';

// הדמיית Policy vs Mechanism על בסיס הדוגמה הקלאסית של timer + scheduler quantum:
// - המנגנון (Hardware Timer) קבוע ותמיד פועל.
// - המדיניות (Quantum בשחזור Round Robin) נקבעת על ידי ה-OS וניתנת לשינוי.

interface Snapshot {
  processIdx: number | null;
  mechanismEvent: 'idle' | 'ticking' | 'interrupt-fires';
  description: string;
}

const PROCESS_COLORS: readonly string[] = ['#3b82f6', '#8b5cf6', '#14b8a6'];
const PROCESS_LABELS: readonly string[] = ['P1', 'P2', 'P3'];

function buildSteps(quantumMs: number): Snapshot[] {
  return [
    {
      processIdx: null,
      mechanismEvent: 'idle',
      description:
        'המעבד פנוי. ה-timer (חומרה) מתחיל לתקתק אוטומטית - זהו המנגנון. ה-OS עדיין לא קיבל החלטה על התהליך הראשון.',
    },
    {
      processIdx: 0,
      mechanismEvent: 'ticking',
      description: `ה-scheduler בחר ב-P1 להתחיל (החלטה = policy). ה-timer ימשיך לתקתק ברקע ויפסיק את P1 אחרי ${quantumMs}ms - לפי המדיניות.`,
    },
    {
      processIdx: 1,
      mechanismEvent: 'interrupt-fires',
      description: `ה-timer ירה Interrupt אחרי ${quantumMs}ms. ה-scheduler החליט לעבור ל-P2 (Round Robin). שים לב: המנגנון לא השתנה - רק המדיניות ביצעה את הבחירה.`,
    },
    {
      processIdx: 2,
      mechanismEvent: 'interrupt-fires',
      description: `עוד Interrupt. ה-scheduler החליט לעבור ל-P3. אותו timer, אותו מנגנון - אבל המדיניות היא שעושה את העבודה.`,
    },
    {
      processIdx: 0,
      mechanismEvent: 'interrupt-fires',
      description: `עוד Interrupt. חזרנו ל-P1 - סיבוב Round Robin הושלם. נסה לשנות את ה-quantum בסליידר: ההתנהגות תשתנה, אבל המנגנון נשאר זהה.`,
    },
  ];
}

export default function PolicyMechanismDemo() {
  const [quantumMs, setQuantumMs] = useState(25);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo(() => buildSteps(quantumMs), [quantumMs]);
  const totalSteps = steps.length;
  const current = steps[currentStep]!;

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
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1500);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  const handleQuantumChange = (value: number[]) => {
    const v = value[0] ?? 25;
    setQuantumMs(v);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Gantt layout: 4 segments over `totalMs`, playhead at end of active segment
  const totalMs = 4 * quantumMs;
  const activeSegmentIdx = currentStep >= 1 ? currentStep - 1 : -1;
  const playheadMs =
    currentStep === 0 ? 0 : Math.min(currentStep, 4) * quantumMs;
  const toPct = (ms: number) => (ms / totalMs) * 100;

  return (
    <div className="space-y-4">
      {/* Top split: Mechanism (right) + Policy (left) */}
      <div className="grid gap-3 md:grid-cols-2" dir="rtl">
        {/* Mechanism — right side in RTL */}
        <div className="rounded-lg border-2 border-slate-400 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-900/60">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Mechanism
            </span>
            <span className="rounded-full bg-slate-300 px-2 py-0.5 text-[10px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
              קבוע
            </span>
          </div>
          <div className="mb-1 text-base font-bold">Hardware Timer</div>
          <p className="mb-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            תקתוק קבוע של החומרה. כשהספירה מגיעה ליעד - יורה Interrupt. לא תלוי ב-OS ולא משתנה בזמן ריצה.
          </p>
          <div className="flex items-center gap-2 rounded-md bg-white px-3 py-2 dark:bg-slate-800">
            <motion.div
              animate={{ scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}
              className="h-2.5 w-2.5 rounded-full bg-red-500"
            />
            <span className="font-mono text-xs text-slate-600 dark:text-slate-300">
              tick · tick · tick · tick
            </span>
          </div>
        </div>

        {/* Policy — left side in RTL */}
        <div className="rounded-lg border-2 border-blue-400 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/30">
          <div className="mb-1 flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-300">
              Policy
            </span>
            <span className="rounded-full bg-blue-200 px-2 py-0.5 text-[10px] font-semibold text-blue-800 dark:bg-blue-800 dark:text-blue-100">
              ניתן לשינוי
            </span>
          </div>
          <div className="mb-1 text-base font-bold">Scheduler Quantum</div>
          <p className="mb-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            ה-OS מחליט כמה זמן לתת לכל תהליך. בחירת quantum קצר = תגובה מהירה אבל הרבה context switches. ארוך = היפך.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label htmlFor="quantum-slider" className="font-medium">
                Quantum
              </label>
              <span className="font-mono text-xs font-semibold" dir="ltr">
                {quantumMs}ms
              </span>
            </div>
            <Slider
              id="quantum-slider"
              min={10}
              max={100}
              step={5}
              value={[quantumMs]}
              onValueChange={handleQuantumChange}
            />
          </div>
        </div>
      </div>

      {/* Round-Robin Gantt */}
      <div
        className="rounded-lg border bg-white p-4 dark:bg-slate-900/60"
        dir="ltr"
      >
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Round-Robin Timeline
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            total: {totalMs}ms
          </span>
        </div>
        <div className="relative h-14 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
          {[0, 1, 2, 3].map((segIdx) => {
            const procIdx = segIdx === 3 ? 0 : segIdx; // segment 3 = P1 again
            const isActive = segIdx === activeSegmentIdx;
            return (
              <motion.div
                key={segIdx}
                className="absolute inset-y-0 flex items-center justify-center border-s border-white text-xs font-bold text-white dark:border-slate-900"
                style={{
                  left: `${toPct(segIdx * quantumMs)}%`,
                  width: `${toPct(quantumMs)}%`,
                  backgroundColor: PROCESS_COLORS[procIdx],
                }}
                animate={{
                  opacity: isActive ? 1 : 0.4,
                  filter: isActive
                    ? 'brightness(1.1)'
                    : 'brightness(0.9) saturate(0.7)',
                }}
                transition={{ duration: 0.3 }}
              >
                {PROCESS_LABELS[procIdx]}
              </motion.div>
            );
          })}

          {/* Playhead */}
          <motion.div
            className="absolute bottom-0 top-0 w-[3px] bg-red-500 shadow-md"
            animate={{ left: `${toPct(playheadMs)}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>

        {/* Event indicator */}
        <div className="mt-3 flex items-center justify-center">
          <motion.div
            key={`event-${currentStep}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              current.mechanismEvent === 'interrupt-fires'
                ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                : current.mechanismEvent === 'ticking'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}
          >
            {current.mechanismEvent === 'interrupt-fires'
              ? '⏰ Timer Interrupt (מנגנון יורה)'
              : current.mechanismEvent === 'ticking'
              ? '⏱️ Timer counting…'
              : '— idle'}
          </motion.div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed" dir="rtl">
        <div className="mb-1 text-xs font-semibold text-muted-foreground">
          שלב {currentStep + 1} מתוך {totalSteps}
        </div>
        {current.description}
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
    </div>
  );
}
