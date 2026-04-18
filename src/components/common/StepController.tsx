import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

// שלד: בקרי הפעלה של הדמיה צעד-צעד.
// תשומת-לב ל-RTL: בעברית ה"הבא" נמצא משמאל וה"קודם" מימין.
// לכן ChevronRight מייצג את "קודם" ו-ChevronLeft מייצג את "הבא".
export interface StepControllerProps {
  onReset: () => void;
  onPrevious: () => void;
  onPlayPause: () => void;
  onNext: () => void;
  isPlaying: boolean;
  canGoBack: boolean;
  canGoForward: boolean;
}

export default function StepController({
  onReset,
  onPrevious,
  onPlayPause,
  onNext,
  isPlaying,
  canGoBack,
  canGoForward,
}: StepControllerProps) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-lg border bg-card p-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={onReset}
        aria-label="אפס הדמיה"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={!canGoBack}
        aria-label="צעד קודם"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <Button
        variant="default"
        size="icon"
        onClick={onPlayPause}
        aria-label={isPlaying ? 'השהה' : 'הפעל'}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={!canGoForward}
        aria-label="צעד הבא"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
}
