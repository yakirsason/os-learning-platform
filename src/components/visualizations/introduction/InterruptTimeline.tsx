import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';

// מחזור חיים מלא של Interrupt:
// המעבד רץ → התקן מעביר נתונים ברקע → התקן שולח Interrupt →
// המעבד שומר state → קופץ ל-Handler דרך Interrupt Vector →
// Handler מטפל → המעבד משחזר state וחוזר לתהליך המקורי.

interface Phase {
  cpuColor: string;
  cpuLabel: string;
  deviceColor: string;
  deviceLabel: string;
  description: string;
}

const RUNNING = 'var(--color-state-running)';
const WAITING = 'var(--color-state-waiting)';
const READY = 'var(--color-state-ready)';
const IDLE_COLOR = '#cbd5e1';
const DONE_COLOR = '#94a3b8';

const PHASES: Phase[] = [
  {
    cpuColor: RUNNING,
    cpuLabel: 'תהליך משתמש',
    deviceColor: IDLE_COLOR,
    deviceLabel: 'Idle',
    description:
      'המעבד מבצע את התהליך של המשתמש. התקן ה-I/O במצב Idle, ללא פעולה.',
  },
  {
    cpuColor: RUNNING,
    cpuLabel: 'System Call',
    deviceColor: IDLE_COLOR,
    deviceLabel: 'Idle',
    description:
      'התהליך מבקש פעולת I/O (למשל קריאה מדיסק) באמצעות System Call - מעבר קצר למצב Kernel.',
  },
  {
    cpuColor: RUNNING,
    cpuLabel: 'ממשיך לרוץ',
    deviceColor: READY,
    deviceLabel: 'Transferring',
    description:
      'ה-Driver הפעיל את ההתקן. המעבד ממשיך להריץ את התהליך, וההתקן מעביר נתונים לחוצץ (Buffer) שלו במקביל.',
  },
  {
    cpuColor: RUNNING,
    cpuLabel: 'ממשיך לרוץ',
    deviceColor: READY,
    deviceLabel: 'Transferring',
    description:
      'ההעברה מגיעה לסיומה. ההתקן מסמן סיום ושולח אות Interrupt במיוחד למעבד.',
  },
  {
    cpuColor: WAITING,
    cpuLabel: 'שומר state',
    deviceColor: DONE_COLOR,
    deviceLabel: 'Done',
    description:
      'המעבד עוצר את התהליך הנוכחי ושומר את ה-state שלו - registers ו-Program Counter - כדי שניתן יהיה לחזור אליו.',
  },
  {
    cpuColor: WAITING,
    cpuLabel: 'טוען Handler',
    deviceColor: DONE_COLOR,
    deviceLabel: 'Done',
    description:
      'המעבד קופץ לכתובת ה-Interrupt Handler דרך טבלת Interrupt Vector, שמכילה כתובת handler לכל סוג פסיקה.',
  },
  {
    cpuColor: WAITING,
    cpuLabel: 'Handler רץ',
    deviceColor: DONE_COLOR,
    deviceLabel: 'Done',
    description:
      'ה-Handler מטפל בפסיקה: מעתיק את הנתונים מחוצץ ההתקן לזיכרון התהליך ומעדכן מבני נתונים של הגרעין.',
  },
  {
    cpuColor: RUNNING,
    cpuLabel: 'תהליך משתמש',
    deviceColor: IDLE_COLOR,
    deviceLabel: 'Idle',
    description:
      'המעבד משחזר את ה-state ומחזיר את השליטה לתהליך המקורי. המחזור הסתיים - התהליך ממשיך מנקודת העצירה.',
  },
];

const VIEW_W = 820;
const VIEW_H = 260;
const TRACK_X = 70;
const TRACK_W = VIEW_W - TRACK_X - 20;
const BLOCK_W = TRACK_W / PHASES.length;
const CPU_Y = 40;
const DEV_Y = 150;
const TRACK_H = 60;

export default function InterruptTimeline() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const totalSteps = PHASES.length;
  const current = PHASES[currentStep]!;

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
    const timer = setTimeout(handleNext, 1400);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  const playheadX = TRACK_X + (currentStep + 1) * BLOCK_W;

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-4 dark:bg-slate-900/60">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="w-full"
          role="img"
          aria-label="Interrupt lifecycle timeline"
        >
          {/* Axis labels */}
          <text
            x={10}
            y={CPU_Y + TRACK_H / 2 + 5}
            fontSize={14}
            fontWeight={600}
            className="fill-slate-700 dark:fill-slate-200"
          >
            CPU
          </text>
          <text
            x={10}
            y={DEV_Y + TRACK_H / 2 + 5}
            fontSize={13}
            fontWeight={600}
            className="fill-slate-700 dark:fill-slate-200"
          >
            I/O
          </text>

          {/* Track backgrounds */}
          <rect
            x={TRACK_X}
            y={CPU_Y}
            width={TRACK_W}
            height={TRACK_H}
            rx={6}
            className="fill-slate-100 dark:fill-slate-800"
          />
          <rect
            x={TRACK_X}
            y={DEV_Y}
            width={TRACK_W}
            height={TRACK_H}
            rx={6}
            className="fill-slate-100 dark:fill-slate-800"
          />

          {/* CPU phase blocks */}
          {PHASES.map((phase, i) => {
            const x = TRACK_X + i * BLOCK_W;
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            const opacity = isActive ? 1 : isPast ? 0.6 : 0.15;
            return (
              <motion.rect
                key={`cpu-${i}`}
                x={x + 2}
                y={CPU_Y + 3}
                width={BLOCK_W - 4}
                height={TRACK_H - 6}
                fill={phase.cpuColor}
                rx={4}
                initial={false}
                animate={{ opacity }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Device phase blocks */}
          {PHASES.map((phase, i) => {
            const x = TRACK_X + i * BLOCK_W;
            const isActive = i === currentStep;
            const isPast = i < currentStep;
            const opacity = isActive ? 1 : isPast ? 0.6 : 0.15;
            return (
              <motion.rect
                key={`dev-${i}`}
                x={x + 2}
                y={DEV_Y + 3}
                width={BLOCK_W - 4}
                height={TRACK_H - 6}
                fill={phase.deviceColor}
                rx={4}
                initial={false}
                animate={{ opacity }}
                transition={{ duration: 0.3 }}
              />
            );
          })}

          {/* Active labels - fade between steps */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.g
              key={`labels-${currentStep}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <text
                x={TRACK_X + currentStep * BLOCK_W + BLOCK_W / 2}
                y={CPU_Y + TRACK_H / 2 + 5}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight={600}
              >
                {current.cpuLabel}
              </text>
              <text
                x={TRACK_X + currentStep * BLOCK_W + BLOCK_W / 2}
                y={DEV_Y + TRACK_H / 2 + 5}
                textAnchor="middle"
                fill="white"
                fontSize={11}
                fontWeight={600}
              >
                {current.deviceLabel}
              </text>
            </motion.g>
          </AnimatePresence>

          {/* Playhead */}
          <motion.g
            animate={{ x: playheadX }}
            transition={{ duration: 0.4 }}
            initial={false}
          >
            <line
              x1={0}
              y1={CPU_Y - 16}
              x2={0}
              y2={DEV_Y + TRACK_H + 6}
              stroke="#ef4444"
              strokeWidth={2}
            />
            <polygon points="-6,-22 6,-22 0,-12" fill="#ef4444" />
          </motion.g>

          {/* Time axis */}
          <text
            x={TRACK_X}
            y={228}
            fontSize={11}
            className="fill-slate-500 dark:fill-slate-400"
          >
            t=0
          </text>
          <text
            x={TRACK_X + TRACK_W}
            y={228}
            fontSize={11}
            textAnchor="end"
            className="fill-slate-500 dark:fill-slate-400"
          >
            זמן →
          </text>
        </svg>
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
