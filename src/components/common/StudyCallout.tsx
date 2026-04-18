import type { ReactNode } from 'react';
import { AlertTriangle, BookOpen, GitCompare, Lightbulb, Pin } from 'lucide-react';
import { cn } from '@/lib/utils';

// בלוק תזכורת ללמידה (reinforcement callout). חמש ווריאנטים:
// exam / pitfall / compare / oneliner / remember.

type CalloutVariant = 'exam' | 'pitfall' | 'compare' | 'oneliner' | 'remember';

interface StudyCalloutProps {
  variant: CalloutVariant;
  title?: string;
  children: ReactNode;
}

interface VariantConfig {
  icon: typeof Pin;
  label: string;
  container: string;
  iconClass: string;
  labelClass: string;
}

const VARIANT_CONFIG: Record<CalloutVariant, VariantConfig> = {
  exam: {
    icon: Pin,
    label: 'חשוב למבחן',
    container:
      'border-blue-300 bg-blue-50 dark:border-blue-800/60 dark:bg-blue-950/30',
    iconClass: 'text-blue-600 dark:text-blue-400',
    labelClass: 'text-blue-700 dark:text-blue-300',
  },
  pitfall: {
    icon: AlertTriangle,
    label: 'טעות נפוצה',
    container:
      'border-amber-300 bg-amber-50 dark:border-amber-800/60 dark:bg-amber-950/30',
    iconClass: 'text-amber-600 dark:text-amber-400',
    labelClass: 'text-amber-700 dark:text-amber-300',
  },
  compare: {
    icon: GitCompare,
    label: 'השוואה מהירה',
    container:
      'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/60',
    iconClass: 'text-slate-600 dark:text-slate-300',
    labelClass: 'text-slate-700 dark:text-slate-200',
  },
  oneliner: {
    icon: Lightbulb,
    label: 'בשורה אחת',
    container:
      'border-violet-300 bg-violet-50 dark:border-violet-800/60 dark:bg-violet-950/30',
    iconClass: 'text-violet-600 dark:text-violet-400',
    labelClass: 'text-violet-700 dark:text-violet-300',
  },
  remember: {
    icon: BookOpen,
    label: 'זכור',
    container:
      'border-emerald-300 bg-emerald-50 dark:border-emerald-800/60 dark:bg-emerald-950/30',
    iconClass: 'text-emerald-600 dark:text-emerald-400',
    labelClass: 'text-emerald-700 dark:text-emerald-300',
  },
};

export default function StudyCallout({
  variant,
  title,
  children,
}: StudyCalloutProps) {
  const config = VARIANT_CONFIG[variant];
  const Icon = config.icon;
  const headerText = title ? `${config.label} — ${title}` : config.label;
  return (
    <div
      dir="rtl"
      className={cn(
        'my-5 rounded-lg border border-e border-t border-b border-s-4 p-4 shadow-sm',
        config.container
      )}
    >
      <div
        className={cn(
          'mb-2 flex items-center gap-2 text-sm font-semibold',
          config.labelClass
        )}
      >
        <Icon className={cn('h-4 w-4 shrink-0', config.iconClass)} />
        <span>{headerText}</span>
      </div>
      <div className="text-sm leading-relaxed text-slate-800 dark:text-slate-100">
        {children}
      </div>
    </div>
  );
}
