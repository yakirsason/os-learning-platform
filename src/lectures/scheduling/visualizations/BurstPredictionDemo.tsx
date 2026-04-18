import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import StepController from '@/components/common/StepController';
import { calculateBurstPredictions } from '../lib/burstPrediction';

interface BurstPredictionDemoProps {}

const ACTUAL_BURSTS = [6, 4, 6, 4, 13, 13];
const INITIAL_PREDICTION = 10;
const ALPHA_OPTIONS = [0, 0.5, 1];

function formatPrediction(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export default function BurstPredictionDemo(_props: BurstPredictionDemoProps) {
  const [alpha, setAlpha] = useState(0.5);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = useMemo(
    () => calculateBurstPredictions(ACTUAL_BURSTS, INITIAL_PREDICTION, alpha),
    [alpha]
  );

  const totalSteps = steps.length;
  const current = steps[currentStep] ?? steps[0];
  const maxValue = Math.max(INITIAL_PREDICTION, ...ACTUAL_BURSTS) + 2;

  const alphaExplanation = useMemo(() => {
    if (alpha === 0) {
      return 'alpha = 0 אומר: אל תתחשב ב-burst האמיתי האחרון. התחזית כמעט לא זזה.';
    }
    if (alpha === 1) {
      return 'alpha = 1 אומר: רק ה-burst האמיתי האחרון קובע את התחזית הבאה.';
    }
    return 'alpha באמצע נותן שילוב: גם ההיסטוריה הקודמת וגם ה-burst האחרון משפיעים.';
  }, [alpha]);

  const handleNext = useCallback(() => {
    setCurrentStep((step) => {
      if (step < totalSteps - 1) return step + 1;
      setIsPlaying(false);
      return step;
    });
  }, [totalSteps]);

  const handlePrevious = useCallback(() => {
    setCurrentStep((step) => (step > 0 ? step - 1 : step));
  }, []);

  const handleReset = useCallback(() => {
    setAlpha(0.5);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((playing) => !playing);
  }, []);

  const handleAlphaChange = useCallback((nextAlpha: number) => {
    setAlpha(nextAlpha);
    setCurrentStep(0);
    setIsPlaying(false);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1900);
    return () => clearTimeout(timer);
  }, [currentStep, handleNext, isPlaying]);

  return (
    <div className="space-y-4" dir="rtl">
      <div className="rounded-lg border bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_260px]">
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
              בחרו alpha
            </div>
            <div className="flex flex-wrap gap-2">
              {ALPHA_OPTIONS.map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={alpha === option ? 'default' : 'outline'}
                  onClick={() => handleAlphaChange(option)}
                >
                  alpha = {option}
                </Button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border bg-white p-3 text-sm leading-relaxed dark:border-slate-800 dark:bg-slate-900">
            {alphaExplanation}
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
          <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${alpha}-${current.index}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                <div>
                  <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
                    burst מספר {current.index}
                  </div>
                  <h3 className="m-0 text-lg font-bold text-slate-950 dark:text-slate-50">
                    תחזית לפני: {formatPrediction(current.predictionBeforeBurst)}
                  </h3>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    ה-burst האמיתי היה {current.actualBurst}, ולכן התחזית הבאה היא{' '}
                    {formatPrediction(current.predictionAfterBurst)}.
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>תחזית לפני</span>
                      <span className="font-mono">
                        {formatPrediction(current.predictionBeforeBurst)}
                      </span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(current.predictionBeforeBurst / maxValue) * 100}%`,
                        }}
                        transition={{ duration: 0.35 }}
                        className="h-full rounded-full bg-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>burst אמיתי</span>
                      <span className="font-mono">{current.actualBurst}</span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(current.actualBurst / maxValue) * 100}%` }}
                        transition={{ duration: 0.35 }}
                        className="h-full rounded-full bg-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span>תחזית אחרי</span>
                      <span className="font-mono">
                        {formatPrediction(current.predictionAfterBurst)}
                      </span>
                    </div>
                    <div className="h-5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(current.predictionAfterBurst / maxValue) * 100}%`,
                        }}
                        transition={{ duration: 0.35 }}
                        className="h-full rounded-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="rounded-lg border bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
              היסטוריית bursts
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {steps.map((step, index) => (
                <div
                  key={step.index}
                  className={`rounded-md border p-2 text-center text-xs dark:border-slate-800 ${
                    index === currentStep
                      ? 'bg-blue-50 ring-2 ring-blue-400 dark:bg-blue-950/30'
                      : 'bg-slate-50 dark:bg-slate-950'
                  }`}
                >
                  <div className="font-mono font-bold">{step.actualBurst}</div>
                  <div className="text-slate-500 dark:text-slate-400">burst {step.index}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed dark:border-slate-800 dark:bg-slate-950">
              הנוסחה בשקפים נותנת משקל ל-burst האמיתי האחרון ולתחזית הקודמת.
              alpha קובע מי משפיע יותר.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md bg-muted p-3 text-sm leading-relaxed" dir="rtl">
        התחזית החדשה מחושבת כך: alpha כפול ה-burst האמיתי ועוד
        <span dir="ltr"> (1 - alpha) </span>
        כפול התחזית הקודמת.
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

      <div className="text-center text-xs text-muted-foreground">
        burst {currentStep + 1} מתוך {totalSteps}
      </div>
    </div>
  );
}
