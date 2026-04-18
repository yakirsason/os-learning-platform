import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StepController from '@/components/common/StepController';

// הדמיה של 5 מצבי תהליך עם סיבת מעבר לכל שלב.
// הצבעים מה-Tailwind tokens של state colors ב-index.css - חובה עקביים עם כל האתר.

type StateName = 'new' | 'ready' | 'running' | 'waiting' | 'terminated';

interface Step {
  state: StateName | null;
  fromState: StateName | null;
  reason: string;
  description: string;
}

const STEPS: Step[] = [
  {
    state: null,
    fromState: null,
    reason: '',
    description:
      'התהליך עוד לא נוצר. לחצו Next כדי לראות את מחזור החיים המלא שלו במערכת.',
  },
  {
    state: 'new',
    fromState: null,
    reason: 'create',
    description:
      'התהליך נוצר: הקוד נטען לזיכרון, נוצר PCB עבורו, אבל הוא עדיין לא הוכנס ל-Ready Queue. הוא במצב New.',
  },
  {
    state: 'ready',
    fromState: 'new',
    reason: 'admitted',
    description:
      'ה-OS החליט שיש מספיק משאבים. התהליך הוכנס ל-Ready Queue ומחכה לתורו על המעבד.',
  },
  {
    state: 'running',
    fromState: 'ready',
    reason: 'scheduler dispatch',
    description:
      'ה-scheduler בחר בתהליך מתוך ה-Ready Queue ודחף אותו למעבד. עכשיו הוא רץ.',
  },
  {
    state: 'waiting',
    fromState: 'running',
    reason: 'I/O request',
    description:
      'התהליך ביקש פעולת I/O (למשל read מדיסק). הוא נחסם עד שה-I/O יסתיים, ועובר לתור של ההתקן.',
  },
  {
    state: 'ready',
    fromState: 'waiting',
    reason: 'I/O complete',
    description:
      'ה-I/O הסתיים והגיע Interrupt. התהליך חוזר ל-Ready Queue ומחכה שוב לתורו.',
  },
  {
    state: 'running',
    fromState: 'ready',
    reason: 'scheduler dispatch',
    description:
      'ה-scheduler בחר בו שוב. המעבד ממשיך מהנקודה שבה עצר, לפי ה-PCB.',
  },
  {
    state: 'ready',
    fromState: 'running',
    reason: 'preempted',
    description:
      'ה-scheduler שלל ממנו את המעבד (preemption) — למשל כי פג ה-quantum או כי תהליך בעדיפות גבוהה הגיע. הוא חוזר ל-Ready Queue.',
  },
  {
    state: 'running',
    fromState: 'ready',
    reason: 'scheduler dispatch',
    description:
      'שוב על המעבד, ממשיך את עבודתו.',
  },
  {
    state: 'terminated',
    fromState: 'running',
    reason: 'exit',
    description:
      'התהליך סיים את עבודתו (קרא ל-exit). המערכת תשחרר את הזיכרון ואת ה-PCB שלו.',
  },
];

interface StateConfig {
  label: string;
  hebrewLabel: string;
  color: string;
  x: number;
  y: number;
}

const STATE_CONFIG: Record<StateName, StateConfig> = {
  new: {
    label: 'New',
    hebrewLabel: 'חדש',
    color: 'var(--color-state-new)',
    x: 110,
    y: 130,
  },
  ready: {
    label: 'Ready',
    hebrewLabel: 'מוכן',
    color: 'var(--color-state-ready)',
    x: 315,
    y: 130,
  },
  running: {
    label: 'Running',
    hebrewLabel: 'רץ',
    color: 'var(--color-state-running)',
    x: 520,
    y: 130,
  },
  terminated: {
    label: 'Terminated',
    hebrewLabel: 'הסתיים',
    color: 'var(--color-state-terminated)',
    x: 725,
    y: 130,
  },
  waiting: {
    label: 'Waiting',
    hebrewLabel: 'ממתין',
    color: 'var(--color-state-waiting)',
    x: 418,
    y: 310,
  },
};

interface Transition {
  from: StateName;
  to: StateName;
  label: string;
  d: string;
  labelX: number;
  labelY: number;
}

const TRANSITIONS: Transition[] = [
  {
    from: 'new',
    to: 'ready',
    label: 'admitted',
    d: 'M 150 130 L 270 130',
    labelX: 210,
    labelY: 122,
  },
  {
    from: 'ready',
    to: 'running',
    label: 'dispatch',
    d: 'M 355 130 L 476 130',
    labelX: 415,
    labelY: 122,
  },
  {
    from: 'running',
    to: 'ready',
    label: 'interrupt / preempt',
    d: 'M 490 95 Q 417 35 345 95',
    labelX: 417,
    labelY: 32,
  },
  {
    from: 'running',
    to: 'waiting',
    label: 'I/O wait',
    d: 'M 493 160 L 453 272',
    labelX: 495,
    labelY: 225,
  },
  {
    from: 'waiting',
    to: 'ready',
    label: 'I/O complete',
    d: 'M 390 282 L 340 170',
    labelX: 330,
    labelY: 230,
  },
  {
    from: 'running',
    to: 'terminated',
    label: 'exit',
    d: 'M 560 130 L 681 130',
    labelX: 620,
    labelY: 122,
  },
];

const CIRCLE_RADIUS = 40;

export default function ProcessStateSimulator() {
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

  return (
    <div className="space-y-4">
      <div
        dir="ltr"
        className="rounded-lg border bg-white p-4 dark:bg-slate-900/60"
      >
        <svg
          viewBox="0 0 830 400"
          className="h-auto w-full"
          role="img"
          aria-label="Five process states and transitions"
        >
          <defs>
            <marker
              id="arrowhead-default-ps"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,0 10,3.5 0,7" fill="#94a3b8" />
            </marker>
            <marker
              id="arrowhead-active-ps"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0,0 10,3.5 0,7" fill="#ef4444" />
            </marker>
          </defs>

          {/* Transitions */}
          {TRANSITIONS.map((t) => {
            const isActive =
              current.fromState === t.from && current.state === t.to;
            return (
              <g key={`${t.from}-${t.to}`}>
                <motion.path
                  d={t.d}
                  stroke={isActive ? '#ef4444' : '#94a3b8'}
                  strokeWidth={isActive ? 3 : 1.5}
                  fill="none"
                  markerEnd={
                    isActive
                      ? 'url(#arrowhead-active-ps)'
                      : 'url(#arrowhead-default-ps)'
                  }
                  initial={false}
                  animate={{
                    opacity: isActive ? 1 : 0.5,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <text
                  x={t.labelX}
                  y={t.labelY}
                  textAnchor="middle"
                  fontSize={11}
                  fontWeight={isActive ? 700 : 400}
                  className={
                    isActive
                      ? 'fill-red-600 dark:fill-red-400'
                      : 'fill-slate-500 dark:fill-slate-400'
                  }
                  style={{ pointerEvents: 'none' }}
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* State circles */}
          {(Object.keys(STATE_CONFIG) as StateName[]).map((name) => {
            const cfg = STATE_CONFIG[name];
            const isCurrent = current.state === name;
            return (
              <g key={name}>
                <motion.circle
                  cx={cfg.x}
                  cy={cfg.y}
                  r={CIRCLE_RADIUS}
                  fill={cfg.color}
                  stroke="white"
                  strokeWidth={2}
                  initial={false}
                  animate={{
                    opacity: isCurrent ? 1 : 0.35,
                    filter: isCurrent
                      ? 'drop-shadow(0 0 14px rgba(239, 68, 68, 0.55))'
                      : 'drop-shadow(0 0 0 rgba(0,0,0,0))',
                  }}
                  transition={{ duration: 0.4 }}
                />
                <text
                  x={cfg.x}
                  y={cfg.y - 4}
                  textAnchor="middle"
                  fill="white"
                  fontSize={13}
                  fontWeight={700}
                  style={{ pointerEvents: 'none' }}
                >
                  {cfg.label}
                </text>
                <text
                  x={cfg.x}
                  y={cfg.y + 13}
                  textAnchor="middle"
                  fill="white"
                  fontSize={10}
                  opacity={0.92}
                  style={{ pointerEvents: 'none' }}
                >
                  {cfg.hebrewLabel}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed" dir="rtl">
        <div className="mb-1 text-xs font-semibold text-muted-foreground">
          שלב {currentStep + 1} מתוך {totalSteps}
          {current.fromState && current.state ? (
            <span className="ms-2 font-mono" dir="ltr">
              {current.fromState} → {current.state} ({current.reason})
            </span>
          ) : null}
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
