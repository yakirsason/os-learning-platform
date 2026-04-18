import { useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { Button } from '@/components/ui/button';

// פירמידת היררכיית אחסון - 7 רמות מהמהיר/היקר בראש ועד האיטי/הזול בתחתית.

interface Level {
  name: string; // English
  hebrewName: string;
  speed: string;
  size: string;
  cost: string;
  volatile: boolean;
  color: string;
  speedScore: number; // 0-100
  sizeScore: number;
  costScore: number;
}

const LEVELS: Level[] = [
  {
    name: 'Registers',
    hebrewName: 'אוגרים',
    speed: 'פחות מ-1 ננו-שנייה',
    size: 'בתים עד KB בודדים',
    cost: 'הגבוה ביותר',
    volatile: true,
    color: '#dc2626',
    speedScore: 100,
    sizeScore: 5,
    costScore: 100,
  },
  {
    name: 'Cache',
    hebrewName: 'מטמון (L1/L2/L3)',
    speed: '1-10 ננו-שניות',
    size: 'KB עד MB',
    cost: 'גבוה מאוד',
    volatile: true,
    color: '#ea580c',
    speedScore: 90,
    sizeScore: 15,
    costScore: 82,
  },
  {
    name: 'Main Memory',
    hebrewName: 'זיכרון ראשי (RAM)',
    speed: '10-100 ננו-שניות',
    size: 'GB',
    cost: 'גבוה',
    volatile: true,
    color: '#d97706',
    speedScore: 72,
    sizeScore: 35,
    costScore: 60,
  },
  {
    name: 'Solid-State Disk',
    hebrewName: 'דיסק SSD',
    speed: '25-200 מיקרו-שניות',
    size: 'GB עד TB',
    cost: 'בינוני-גבוה',
    volatile: false,
    color: '#65a30d',
    speedScore: 52,
    sizeScore: 62,
    costScore: 42,
  },
  {
    name: 'Hard Disk',
    hebrewName: 'כונן קשיח (HDD)',
    speed: '5-20 אלפיות השנייה',
    size: 'TB',
    cost: 'בינוני',
    volatile: false,
    color: '#16a34a',
    speedScore: 30,
    sizeScore: 78,
    costScore: 25,
  },
  {
    name: 'Optical Disk',
    hebrewName: 'דיסק אופטי (DVD/Blu-ray)',
    speed: '100-500 אלפיות',
    size: 'GB',
    cost: 'נמוך',
    volatile: false,
    color: '#0891b2',
    speedScore: 15,
    sizeScore: 30,
    costScore: 14,
  },
  {
    name: 'Magnetic Tape',
    hebrewName: 'סרט מגנטי',
    speed: 'שניות עד דקות',
    size: 'TB עד PB',
    cost: 'הנמוך ביותר',
    volatile: false,
    color: '#0369a1',
    speedScore: 5,
    sizeScore: 100,
    costScore: 5,
  },
];

const PYRAMID_W = 600;
const PYRAMID_H = 420;
const CENTER_X = PYRAMID_W / 2;
const TOP_WIDTH = 140;
const BASE_WIDTH = 560;
const LEVEL_H = PYRAMID_H / LEVELS.length;

function trapezoidPath(index: number): string {
  const topW = TOP_WIDTH + ((BASE_WIDTH - TOP_WIDTH) * index) / LEVELS.length;
  const botW =
    TOP_WIDTH + ((BASE_WIDTH - TOP_WIDTH) * (index + 1)) / LEVELS.length;
  const yT = index * LEVEL_H;
  const yB = (index + 1) * LEVEL_H;
  const tL = CENTER_X - topW / 2;
  const tR = CENTER_X + topW / 2;
  const bL = CENTER_X - botW / 2;
  const bR = CENTER_X + botW / 2;
  return `M ${tL} ${yT} L ${tR} ${yT} L ${bR} ${yB} L ${bL} ${yB} Z`;
}

export default function StorageHierarchyPyramid() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showComparison, setShowComparison] = useState(false);

  const totalSteps = LEVELS.length;
  const selected = LEVELS[currentStep]!;

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
    const timer = setTimeout(handleNext, 2000);
    return () => clearTimeout(timer);
  }, [isPlaying, currentStep, handleNext]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between" dir="rtl">
        <span className="text-xs text-muted-foreground">
          לחץ על כל רמה בפירמידה כדי לראות את פרטיה
        </span>
        <Button
          variant={showComparison ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowComparison((v) => !v)}
        >
          {showComparison ? 'הסתר השוואה' : 'הצג השוואה'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-[1fr_280px]">
        {/* Pyramid */}
        <div className="rounded-lg border bg-white p-4 dark:bg-slate-900/60">
          <svg
            viewBox={`0 0 ${PYRAMID_W} ${PYRAMID_H}`}
            className="h-auto w-full"
            role="img"
            aria-label="Storage hierarchy pyramid"
          >
            {LEVELS.map((level, i) => {
              const isActive = i === currentStep;
              return (
                <g key={level.name}>
                  <motion.path
                    d={trapezoidPath(i)}
                    fill={level.color}
                    stroke="white"
                    strokeWidth={2}
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      setCurrentStep(i);
                      setIsPlaying(false);
                    }}
                    initial={false}
                    animate={{
                      opacity: isActive ? 1 : 0.55,
                    }}
                    transition={{ duration: 0.3 }}
                  />
                  {isActive ? (
                    <motion.path
                      d={trapezoidPath(i)}
                      fill="none"
                      stroke="#fbbf24"
                      strokeWidth={3}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{ pointerEvents: 'none' }}
                    />
                  ) : null}
                  <text
                    x={CENTER_X}
                    y={i * LEVEL_H + LEVEL_H / 2 + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize={i === 0 ? 13 : 15}
                    fontWeight={700}
                    style={{ pointerEvents: 'none' }}
                  >
                    {level.name}
                  </text>
                </g>
              );
            })}

            {/* Side labels indicating fast/slow + expensive/cheap */}
            <text
              x={12}
              y={14}
              fontSize={11}
              className="fill-slate-500 dark:fill-slate-400"
            >
              מהיר · יקר
            </text>
            <text
              x={12}
              y={PYRAMID_H - 6}
              fontSize={11}
              className="fill-slate-500 dark:fill-slate-400"
            >
              איטי · זול
            </text>
          </svg>
        </div>

        {/* Detail panel */}
        <div className="rounded-lg border bg-card p-4" dir="rtl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <div
                className="mb-3 h-1.5 w-full rounded-full"
                style={{ backgroundColor: selected.color }}
              />
              <h3 className="text-lg font-bold">{selected.hebrewName}</h3>
              <p
                className="mb-4 font-mono text-xs text-muted-foreground"
                dir="ltr"
              >
                {selected.name}
              </p>
              <dl className="space-y-3 text-sm">
                <DetailRow label="מהירות גישה" value={selected.speed} />
                <DetailRow label="גודל טיפוסי" value={selected.size} />
                <DetailRow label="עלות לביט" value={selected.cost} />
                <DetailRow
                  label="נדיפות"
                  value={
                    selected.volatile
                      ? 'נדיף (volatile) - איבוד מידע בכיבוי'
                      : 'לא נדיף (non-volatile) - המידע נשמר'
                  }
                />
              </dl>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {showComparison ? (
        <div className="rounded-lg border bg-background p-4" dir="rtl">
          <h4 className="mb-3 text-sm font-semibold">
            השוואה בין כל הרמות (ערכים יחסיים)
          </h4>
          <div className="space-y-3">
            {LEVELS.map((level, i) => (
              <ComparisonRow
                key={level.name}
                level={level}
                isActive={i === currentStep}
                onSelect={() => {
                  setCurrentStep(i);
                  setIsPlaying(false);
                }}
              />
            ))}
          </div>
        </div>
      ) : null}

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
        רמה {currentStep + 1} מתוך {totalSteps}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className="text-sm font-semibold">{value}</dd>
    </div>
  );
}

interface ComparisonRowProps {
  level: Level;
  isActive: boolean;
  onSelect: () => void;
}

function ComparisonRow({ level, isActive, onSelect }: ComparisonRowProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-md p-2 text-right transition-colors ${
        isActive ? 'bg-muted' : 'hover:bg-muted/60'
      }`}
    >
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-semibold">{level.hebrewName}</span>
        <span className="font-mono text-[10px] text-muted-foreground" dir="ltr">
          {level.name}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Bar label="מהירות" value={level.speedScore} color="#22c55e" />
        <Bar label="גודל" value={level.sizeScore} color="#3b82f6" />
        <Bar label="עלות" value={level.costScore} color="#f59e0b" />
      </div>
    </button>
  );
}

function Bar({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="text-[10px]">
      <div className="mb-0.5 text-muted-foreground">{label}</div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
    </div>
  );
}
