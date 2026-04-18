import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { TimelineProcessStyles } from './timelineTypes';

interface TimelineProcessPillProps {
  processId: string;
  remaining: number;
  processStyles: TimelineProcessStyles;
}

export default function TimelineProcessPill({
  processId,
  remaining,
  processStyles,
}: TimelineProcessPillProps) {
  const style = processStyles[processId];

  return (
    <motion.span
      layout
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold',
        style?.soft ?? 'bg-slate-100',
        style?.text ?? 'text-slate-700',
        style?.border ?? 'border-slate-200'
      )}
    >
      <span className="font-mono">{processId}</span>
      <span className="text-xs opacity-80">נותר {remaining}</span>
    </motion.span>
  );
}
