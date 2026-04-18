import type { ProcessMetric, SchedulingProcess } from '../../lib/schedulingTypes';
import { findMetric } from './timelineTypes';
import MetricCalculationBreakdown from './MetricCalculationBreakdown';

interface TimelineWorkloadSummaryProps {
  processes: SchedulingProcess[];
  metrics: ProcessMetric[];
  averageWaitingTime: number;
  averageTurnaroundTime: number;
  averageResponseTime: number;
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(2);
}

export default function TimelineWorkloadSummary({
  processes,
  metrics,
  averageWaitingTime,
  averageTurnaroundTime,
  averageResponseTime,
}: TimelineWorkloadSummaryProps) {
  return (
    <section className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="m-0 mb-3 text-base font-bold text-slate-950 dark:text-slate-50">
        מדדים ופרטי עומס
      </h3>

      <div className="grid gap-2 text-center sm:grid-cols-3">
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
          <div className="text-xs font-semibold text-blue-700 dark:text-blue-300">
            ממוצע Waiting
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatNumber(averageWaitingTime)}
          </div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            ממוצע Turnaround
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatNumber(averageTurnaroundTime)}
          </div>
        </div>
        <div className="rounded-lg bg-violet-50 p-3 dark:bg-violet-950/30">
          <div className="text-xs font-semibold text-violet-700 dark:text-violet-300">
            ממוצע Response
          </div>
          <div className="font-mono text-2xl font-bold">
            {formatNumber(averageResponseTime)}
          </div>
        </div>
      </div>

      <details className="mt-3 rounded-lg border bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
          טבלת המדדים המלאה
        </summary>

        <div className="mt-3">
          <div className="overflow-hidden rounded-lg border bg-white dark:border-slate-800 dark:bg-slate-900">
            <table dir="rtl" className="m-0 w-full text-xs">
              <thead className="bg-slate-100 dark:bg-slate-800">
                <tr>
                  <th className="px-2 py-1 text-start">תהליך</th>
                  <th className="px-2 py-1 text-start">Waiting</th>
                  <th className="px-2 py-1 text-start">Turnaround</th>
                  <th className="px-2 py-1 text-start">Response</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process) => {
                  const metric = findMetric(metrics, process.id);
                  return (
                    <tr key={process.id} className="border-t dark:border-slate-800">
                      <td className="px-2 py-1 font-mono">{process.id}</td>
                      <td className="px-2 py-1 font-mono">
                        {metric ? metric.waitingTime : '-'}
                      </td>
                      <td className="px-2 py-1 font-mono">
                        {metric ? metric.turnaroundTime : '-'}
                      </td>
                      <td className="px-2 py-1 font-mono">
                        {metric?.responseTime ?? '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      <details className="mt-2 rounded-lg border bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
        <summary className="cursor-pointer text-sm font-semibold text-slate-700 dark:text-slate-200">
          הצג חישוב מלא
        </summary>
        <div className="mt-3">
          <MetricCalculationBreakdown
            processes={processes}
            metrics={metrics}
            averageWaitingTime={averageWaitingTime}
            averageTurnaroundTime={averageTurnaroundTime}
            averageResponseTime={averageResponseTime}
          />
        </div>
      </details>
    </section>
  );
}
