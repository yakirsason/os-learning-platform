import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StepController from '@/components/common/StepController';

// הדמיית תורי תזמון: תהליך עובר מ-Job Queue → Ready Queue → CPU,
// ומדי פעם קופץ ל-Device Queue בזמן I/O. בתחתית: השוואה CPU-bound / I/O-bound.

type Location =
  | 'incoming'
  | 'jobQueue'
  | 'readyQueue'
  | 'cpu'
  | 'deviceQueue'
  | 'terminated';

interface Step {
  tokenLocation: Location;
  activeArrow: string | null;
  description: string;
}

const STEPS: Step[] = [
  {
    tokenLocation: 'incoming',
    activeArrow: null,
    description:
      'תהליך חדש מגיע מחוץ למערכת (המשתמש הפעיל אפליקציה חדשה, או תהליך קיים יצר אותו).',
  },
  {
    tokenLocation: 'jobQueue',
    activeArrow: 'in-to-job',
    description:
      'התהליך מחכה ב-Job Queue. זה התור של תהליכים שרצים להיכנס למערכת אבל עדיין לא הוקצו להם משאבי זיכרון.',
  },
  {
    tokenLocation: 'readyQueue',
    activeArrow: 'job-to-ready',
    description:
      'ה-long-term scheduler החליט שיש מקום בזיכרון. התהליך עובר ל-Ready Queue. השאלה שהוא עונה: "כמה תהליכים יהיו במערכת בו-זמנית" - נקראת degree of multiprogramming.',
  },
  {
    tokenLocation: 'cpu',
    activeArrow: 'ready-to-cpu',
    description:
      'ה-short-term scheduler בחר את התהליך מ-Ready Queue ודחף אותו ל-CPU. זה המתזמן הכי "עסוק" - הוא מתרחש עשרות עד מאות פעמים בשנייה.',
  },
  {
    tokenLocation: 'deviceQueue',
    activeArrow: 'cpu-to-device',
    description:
      'התהליך ביקש I/O (למשל קריאה מדיסק). הוא עובר ל-Device Queue של ההתקן המתאים וממתין שם. בינתיים ה-scheduler בוחר תהליך אחר להריץ.',
  },
  {
    tokenLocation: 'readyQueue',
    activeArrow: 'device-to-ready',
    description:
      'ה-I/O הסתיים (Interrupt). התהליך חוזר ל-Ready Queue, לא ישר ל-CPU - הוא צריך לחכות לתורו שוב.',
  },
  {
    tokenLocation: 'cpu',
    activeArrow: 'ready-to-cpu',
    description:
      'ה-short-term scheduler שוב בחר בו. ממשיך לרוץ.',
  },
  {
    tokenLocation: 'terminated',
    activeArrow: 'cpu-to-term',
    description:
      'התהליך סיים. המערכת משחררת את משאביו. במציאות - זו נקודה שבה ה-long-term scheduler יכול להכניס תהליך חדש מ-Job Queue.',
  },
];

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  sublabel?: string;
}

const BOXES: Record<string, Box> = {
  jobQueue: { x: 70, y: 80, w: 120, h: 60, label: 'Job Queue', sublabel: 'מחכים לזיכרון' },
  readyQueue: { x: 250, y: 80, w: 120, h: 60, label: 'Ready Queue', sublabel: 'מחכים ל-CPU' },
  cpu: { x: 430, y: 80, w: 120, h: 60, label: 'CPU', sublabel: 'running' },
  terminated: { x: 610, y: 80, w: 120, h: 60, label: 'Terminated' },
  deviceQueue: { x: 340, y: 220, w: 140, h: 60, label: 'Device Queue', sublabel: 'מחכים ל-I/O' },
};

const TOKEN_POSITIONS: Record<Location, { x: number; y: number }> = {
  incoming: { x: 20, y: 110 },
  jobQueue: { x: 130, y: 110 },
  readyQueue: { x: 310, y: 110 },
  cpu: { x: 490, y: 110 },
  deviceQueue: { x: 410, y: 250 },
  terminated: { x: 670, y: 110 },
};

interface ArrowDef {
  id: string;
  d: string;
  label: string;
  labelX: number;
  labelY: number;
}

const ARROWS: ArrowDef[] = [
  { id: 'in-to-job', d: 'M 25 110 L 65 110', label: '', labelX: 0, labelY: 0 },
  {
    id: 'job-to-ready',
    d: 'M 195 110 L 245 110',
    label: 'long-term',
    labelX: 220,
    labelY: 102,
  },
  {
    id: 'ready-to-cpu',
    d: 'M 375 110 L 425 110',
    label: 'short-term',
    labelX: 400,
    labelY: 102,
  },
  {
    id: 'cpu-to-term',
    d: 'M 555 110 L 605 110',
    label: 'exit',
    labelX: 580,
    labelY: 102,
  },
  {
    id: 'cpu-to-device',
    d: 'M 490 145 L 450 215',
    label: 'I/O request',
    labelX: 528,
    labelY: 185,
  },
  {
    id: 'device-to-ready',
    d: 'M 410 215 L 310 145',
    label: 'I/O complete',
    labelX: 322,
    labelY: 190,
  },
];

export default function SchedulerQueuesExplorer() {
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
    const timer = setTimeout(handleNext, 1700);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  const tokenPos = TOKEN_POSITIONS[current.tokenLocation];

  return (
    <div className="space-y-4">
      {/* Main diagram */}
      <div
        dir="ltr"
        className="rounded-lg border bg-white p-4 dark:bg-slate-900/60"
      >
        <svg
          viewBox="0 0 760 320"
          className="h-auto w-full"
          role="img"
          aria-label="Process scheduling queues diagram"
        >
          <defs>
            <marker
              id="arrowhead-sq"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,0 10,3.5 0,7" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowhead-sq-active"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,0 10,3.5 0,7" fill="#ef4444" />
            </marker>
          </defs>

          {/* Boxes */}
          {Object.entries(BOXES).map(([key, box]) => (
            <g key={key}>
              <rect
                x={box.x}
                y={box.y}
                width={box.w}
                height={box.h}
                rx={8}
                className="fill-slate-100 stroke-slate-400 dark:fill-slate-800 dark:stroke-slate-500"
                strokeWidth={1.5}
              />
              <text
                x={box.x + box.w / 2}
                y={box.y + (box.sublabel ? box.h / 2 - 3 : box.h / 2 + 4)}
                textAnchor="middle"
                className="fill-slate-800 dark:fill-slate-100"
                fontSize={13}
                fontWeight={700}
              >
                {box.label}
              </text>
              {box.sublabel ? (
                <text
                  x={box.x + box.w / 2}
                  y={box.y + box.h / 2 + 13}
                  textAnchor="middle"
                  className="fill-slate-500 dark:fill-slate-400"
                  fontSize={9}
                >
                  {box.sublabel}
                </text>
              ) : null}
            </g>
          ))}

          {/* Arrows */}
          {ARROWS.map((a) => {
            const isActive = current.activeArrow === a.id;
            return (
              <g key={a.id}>
                <motion.path
                  d={a.d}
                  stroke={isActive ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isActive ? 2.5 : 1.5}
                  fill="none"
                  markerEnd={
                    isActive
                      ? 'url(#arrowhead-sq-active)'
                      : 'url(#arrowhead-sq)'
                  }
                  initial={false}
                  animate={{ opacity: isActive ? 1 : 0.5 }}
                  transition={{ duration: 0.3 }}
                />
                {a.label ? (
                  <text
                    x={a.labelX}
                    y={a.labelY}
                    textAnchor="middle"
                    fontSize={10}
                    fontWeight={isActive ? 700 : 400}
                    className={
                      isActive
                        ? 'fill-red-600 dark:fill-red-400'
                        : 'fill-slate-500 dark:fill-slate-400'
                    }
                  >
                    {a.label}
                  </text>
                ) : null}
              </g>
            );
          })}

          {/* Process token */}
          <motion.g
            animate={{ x: tokenPos.x, y: tokenPos.y }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
            initial={false}
          >
            <circle
              r={16}
              fill="#8b5cf6"
              stroke="white"
              strokeWidth={2}
              filter="drop-shadow(0 2px 4px rgba(0,0,0,0.2))"
            />
            <text
              textAnchor="middle"
              y={5}
              fill="white"
              fontSize={13}
              fontWeight={700}
              style={{ pointerEvents: 'none' }}
            >
              P
            </text>
          </motion.g>
        </svg>

        {/* Medium-term scheduler note */}
        <div
          className="mt-3 rounded-md border border-dashed border-slate-300 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800/50"
          dir="rtl"
        >
          <strong>Medium-term scheduler</strong> (לא מוצג): מחליט להוציא זמנית
          תהליכים מהזיכרון ל-swap space כשהזיכרון עמוס, ולהחזיר אותם אחר כך.
          קיים במערכות עם swapping.
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

      {/* CPU-bound vs I/O-bound comparison */}
      <div className="grid gap-3 md:grid-cols-2" dir="rtl">
        <div className="rounded-lg border-2 border-emerald-300 bg-emerald-50/60 p-3 dark:border-emerald-800 dark:bg-emerald-950/20">
          <div className="mb-1 text-xs font-bold uppercase text-emerald-700 dark:text-emerald-300">
            CPU-bound
          </div>
          <div className="mb-2 text-sm font-semibold">
            התהליך מבלה רוב הזמן על המעבד
          </div>
          <p className="mb-2 text-xs text-slate-700 dark:text-slate-300">
            כמעט ולא מבקש I/O. דוגמאות: חישובים מדעיים, מזרחם, קומפילציה.
          </p>
          <BurstPattern pattern="cpu-bound" />
        </div>
        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-3 dark:border-amber-800 dark:bg-amber-950/20">
          <div className="mb-1 text-xs font-bold uppercase text-amber-700 dark:text-amber-300">
            I/O-bound
          </div>
          <div className="mb-2 text-sm font-semibold">
            התהליך מבלה רוב הזמן בהמתנה ל-I/O
          </div>
          <p className="mb-2 text-xs text-slate-700 dark:text-slate-300">
            CPU bursts קצרים, הרבה קריאות דיסק/רשת. דוגמאות: שרתי אינטרנט, DB.
          </p>
          <BurstPattern pattern="io-bound" />
        </div>
      </div>
    </div>
  );
}

// קומפוננטה מציגה דפוס של CPU bursts / I/O waits לסוג תהליך
interface BurstPatternProps {
  pattern: 'cpu-bound' | 'io-bound';
}

function BurstPattern({ pattern }: BurstPatternProps) {
  const segments =
    pattern === 'cpu-bound'
      ? [
          { type: 'cpu', w: 40 },
          { type: 'io', w: 4 },
          { type: 'cpu', w: 35 },
          { type: 'io', w: 3 },
          { type: 'cpu', w: 18 },
        ]
      : [
          { type: 'cpu', w: 6 },
          { type: 'io', w: 20 },
          { type: 'cpu', w: 5 },
          { type: 'io', w: 22 },
          { type: 'cpu', w: 8 },
          { type: 'io', w: 15 },
          { type: 'cpu', w: 6 },
          { type: 'io', w: 18 },
        ];

  return (
    <div
      dir="ltr"
      className="flex h-5 w-full overflow-hidden rounded-sm border border-slate-300 dark:border-slate-600"
    >
      {segments.map((s, i) => (
        <div
          key={i}
          style={{
            width: `${s.w}%`,
            backgroundColor:
              s.type === 'cpu' ? 'var(--color-state-running)' : '#e2e8f0',
          }}
          className="flex items-center justify-center text-[8px] font-bold text-white dark:text-slate-900"
          title={s.type === 'cpu' ? 'CPU burst' : 'I/O wait'}
        >
          {s.type === 'cpu' ? '' : '·'}
        </div>
      ))}
    </div>
  );
}
