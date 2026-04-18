import type { ProcessMetric, SchedulingProcess } from '../../lib/schedulingTypes';

interface MetricCalculationBreakdownProps {
  processes: SchedulingProcess[];
  metrics: ProcessMetric[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
}

function fmt(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export default function MetricCalculationBreakdown({
  processes,
  metrics,
  averageWaitingTime,
  averageTurnaroundTime,
  averageResponseTime,
}: MetricCalculationBreakdownProps) {
  const hasIo = processes.some((p) => p.phases?.some((ph) => ph.type === 'io'));
  const n = metrics.length;

  if (n === 0) return null;

  const waitingValues = metrics.map((m) => m.waitingTime);
  const turnaroundValues = metrics.map((m) => m.turnaroundTime);
  const allHaveResponse = metrics.every((m) => m.responseTime !== null);

  return (
    <div className="space-y-5 text-sm" dir="rtl">

      {/* Formulas */}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          נוסחאות
        </div>
        <div className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
          <div className="flex flex-wrap items-baseline gap-1 font-mono text-xs">
            <span className="font-bold text-emerald-700 dark:text-emerald-400">Turnaround</span>
            <span className="text-slate-500">=</span>
            <span className="text-slate-700 dark:text-slate-300">זמן סיום − זמן הגעה</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-1 font-mono text-xs">
            <span className="font-bold text-amber-600 dark:text-amber-400">Waiting</span>
            <span className="text-slate-500">=</span>
            <span className="text-slate-700 dark:text-slate-300">
              {hasIo ? 'Turnaround − CPU Time − I/O Time' : 'Turnaround − CPU Burst'}
            </span>
          </div>
          {!hasIo && (
            <div className="text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
              כשיש I/O: Waiting = Turnaround − CPU Time − I/O Time
            </div>
          )}
          <div className="flex flex-wrap items-baseline gap-1 font-mono text-xs">
            <span className="font-bold text-violet-600 dark:text-violet-400">Response</span>
            <span className="text-slate-500">=</span>
            <span className="text-slate-700 dark:text-slate-300">זמן התחלה ראשונה − זמן הגעה</span>
          </div>
        </div>
      </div>

      {/* Per-process calculations */}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          חישוב לכל תהליך
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {metrics.map((m) => {
            const totalCpuTime = m.burstTime;
            return (
              <div
                key={m.processId}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="mb-1.5 font-mono text-sm font-bold text-slate-950 dark:text-slate-50">
                  {m.processId}
                </div>
                <div className="space-y-0.5 font-mono text-xs text-slate-600 dark:text-slate-300">
                  <div>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">T</span>
                    {' = '}
                    {m.completionTime} − {m.arrivalTime}{' = '}
                    <span className="font-bold text-slate-950 dark:text-slate-50">{m.turnaroundTime}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-amber-600 dark:text-amber-400">W</span>
                    {' = '}
                    {m.turnaroundTime} − {totalCpuTime}{' = '}
                    <span className="font-bold text-slate-950 dark:text-slate-50">{m.waitingTime}</span>
                  </div>
                  {m.firstStartTime !== null && m.responseTime !== null && (
                    <div>
                      <span className="font-semibold text-violet-600 dark:text-violet-400">R</span>
                      {' = '}
                      {m.firstStartTime} − {m.arrivalTime}{' = '}
                      <span className="font-bold text-slate-950 dark:text-slate-50">{m.responseTime}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Average calculations */}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          חישוב הממוצעים
        </div>
        <div className="grid gap-1.5 rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs dark:border-slate-800 dark:bg-slate-950">
          <div>
            <span className="font-bold text-amber-600 dark:text-amber-400">ממוצע Waiting</span>
            {' = '}({waitingValues.join(' + ')}) ÷ {n}{' = '}
            <span className="font-bold text-slate-950 dark:text-slate-50">{fmt(averageWaitingTime)}</span>
          </div>
          <div>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">ממוצע Turnaround</span>
            {' = '}({turnaroundValues.join(' + ')}) ÷ {n}{' = '}
            <span className="font-bold text-slate-950 dark:text-slate-50">{fmt(averageTurnaroundTime)}</span>
          </div>
          {allHaveResponse && (
            <div>
              <span className="font-bold text-violet-600 dark:text-violet-400">ממוצע Response</span>
              {' = '}(
              {metrics.map((m) => m.responseTime).join(' + ')}) ÷ {n}{' = '}
              <span className="font-bold text-slate-950 dark:text-slate-50">{fmt(averageResponseTime)}</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
