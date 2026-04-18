import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// שלוש שיטות להעביר פרמטרים ל-System Call: רגיסטרים, טבלה בזיכרון, ערימה.

type Method = 'registers' | 'block' | 'stack';

interface Param {
  id: string;
  label: string;
  color: string;
}

const PARAMS: Param[] = [
  { id: 'fd', label: 'fd = 3', color: '#6366f1' },
  { id: 'buf', label: 'buf = 0x1000', color: '#14b8a6' },
  { id: 'count', label: 'count = 64', color: '#f43f5e' },
];

const METHOD_STEPS: Record<Method, { count: number; captions: string[] }> = {
  registers: {
    count: 5,
    captions: [
      'התהליך החזיק את הפרמטרים בזיכרון שלו. נטען כעת אותם לרגיסטרים של המעבד.',
      'fd עובר לרגיסטר R1.',
      'buf עובר לרגיסטר R2.',
      'count עובר לרגיסטר R3. כל הפרמטרים מוכנים לקריאת המערכת.',
      'System Call בוצע - הגרעין קורא את הפרמטרים ישירות מהרגיסטרים. מהיר, אך מוגבל למספר הרגיסטרים הזמינים.',
    ],
  },
  block: {
    count: 5,
    captions: [
      'התהליך מכין טבלת פרמטרים בזיכרון שלו.',
      'הערכים נכתבים לתוך הטבלה.',
      'הכתובת של הטבלה נשמרת ברגיסטר R1.',
      'System Call בוצע - ל-Kernel יש רק את הכתובת.',
      'הגרעין ניגש לטבלה דרך הכתובת וקורא את הפרמטרים. אין הגבלה על מספר/אורך פרמטרים. בשימוש ב-Linux ו-Solaris.',
    ],
  },
  stack: {
    count: 5,
    captions: [
      'התהליך מחזיק את הפרמטרים בזיכרון. הערימה ריקה.',
      'הפרמטר הראשון (fd) נדחף לערימה (push).',
      'הפרמטר השני (buf) נדחף.',
      'הפרמטר השלישי (count) נדחף. הערימה מלאה.',
      'System Call בוצע - הגרעין מחלץ (pop) את הפרמטרים בסדר הפוך. שיטה נפוצה, אין הגבלה על כמות.',
    ],
  },
};

export default function ParameterPassingDemo() {
  const [method, setMethod] = useState<Method>('registers');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = METHOD_STEPS[method].count;
  const caption = METHOD_STEPS[method].captions[step] ?? '';

  const handleNext = useCallback(() => {
    setStep((s) => {
      if (s < totalSteps - 1) return s + 1;
      setIsPlaying(false);
      return s;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1600);
    return () => clearTimeout(timer);
  }, [isPlaying, step, handleNext]);

  const changeMethod = (m: Method) => {
    setMethod(m);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <Tabs value={method} onValueChange={(v) => changeMethod(v as Method)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="registers">Registers</TabsTrigger>
          <TabsTrigger value="block">Block / Table</TabsTrigger>
          <TabsTrigger value="stack">Stack</TabsTrigger>
        </TabsList>
      </Tabs>

      <div
        dir="ltr"
        className="rounded-lg border bg-white p-4 dark:bg-slate-900/60"
      >
        {method === 'registers' ? <RegistersMethod step={step} /> : null}
        {method === 'block' ? <BlockMethod step={step} /> : null}
        {method === 'stack' ? <StackMethod step={step} /> : null}
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed" dir="rtl">
        <div className="mb-1 text-xs font-semibold text-muted-foreground">
          שלב {step + 1} מתוך {totalSteps} — {labelFor(method)}
        </div>
        {caption}
      </div>

      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={step > 0}
        canGoForward={step < totalSteps - 1}
      />
    </div>
  );
}

function labelFor(m: Method): string {
  if (m === 'registers') return 'רגיסטרים';
  if (m === 'block') return 'Block / Table';
  return 'Stack';
}

// ---------- Shared UI ----------
function ParamPill({ param, size = 'normal' }: { param: Param; size?: 'small' | 'normal' }) {
  return (
    <motion.div
      layoutId={param.id}
      layout
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className={`inline-flex items-center justify-center rounded-md font-mono text-white shadow-sm ${
        size === 'small' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      }`}
      style={{ backgroundColor: param.color }}
    >
      {param.label}
    </motion.div>
  );
}

function UserProgramBox({ children }: { children: ReactNode }) {
  return (
    <div className="flex-1 rounded-md border-2 border-blue-400 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-950/20">
      <div className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
        User Program
      </div>
      <div className="flex min-h-[120px] flex-col gap-1">{children}</div>
    </div>
  );
}

function KernelBox({ active, children }: { active: boolean; children?: React.ReactNode }) {
  return (
    <motion.div
      animate={{
        scale: active ? 1.02 : 1,
        boxShadow: active
          ? '0 0 0 3px rgba(239, 68, 68, 0.55)'
          : '0 0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className="flex-1 rounded-md border-2 border-amber-400 bg-amber-50/50 p-3 dark:border-amber-700 dark:bg-amber-950/20"
    >
      <div className="mb-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
        Kernel
      </div>
      <div className="min-h-[120px]">{children}</div>
    </motion.div>
  );
}

function SyscallArrow({ active }: { active: boolean }) {
  return (
    <motion.div
      animate={{ opacity: active ? 1 : 0.3 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center px-2"
    >
      <svg width="60" height="28" viewBox="0 0 60 28" aria-hidden>
        <path
          d="M2 14 L52 14 M46 8 L54 14 L46 20"
          stroke={active ? '#ef4444' : '#94a3b8'}
          strokeWidth={2.5}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div
        className="mt-1 text-[10px] font-semibold"
        style={{ color: active ? '#ef4444' : '#94a3b8' }}
      >
        syscall
      </div>
    </motion.div>
  );
}

// ---------- Registers Method ----------
function RegistersMethod({ step }: { step: number }) {
  // Step 0: all in user. Step 1-3: params gradually move to R1-R3. Step 4: syscall + kernel reads.
  const paramInRegister = (i: number): boolean => step > i && step < 4;
  const paramInUser = (i: number): boolean => step <= i;
  const paramInKernel = step >= 4;

  const REGISTERS = ['R1', 'R2', 'R3', 'R4'];

  return (
    <div className="flex items-stretch gap-3">
      <UserProgramBox>
        {PARAMS.map((p, i) =>
          paramInUser(i) ? <ParamPill key={p.id} param={p} /> : null
        )}
      </UserProgramBox>

      <SyscallArrow active={step === 4} />

      <div className="flex-1 rounded-md border-2 border-purple-400 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-950/20">
        <div className="mb-2 text-xs font-semibold text-purple-700 dark:text-purple-400">
          CPU Registers
        </div>
        <div className="space-y-1.5">
          {REGISTERS.map((reg, i) => (
            <div key={reg} className="flex items-center gap-2">
              <span className="w-7 font-mono text-xs text-slate-600 dark:text-slate-300">
                {reg}
              </span>
              <div className="flex min-h-[26px] flex-1 items-center rounded border border-dashed border-slate-300 px-1 dark:border-slate-600">
                {i < PARAMS.length && paramInRegister(i) ? (
                  <ParamPill param={PARAMS[i]!} />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      <SyscallArrow active={step === 4} />

      <KernelBox active={step === 4}>
        <div className="flex flex-wrap gap-1">
          {paramInKernel
            ? PARAMS.map((p) => <ParamPill key={p.id} param={p} size="small" />)
            : null}
        </div>
        {step === 4 ? (
          <div className="mt-2 font-mono text-[10px] text-amber-700 dark:text-amber-400">
            read params from R1-R3 ✓
          </div>
        ) : null}
      </KernelBox>
    </div>
  );
}

// ---------- Block / Table Method ----------
function BlockMethod({ step }: { step: number }) {
  // Step 0: params in user, block empty. Step 1: block filled. Step 2: R1 holds address.
  // Step 3: syscall. Step 4: kernel reads via pointer.
  const paramsInBlock = step >= 1 && step < 4;
  const paramsInUser = step === 0;
  const addressInRegister = step >= 2 && step < 4;
  const syscallActive = step === 3;
  const kernelReading = step === 4;

  return (
    <div className="flex items-stretch gap-3">
      <div className="flex-1 rounded-md border-2 border-blue-400 bg-blue-50/50 p-3 dark:border-blue-700 dark:bg-blue-950/20">
        <div className="mb-2 text-xs font-semibold text-blue-700 dark:text-blue-400">
          User Program
        </div>
        <div className="min-h-[80px] space-y-1">
          {paramsInUser
            ? PARAMS.map((p) => <ParamPill key={p.id} param={p} />)
            : null}
        </div>

        {/* Parameters Table */}
        <div className="mt-3 rounded border-2 border-slate-300 bg-white p-2 dark:border-slate-600 dark:bg-slate-800">
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
              Parameters Table
            </span>
            <span className="font-mono text-[10px] text-slate-500">
              addr: 0x8000
            </span>
          </div>
          <div className="space-y-1">
            {PARAMS.map((p, i) => (
              <div
                key={p.id}
                className="flex items-center gap-2 rounded border border-slate-200 px-1 py-0.5 dark:border-slate-700"
              >
                <span className="w-16 font-mono text-[10px] text-slate-400">
                  row {i}
                </span>
                {paramsInBlock || kernelReading ? (
                  <ParamPill param={p} size="small" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>

      <SyscallArrow active={syscallActive} />

      <div className="flex flex-1 flex-col gap-3">
        <div className="rounded-md border-2 border-purple-400 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-950/20">
          <div className="mb-2 text-xs font-semibold text-purple-700 dark:text-purple-400">
            CPU Register
          </div>
          <div className="flex items-center gap-2">
            <span className="w-7 font-mono text-xs text-slate-600 dark:text-slate-300">
              R1
            </span>
            <div className="flex min-h-[26px] flex-1 items-center rounded border border-dashed border-slate-300 px-1 dark:border-slate-600">
              <AnimatePresence mode="wait">
                {addressInRegister ? (
                  <motion.div
                    key="addr"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="rounded bg-slate-700 px-2 py-0.5 font-mono text-[10px] text-white dark:bg-slate-200 dark:text-slate-900"
                  >
                    &table = 0x8000
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <KernelBox active={syscallActive || kernelReading}>
          {kernelReading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="font-mono text-[10px] text-amber-700 dark:text-amber-400"
            >
              *addr → read 3 params ✓
            </motion.div>
          ) : null}
        </KernelBox>
      </div>
    </div>
  );
}

// ---------- Stack Method ----------
function StackMethod({ step }: { step: number }) {
  // Step 0: all in user. Steps 1-3: each param pushed onto stack in order.
  // Step 4: syscall + kernel pops params.
  const paramInUser = (i: number): boolean => step <= i;
  const paramOnStack = (i: number): boolean => step > i && step < 4;
  const paramInKernel = step >= 4;

  const stackItems = PARAMS.filter((_, i) => paramOnStack(i));

  return (
    <div className="flex items-stretch gap-3">
      <UserProgramBox>
        {PARAMS.map((p, i) =>
          paramInUser(i) ? <ParamPill key={p.id} param={p} /> : null
        )}
      </UserProgramBox>

      <SyscallArrow active={step === 4} />

      <div className="flex-1 rounded-md border-2 border-purple-400 bg-purple-50/50 p-3 dark:border-purple-700 dark:bg-purple-950/20">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-purple-700 dark:text-purple-400">
            Stack
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            SP → top
          </span>
        </div>
        <div className="flex min-h-[160px] flex-col-reverse gap-1 rounded border-2 border-dashed border-purple-300 bg-white/50 p-2 dark:border-purple-800 dark:bg-slate-800/50">
          {stackItems.length === 0 ? (
            <div className="text-center text-[10px] text-slate-400">(empty)</div>
          ) : (
            stackItems.map((p) => <ParamPill key={p.id} param={p} />)
          )}
        </div>
      </div>

      <SyscallArrow active={step === 4} />

      <KernelBox active={step === 4}>
        <div className="flex flex-wrap gap-1">
          {paramInKernel
            ? PARAMS.map((p) => <ParamPill key={p.id} param={p} size="small" />)
            : null}
        </div>
        {step === 4 ? (
          <div className="mt-2 font-mono text-[10px] text-amber-700 dark:text-amber-400">
            pop × 3 ✓
          </div>
        ) : null}
      </KernelBox>
    </div>
  );
}
