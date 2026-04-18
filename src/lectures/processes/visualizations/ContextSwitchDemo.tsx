import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';

// הדמיית Context Switch: שמירת state של P1 ל-PCB-1 וטעינת state של P2 מ-PCB-2.
// ה-register pills משתמשים ב-layoutId של Framer Motion כדי לעוף בין הקופסאות.

type Location = 'cpu' | 'pcb1' | 'pcb2';

interface Step {
  runningPid: 1 | 2 | null;
  p1Location: Location;
  p2Location: Location;
  interrupt: boolean;
  description: string;
  overheadDeltaMs: number;
}

const REGS_P1: Record<string, string> = {
  PC: '0x1000',
  SP: '0xFF00',
  AX: '42',
  BX: '17',
};

const REGS_P2: Record<string, string> = {
  PC: '0x2000',
  SP: '0xF800',
  AX: '99',
  BX: '3',
};

const STEPS: Step[] = [
  {
    runningPid: 1,
    p1Location: 'cpu',
    p2Location: 'pcb2',
    interrupt: false,
    description:
      'P1 רץ על המעבד. ה-registers שלו נמצאים ב-CPU. P2 מחכה ב-Ready Queue - ה-state שלו שמור ב-PCB-2.',
    overheadDeltaMs: 0,
  },
  {
    runningPid: 1,
    p1Location: 'cpu',
    p2Location: 'pcb2',
    interrupt: true,
    description:
      'Interrupt מתרחש (למשל timer שפג או בקשת I/O). ה-OS מחליט לעשות context switch ל-P2.',
    overheadDeltaMs: 0,
  },
  {
    runningPid: null,
    p1Location: 'pcb1',
    p2Location: 'pcb2',
    interrupt: false,
    description:
      'שלב 1 - שמירה. הגרעין מעתיק את ה-registers של P1 מה-CPU אל PCB-1. בזמן הזה אף תהליך לא רץ באמת - זה overhead.',
    overheadDeltaMs: 1,
  },
  {
    runningPid: null,
    p1Location: 'pcb1',
    p2Location: 'cpu',
    interrupt: false,
    description:
      'שלב 2 - טעינה. הגרעין מעתיק את ה-registers של P2 מ-PCB-2 אל ה-CPU. עוד זמן overhead נצבר.',
    overheadDeltaMs: 1,
  },
  {
    runningPid: 2,
    p1Location: 'pcb1',
    p2Location: 'cpu',
    interrupt: false,
    description:
      'P2 רץ עכשיו. ה-PCB הוא מה שאפשר את השמירה והטעינה - בלי מבנה שמזהה את ה-state של כל תהליך, לא הייתה אפשרות להחליף ביניהם.',
    overheadDeltaMs: 0,
  },
];

export default function ContextSwitchDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = STEPS.length;
  const current = STEPS[currentStep]!;

  const overheadMs = STEPS.slice(0, currentStep + 1).reduce(
    (acc, s) => acc + s.overheadDeltaMs,
    0
  );

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
    const timer = setTimeout(handleNext, 1700);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  return (
    <div className="space-y-3">
      {/* Process cards */}
      <div className="grid grid-cols-2 gap-3" dir="rtl">
        <ProcessCard
          label="P1"
          sublabel="תהליך ראשון"
          color="#16a34a"
          active={current.runningPid === 1}
        />
        <ProcessCard
          label="P2"
          sublabel="תהליך שני"
          color="#2563eb"
          active={current.runningPid === 2}
        />
      </div>

      {/* Interrupt banner */}
      <AnimatePresence>
        {current.interrupt ? (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-md border-2 border-red-400 bg-red-50 p-2 text-center text-sm font-semibold text-red-700 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300"
            dir="rtl"
          >
            ⚡ Interrupt — ה-scheduler ניזום להחלפה
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* PCB-1 | CPU | PCB-2 */}
      <div className="grid grid-cols-3 gap-3" dir="rtl">
        <PCBBox pid={1} color="#16a34a" showingState={current.p1Location === 'pcb1'}>
          {current.p1Location === 'pcb1' ? renderRegs(REGS_P1, 1, '#16a34a') : null}
        </PCBBox>
        <CPUBox active={current.runningPid !== null}>
          {current.p1Location === 'cpu' ? renderRegs(REGS_P1, 1, '#16a34a') : null}
          {current.p2Location === 'cpu' ? renderRegs(REGS_P2, 2, '#2563eb') : null}
        </CPUBox>
        <PCBBox pid={2} color="#2563eb" showingState={current.p2Location === 'pcb2'}>
          {current.p2Location === 'pcb2' ? renderRegs(REGS_P2, 2, '#2563eb') : null}
        </PCBBox>
      </div>

      {/* Overhead counter */}
      <div
        className="flex items-center justify-between rounded-md border bg-background p-3 text-sm"
        dir="rtl"
      >
        <span className="text-muted-foreground">זמן overhead שהצטבר</span>
        <div className="flex items-center gap-2">
          <motion.span
            key={overheadMs}
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            className="font-mono text-base font-bold text-red-600 dark:text-red-400"
            dir="ltr"
          >
            {overheadMs}ms
          </motion.span>
          <span className="text-xs text-muted-foreground">
            (זמן ש-CPU לא הריץ קוד שימושי)
          </span>
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

function renderRegs(
  regs: Record<string, string>,
  pid: 1 | 2,
  color: string
): ReactNode {
  return (
    <div className="flex flex-wrap gap-1.5">
      {Object.entries(regs).map(([name, value]) => (
        <motion.div
          key={`reg-${pid}-${name}`}
          layoutId={`reg-${pid}-${name}`}
          layout
          transition={{ type: 'spring', stiffness: 280, damping: 30 }}
          className="flex items-center gap-1 rounded border px-1.5 py-0.5 font-mono text-[10px]"
          style={{
            backgroundColor: `${color}18`,
            borderColor: color,
            color,
          }}
        >
          <span className="font-bold">{name}</span>
          <span>{value}</span>
        </motion.div>
      ))}
    </div>
  );
}

interface ProcessCardProps {
  label: string;
  sublabel: string;
  color: string;
  active: boolean;
}

function ProcessCard({ label, sublabel, color, active }: ProcessCardProps) {
  return (
    <motion.div
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? `0 0 0 3px ${color}55`
          : '0 0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between rounded-lg border-2 p-3"
      style={{ borderColor: color, backgroundColor: `${color}15` }}
    >
      <div>
        <div className="text-base font-bold" style={{ color }}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground">{sublabel}</div>
      </div>
      <span
        className="rounded-full px-2 py-0.5 text-xs font-medium text-white"
        style={{ backgroundColor: active ? color : '#94a3b8' }}
      >
        {active ? 'Running' : 'Ready'}
      </span>
    </motion.div>
  );
}

interface PCBBoxProps {
  pid: 1 | 2;
  color: string;
  showingState: boolean;
  children?: ReactNode;
}

function PCBBox({ pid, color, showingState, children }: PCBBoxProps) {
  return (
    <div
      className="rounded-lg border-2 p-3"
      style={{ borderColor: color, backgroundColor: `${color}08` }}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className="font-mono text-[10px] font-bold uppercase"
          style={{ color }}
        >
          PCB-{pid}
        </span>
        <span className="text-[10px] text-muted-foreground" dir="ltr">
          {showingState ? 'saved state' : 'live on CPU'}
        </span>
      </div>
      <div className="min-h-[62px]">
        {children ?? (
          <div className="pt-2 text-[10px] italic text-slate-400">—</div>
        )}
      </div>
    </div>
  );
}

function CPUBox({
  active,
  children,
}: {
  active: boolean;
  children: ReactNode;
}) {
  return (
    <motion.div
      animate={{
        scale: active ? 1.03 : 1,
        boxShadow: active
          ? '0 0 0 3px rgba(239, 68, 68, 0.45)'
          : '0 0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className="rounded-lg border-2 border-slate-400 bg-slate-50 p-3 dark:border-slate-500 dark:bg-slate-800/60"
    >
      <div className="mb-1 flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
          CPU
        </span>
        <span className="text-[10px] text-muted-foreground" dir="ltr">
          {active ? 'running' : 'transition'}
        </span>
      </div>
      <div className="min-h-[62px]">
        {children || (
          <div className="pt-2 text-[10px] italic text-slate-400">(empty)</div>
        )}
      </div>
    </motion.div>
  );
}
