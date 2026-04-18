import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// השוואת I/O סינכרוני מול אסינכרוני.
// אותם 6 שלבים מוחלים על שני המודים; ההבדל הויזואלי: במוד sync התהליך
// חסום (אפור) בזמן שההתקן עובד, במוד async התהליך ממשיך לרוץ במקביל.

type Mode = 'sync' | 'async';
type ProcessState = 'active' | 'blocked';
type SubsystemState = 'active' | 'idle';
type ArrowId =
  | 'none'
  | 'proc-driver'
  | 'driver-hardware'
  | 'hardware-handler'
  | 'handler-proc';

interface Frame {
  process: ProcessState;
  driver: SubsystemState;
  hardware: SubsystemState;
  handler: SubsystemState;
  arrow: ArrowId;
  syncDescription: string;
  asyncDescription: string;
}

const STEPS: Frame[] = [
  {
    process: 'active',
    driver: 'idle',
    hardware: 'idle',
    handler: 'idle',
    arrow: 'none',
    syncDescription: 'התהליך רץ במצב User. עדיין לא ביצע System Call.',
    asyncDescription: 'התהליך רץ במצב User. עדיין לא ביצע System Call.',
  },
  {
    process: 'active',
    driver: 'active',
    hardware: 'idle',
    handler: 'idle',
    arrow: 'proc-driver',
    syncDescription:
      'התהליך מבצע System Call סינכרוני של קריאה. השליטה עוברת ל-Device Driver ב-Kernel.',
    asyncDescription:
      'התהליך מבצע System Call אסינכרוני. השליטה תחזור אליו מיד בשלב הבא.',
  },
  {
    process: 'blocked',
    driver: 'active',
    hardware: 'active',
    handler: 'idle',
    arrow: 'driver-hardware',
    syncDescription:
      'ה-Driver מפעיל את ההתקן. התהליך חסום (blocked) עד שההעברה תושלם.',
    asyncDescription:
      'ה-Driver מפעיל את ההתקן. השליטה חזרה מיד לתהליך - הוא ממשיך לעבוד בלי להמתין.',
  },
  {
    process: 'blocked',
    driver: 'idle',
    hardware: 'active',
    handler: 'idle',
    arrow: 'none',
    syncDescription:
      'ההתקן מעביר נתונים. התהליך ממשיך לחכות, המעבד פנוי לתהליכים אחרים.',
    asyncDescription:
      'ההתקן מעביר נתונים. במקביל, התהליך מבצע חישובים אחרים - אין זמן מבוזבז.',
  },
  {
    process: 'blocked',
    driver: 'idle',
    hardware: 'idle',
    handler: 'active',
    arrow: 'hardware-handler',
    syncDescription:
      'ההעברה הסתיימה. ההתקן שולח Interrupt וה-Handler מטפל בו ומעתיק את הנתונים.',
    asyncDescription:
      'ההעברה הסתיימה. Interrupt Handler מסמן שהנתונים מוכנים.',
  },
  {
    process: 'active',
    driver: 'idle',
    hardware: 'idle',
    handler: 'idle',
    arrow: 'handler-proc',
    syncDescription:
      'ה-Handler מעיר את התהליך ומחזיר לו שליטה. זמן כולל: זמן I/O + זמן חישוב.',
    asyncDescription:
      'התהליך כבר היה פעיל. הוא מקבל הודעה שהנתונים זמינים - זמן כולל: max(I/O, חישוב). חיסכון משמעותי!',
  },
];

const RUNNING = 'var(--color-state-running)';
const WAITING = 'var(--color-state-waiting)';
const READY = 'var(--color-state-ready)';
const BLOCKED_GRAY = '#94a3b8';

export default function SyncVsAsyncIO() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [ioDurationMs, setIoDurationMs] = useState(1500);
  const [mode, setMode] = useState<Mode>('sync');

  const totalSteps = STEPS.length;
  const raw = STEPS[currentStep]!;

  // במוד async - התהליך לא נחסם אף פעם (ממיר blocked → active).
  const current: Frame =
    mode === 'async' && raw.process === 'blocked'
      ? { ...raw, process: 'active' }
      : raw;

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

  // משך הצעד תלוי בסליידר - ככל שה-I/O ארוך יותר, האנימציה איטית יותר.
  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, Math.max(600, ioDurationMs / 2));
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext, ioDurationMs]);

  const description =
    mode === 'sync' ? current.syncDescription : current.asyncDescription;

  // חישוב זמן כולל מוצג
  const computeTimeMs = 500;
  const syncTotalMs = ioDurationMs + computeTimeMs;
  const asyncTotalMs = Math.max(ioDurationMs, computeTimeMs);
  const displayedTotal = mode === 'sync' ? syncTotalMs : asyncTotalMs;

  return (
    <div className="space-y-4">
      <Tabs value={mode} onValueChange={(v) => setMode(v as Mode)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sync">Synchronous — סינכרוני</TabsTrigger>
          <TabsTrigger value="async">Asynchronous — אסינכרוני</TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        className="relative rounded-lg border bg-white p-4 dark:bg-slate-900/60"
        dir="rtl"
      >
        <div className="mx-auto flex max-w-md flex-col gap-2">
          <Block
            title="תהליך משתמש"
            subtitle="User Process"
            color={current.process === 'active' ? RUNNING : BLOCKED_GRAY}
            label={current.process === 'active' ? 'פעיל' : 'חסום'}
            faded={current.process === 'blocked'}
          />
          <Arrow active={current.arrow === 'proc-driver'} direction="down" />
          <Block
            title="Device Driver"
            subtitle="מנהל ההתקן (Kernel)"
            color={current.driver === 'active' ? WAITING : '#cbd5e1'}
            label={current.driver === 'active' ? 'פעיל' : 'לא פעיל'}
            faded={current.driver === 'idle'}
          />
          <Arrow
            active={current.arrow === 'driver-hardware'}
            direction="down"
          />
          <Block
            title="Hardware I/O Transfer"
            subtitle="ההתקן מעביר נתונים"
            color={current.hardware === 'active' ? READY : '#cbd5e1'}
            label={current.hardware === 'active' ? 'מעביר' : 'לא פעיל'}
            faded={current.hardware === 'idle'}
          />
          <Arrow
            active={current.arrow === 'hardware-handler'}
            direction="up"
          />
          <Block
            title="Interrupt Handler"
            subtitle="מטפל בפסיקה (Kernel)"
            color={current.handler === 'active' ? WAITING : '#cbd5e1'}
            label={current.handler === 'active' ? 'פעיל' : 'לא פעיל'}
            faded={current.handler === 'idle'}
          />
        </div>

        {/* ערוץ חזרה מה-Handler לתהליך - פעיל בשלב האחרון */}
        {current.arrow === 'handler-proc' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pointer-events-none absolute inset-y-4 start-2 flex w-10 flex-col items-center justify-between"
            aria-hidden
          >
            <svg width="40" height="100%" viewBox="0 0 40 400" preserveAspectRatio="none">
              <path
                d="M 20 380 L 20 100 L 20 20"
                stroke="#ef4444"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                fill="none"
              />
              <polygon points="14,28 26,28 20,14" fill="#ef4444" />
            </svg>
          </motion.div>
        ) : null}
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed" dir="rtl">
        <div className="mb-1 text-xs font-semibold text-muted-foreground">
          שלב {currentStep + 1} מתוך {totalSteps} — מוד{' '}
          {mode === 'sync' ? 'סינכרוני' : 'אסינכרוני'}
        </div>
        {description}
      </div>

      <div
        className="flex items-center justify-between rounded-md border bg-background p-3 text-sm"
        dir="rtl"
      >
        <span className="font-medium">
          {mode === 'sync' ? 'זמן כולל (I/O + חישוב):' : 'זמן כולל max(I/O, חישוב):'}
        </span>
        <span className="font-mono font-semibold" dir="ltr">
          {displayedTotal}ms
        </span>
      </div>

      <div className="rounded-md border bg-background p-4" dir="rtl">
        <div className="mb-2 flex items-center justify-between text-sm">
          <label htmlFor="io-duration" className="font-medium">
            משך I/O
          </label>
          <span className="font-mono text-xs text-muted-foreground" dir="ltr">
            {ioDurationMs}ms
          </span>
        </div>
        <Slider
          id="io-duration"
          min={500}
          max={3000}
          step={100}
          value={[ioDurationMs]}
          onValueChange={(v) => setIoDurationMs(v[0] ?? 1500)}
        />
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

interface BlockProps {
  title: string;
  subtitle: string;
  color: string;
  label: string;
  faded: boolean;
}

function Block({ title, subtitle, color, label, faded }: BlockProps) {
  return (
    <motion.div
      animate={{ opacity: faded ? 0.45 : 1, scale: faded ? 0.98 : 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'flex items-center justify-between rounded-md border-2 p-3'
      )}
      style={{ borderColor: color, backgroundColor: `${color}20` }}
    >
      <div className="flex flex-col text-start">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs text-muted-foreground">{subtitle}</span>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
    </motion.div>
  );
}

interface ArrowProps {
  active: boolean;
  direction: 'up' | 'down';
}

function Arrow({ active, direction }: ArrowProps) {
  const color = active ? '#ef4444' : '#94a3b8';
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.25, y: active ? 0 : 0 }}
      transition={{ duration: 0.3 }}
      className="flex justify-center"
    >
      <svg width="22" height="28" viewBox="0 0 22 28">
        {direction === 'down' ? (
          <path
            d="M11 3 L11 22 M5 17 L11 23 L17 17"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : (
          <path
            d="M11 25 L11 6 M5 11 L11 5 L17 11"
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </motion.div>
  );
}
