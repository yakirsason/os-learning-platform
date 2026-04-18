import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';

// הדמיית יצירת תהליכים ב-UNIX: fork/exec/wait/exit. הקוד ב-LTR, תהליכים ב-RTL.

type ProcStatus = 'running' | 'blocked' | 'terminated';

interface ProcessView {
  id: string;
  label: string;
  pid: number;
  forkReturn: number | null;
  program: string;
  status: ProcStatus;
  color: string;
}

interface Step {
  processes: ProcessView[];
  highlightedLines: number[];
  description: string;
}

const CODE_LINES: string[] = [
  'int main() {',
  '  pid_t pid = fork();',
  '  if (pid == 0) {',
  '    // child',
  '    exec("/bin/ls");',
  '  } else {',
  '    // parent',
  '    wait(NULL);',
  '  }',
  '  exit(0);',
  '}',
];

const PARENT_COLOR = '#2563eb';
const CHILD_COLOR = '#8b5cf6';

const STEPS: Step[] = [
  {
    processes: [
      {
        id: 'p0',
        label: 'Parent',
        pid: 1000,
        forkReturn: null,
        program: 'main',
        status: 'running',
        color: PARENT_COLOR,
      },
    ],
    highlightedLines: [1],
    description:
      'במערכת רק תהליך אחד - ה-Parent. עומד לקרוא ל-fork(). עדיין אין child.',
  },
  {
    processes: [
      {
        id: 'p0',
        label: 'Parent',
        pid: 1000,
        forkReturn: 1001,
        program: 'main',
        status: 'running',
        color: PARENT_COLOR,
      },
      {
        id: 'p1',
        label: 'Child',
        pid: 1001,
        forkReturn: 0,
        program: 'main',
        status: 'running',
        color: CHILD_COLOR,
      },
    ],
    highlightedLines: [2],
    description:
      'fork() יצר עותק מלא של ה-Parent. יש עכשיו שני תהליכים - אותו קוד, אותו זיכרון. ההבדל היחיד: ערך ההחזרה של fork() (1001 אצל Parent, 0 אצל Child).',
  },
  {
    processes: [
      {
        id: 'p0',
        label: 'Parent',
        pid: 1000,
        forkReturn: 1001,
        program: 'main',
        status: 'running',
        color: PARENT_COLOR,
      },
      {
        id: 'p1',
        label: 'Child',
        pid: 1001,
        forkReturn: 0,
        program: 'main',
        status: 'running',
        color: CHILD_COLOR,
      },
    ],
    highlightedLines: [3],
    description:
      'שני התהליכים בודקים את ה-pid. Parent: pid=1001 (if false → else). Child: pid=0 (if true → בלוק ראשון). כך כל אחד לוקח מסלול אחר.',
  },
  {
    processes: [
      {
        id: 'p0',
        label: 'Parent',
        pid: 1000,
        forkReturn: 1001,
        program: 'main',
        status: 'blocked',
        color: PARENT_COLOR,
      },
      {
        id: 'p1',
        label: 'Child',
        pid: 1001,
        forkReturn: 0,
        program: '/bin/ls',
        status: 'running',
        color: CHILD_COLOR,
      },
    ],
    highlightedLines: [5, 8],
    description:
      'ה-Child קרא ל-exec("/bin/ls") - הקוד שלו הוחלף ב-ls. ה-Parent במקביל קרא ל-wait(NULL) ונחסם עד שה-Child יסיים.',
  },
  {
    processes: [
      {
        id: 'p0',
        label: 'Parent',
        pid: 1000,
        forkReturn: 1001,
        program: 'main',
        status: 'blocked',
        color: PARENT_COLOR,
      },
      {
        id: 'p1',
        label: 'Child',
        pid: 1001,
        forkReturn: 0,
        program: '/bin/ls',
        status: 'terminated',
        color: CHILD_COLOR,
      },
    ],
    highlightedLines: [5],
    description:
      'ה-Child סיים את ls ויצא. הגרעין שומר את ה-exit status ומעיר את ה-Parent שחיכה.',
  },
  {
    processes: [
      {
        id: 'p0',
        label: 'Parent',
        pid: 1000,
        forkReturn: 1001,
        program: 'main',
        status: 'running',
        color: PARENT_COLOR,
      },
    ],
    highlightedLines: [10],
    description:
      'wait() החזיר ל-Parent עם ה-exit code של ה-Child. ה-Child נוקה לגמרי מהמערכת. ה-Parent ממשיך ל-exit(0).',
  },
  {
    processes: [],
    highlightedLines: [10],
    description:
      'ה-Parent יצא גם הוא. לא נותרו תהליכים. מחזור חיים שלם: fork → שתי execution flows → exec → wait → exit → exit.',
  },
];

export default function ProcessCreationDemo() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

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
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1900);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-[1fr_280px]">
        {/* Code view - LTR */}
        <div
          dir="ltr"
          className="overflow-hidden rounded-lg border bg-slate-900 font-mono text-xs dark:bg-slate-950"
        >
          <div className="border-b border-slate-800 bg-slate-800/50 px-3 py-1.5 text-[10px] text-slate-400">
            example.c
          </div>
          <div className="py-2">
            {CODE_LINES.map((line, i) => {
              const lineNum = i + 1;
              const isHighlighted = current.highlightedLines.includes(lineNum);
              return (
                <div
                  key={i}
                  className={`flex items-center px-2 py-0.5 transition-colors ${
                    isHighlighted ? 'bg-blue-500/20' : ''
                  }`}
                >
                  <span className="w-6 shrink-0 select-none text-right text-slate-600">
                    {lineNum}
                  </span>
                  <span className="ms-3 whitespace-pre text-slate-100">
                    {line || '\u00A0'}
                  </span>
                  {isHighlighted ? (
                    <span className="ms-2 text-[10px] text-blue-400">
                      ← active
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>

        {/* Process tree - RTL */}
        <div className="space-y-2" dir="rtl">
          <div className="text-xs font-semibold text-muted-foreground">
            תהליכים פעילים
          </div>
          <AnimatePresence mode="popLayout">
            {current.processes.map((proc) => (
              <motion.div
                key={proc.id}
                layout
                initial={{ opacity: 0, scale: 0.85, y: -10 }}
                animate={{
                  opacity: proc.status === 'terminated' ? 0.55 : 1,
                  scale: 1,
                  y: 0,
                }}
                exit={{ opacity: 0, scale: 0.85, y: 10 }}
                transition={{ duration: 0.35 }}
                className="rounded-lg border-2 p-3"
                style={{
                  borderColor: proc.color,
                  backgroundColor: `${proc.color}15`,
                }}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <div className="text-sm font-bold" style={{ color: proc.color }}>
                    {proc.label}
                  </div>
                  <StatusBadge status={proc.status} color={proc.color} />
                </div>
                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between" dir="ltr">
                    <span className="font-mono text-muted-foreground">pid</span>
                    <span className="font-mono font-semibold">{proc.pid}</span>
                  </div>
                  <div className="flex justify-between" dir="ltr">
                    <span className="font-mono text-muted-foreground">program</span>
                    <span className="font-mono font-semibold">{proc.program}</span>
                  </div>
                  {proc.forkReturn !== null ? (
                    <div
                      className="mt-1 rounded bg-white/60 px-2 py-0.5 font-mono text-[10px] dark:bg-slate-900/50"
                      dir="ltr"
                    >
                      fork() returned {proc.forkReturn}
                    </div>
                  ) : null}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {current.processes.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-slate-300 p-4 text-center text-xs text-slate-500 dark:border-slate-700">
              אין תהליכים פעילים
            </div>
          ) : null}
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

      {/* Edge cases */}
      <div className="grid gap-3 md:grid-cols-3" dir="rtl">
        <div className="rounded-lg border-2 border-yellow-400 bg-yellow-50 p-3 dark:border-yellow-800 dark:bg-yellow-950/20">
          <div className="mb-1 text-xs font-bold uppercase text-yellow-700 dark:text-yellow-300">
            Zombie
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            ה-Child סיים (exit) אבל ה-Parent לא קרא ל-wait(). התהליך תופס מקום
            בטבלת התהליכים אבל לא רץ. נעלם רק כש-Parent יקרא wait.
          </p>
        </div>
        <div className="rounded-lg border-2 border-purple-400 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-950/20">
          <div className="mb-1 text-xs font-bold uppercase text-purple-700 dark:text-purple-300">
            Orphan
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            ה-Parent סיים לפני ה-Child. ה-Child "מאומץ" על ידי תהליך init (pid=1),
            שמבצע wait עבורו - למנוע zombie.
          </p>
        </div>
        <div className="rounded-lg border-2 border-rose-400 bg-rose-50 p-3 dark:border-rose-800 dark:bg-rose-950/20">
          <div className="mb-1 text-xs font-bold uppercase text-rose-700 dark:text-rose-300">
            Cascading Termination
          </div>
          <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-200">
            בחלק מהמערכות: כש-Parent מסתיים - כל ה-Children שלו מסתיימים
            אוטומטית. תלוי ב-OS ובהחלטה שלו.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({
  status,
  color,
}: {
  status: ProcStatus;
  color: string;
}) {
  const bgColor =
    status === 'running'
      ? color
      : status === 'blocked'
      ? '#f59e0b'
      : '#94a3b8';
  return (
    <span
      className="rounded-full px-2 py-0.5 font-mono text-[10px] font-medium text-white"
      style={{ backgroundColor: bgColor }}
    >
      {status}
    </span>
  );
}
