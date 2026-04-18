import type { SchedulingTraceStep } from '../../lib/schedulingTypes';

interface TimelineCurrentEventPanelProps {
  current: SchedulingTraceStep;
  currentStep: number;
  totalSteps: number;
}

export default function TimelineCurrentEventPanel({
  current,
  currentStep,
  totalSteps,
}: TimelineCurrentEventPanelProps) {
  return (
    <aside className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-blue-50 px-2 py-0.5 font-mono text-[11px] font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
          {current.event.type}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          שלב {currentStep + 1}/{totalSteps}
        </span>
      </div>

      <h3 className="m-0 mb-2 text-base font-bold text-slate-950 dark:text-slate-50">
        {current.event.title}
      </h3>
      <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        {current.description}
      </p>

      <div className="mt-4 grid gap-2 text-xs">
        <div className="rounded-lg bg-emerald-50 p-2 dark:bg-emerald-950/30">
          <span className="font-semibold text-emerald-700 dark:text-emerald-300">
            רץ עכשיו:{' '}
          </span>
          <span className="font-mono">{current.runningProcess ?? 'Idle'}</span>
        </div>
        <div className="rounded-lg bg-blue-50 p-2 dark:bg-blue-950/30">
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            Ready Queue:{' '}
          </span>
          <span className="font-mono">
            {current.readyQueue.length > 0 ? current.readyQueue.join(', ') : 'ריק'}
          </span>
        </div>
      </div>
    </aside>
  );
}
