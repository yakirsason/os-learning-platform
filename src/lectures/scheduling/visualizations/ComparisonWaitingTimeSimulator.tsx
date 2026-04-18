import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';
import { runIoSjf, runIoSrtf } from '../lib/ioAwareCoreAlgorithms';
import { runIoRoundRobin } from '../lib/ioRoundRobinScheduling';
import { MLFQ_LEVELS, runMlfq } from '../lib/mlfqScheduling';
import { COMPARISON_WAITING_TIME_5P } from '../lib/schedulingPresets';
import type { SchedulingResult } from '../lib/schedulingTypes';
import IoAwareTimelineStrip from './timeline/IoAwareTimelineStrip';
import IoWorkloadStrip from './timeline/IoWorkloadStrip';
import TimelineWorkloadSummary from './timeline/TimelineWorkloadSummary';
import { computeProcessStyles } from './timeline/timelineTypes';

const PRESET = COMPARISON_WAITING_TIME_5P;
const RR_QUANTUM = PRESET.roundRobinQuantum ?? 4;
const MLFQ_PRESET_LEVELS = PRESET.mlfqLevels ?? MLFQ_LEVELS;
const MLFQ_PREEMPTIVE = PRESET.mlfqPreemptive ?? true;

type AlgoId = 'sjf' | 'srtf' | 'rr' | 'mlfq';

interface AlgoCase {
  id: AlgoId;
  label: string;
  englishName: string;
  mode: 'nonpreemptive' | 'preemptive';
  paramsText: string;
  run: () => SchedulingResult;
  explanation: string;
}

const CASES: AlgoCase[] = [
  {
    id: 'sjf',
    label: 'SJF',
    englishName: 'Shortest Job First',
    mode: 'nonpreemptive',
    paramsText: 'nonpreemptive',
    run: () => runIoSjf(PRESET.processes),
    explanation:
      'SJF בוחר תמיד את פאזת ה-CPU הקצרה ביותר מבין התהליכים המוכנים. לכן תהליכים קצרים "קופצים" מעל תהליכים ארוכים, וזה ממזער את ממוצע זמני ההמתנה עבור אותו עומס.',
  },
  {
    id: 'srtf',
    label: 'SRTF',
    englishName: 'Shortest Remaining Time First',
    mode: 'preemptive',
    paramsText: 'preemptive',
    run: () => runIoSrtf(PRESET.processes),
    explanation:
      'SRTF הוא הגרסה ה-preemptive של SJF: בכל יחידת זמן נבדק מי בעל הזמן הקצר ביותר שנותר. כך גם תהליך שכבר רץ יכול להיעצר כשמגיע תהליך קצר יותר.',
  },
  {
    id: 'rr',
    label: 'Round Robin',
    englishName: 'Round Robin',
    mode: 'preemptive',
    paramsText: `quantum=${RR_QUANTUM}`,
    run: () => runIoRoundRobin(PRESET.processes, RR_QUANTUM),
    explanation:
      'Round Robin מחלק CPU ל-slices שווים של quantum קבוע. אין כאן "קצר ראשון" — התור מוביל להמתנה בינונית לכולם אבל משיג response-time מצוין.',
  },
  {
    id: 'mlfq',
    label: 'MLFQ',
    englishName: 'Multilevel Feedback Queue',
    mode: MLFQ_PREEMPTIVE ? 'preemptive' : 'nonpreemptive',
    paramsText: MLFQ_PRESET_LEVELS.map(
      (l) => `${l.id.toUpperCase()} q=${l.quantum}`
    ).join(', '),
    run: () =>
      runMlfq(PRESET.processes, MLFQ_PRESET_LEVELS, {
        preemptive: MLFQ_PREEMPTIVE,
      }),
    explanation:
      'MLFQ מחלק לתורים עם quantum הולך וגדל. תהליכים קצרים נשארים בתור העליון ומקבלים response מהיר; תהליכים ארוכים יורדים לתורים איטיים יותר ומפנים דרך.',
  },
];

function fmt(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(2);
}

interface RunRow {
  case: AlgoCase;
  result: SchedulingResult;
}

function getTotalTime(result: SchedulingResult): number {
  const cpuEnd = result.cpuSegments[result.cpuSegments.length - 1]?.end ?? 0;
  const ioEnd = result.ioSegments[result.ioSegments.length - 1]?.end ?? 0;
  return Math.max(cpuEnd, ioEnd, 1);
}

export default function ComparisonWaitingTimeSimulator() {
  const [selectedId, setSelectedId] = useState<AlgoId | null>(null);

  const runs = useMemo<RunRow[]>(
    () => CASES.map((c) => ({ case: c, result: c.run() })),
    []
  );

  const processStyles = useMemo(
    () => computeProcessStyles(PRESET.processes),
    []
  );

  const bestWaiting = Math.min(...runs.map((r) => r.result.averageWaitingTime));
  const bestResponse = Math.min(
    ...runs.map((r) => r.result.averageResponseTime)
  );
  const bestTurnaround = Math.min(
    ...runs.map((r) => r.result.averageTurnaroundTime)
  );

  const selected = selectedId
    ? (runs.find((r) => r.case.id === selectedId) ?? null)
    : null;

  return (
    <section
      className="space-y-4 rounded-2xl border bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/40"
      dir="rtl"
    >
      <div>
        <div className="mb-1 text-sm font-bold text-indigo-700 dark:text-indigo-300">
          השוואת אלגוריתמים על אותו preset
        </div>
        <h2 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
          {PRESET.title}
        </h2>
        <p className="m-0 mt-2 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          {PRESET.description}
        </p>
        {PRESET.source ? (
          <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            מקור: {PRESET.source}
          </div>
        ) : null}
      </div>

      <IoWorkloadStrip
        processes={PRESET.processes}
        processStyles={processStyles}
        rightBadge={`${PRESET.processes.length} תהליכים`}
      />

      {/* LAYER A — Quick comparison cards */}
      <div>
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          תצוגה מהירה
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {runs.map(({ case: c, result }) => {
            const isSelected = selectedId === c.id;
            const isBestWaiting = result.averageWaitingTime === bestWaiting;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() =>
                  setSelectedId((prev) => (prev === c.id ? null : c.id))
                }
                className={cn(
                  'rounded-xl border bg-white p-3 text-right shadow-sm transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-slate-900',
                  isSelected
                    ? 'border-blue-500 ring-2 ring-blue-500 dark:border-blue-500'
                    : 'border-slate-200 hover:border-blue-300 dark:border-slate-700'
                )}
              >
                <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-base font-bold text-slate-950 dark:text-slate-50">
                    {c.label}
                  </span>
                  <span
                    className={cn(
                      'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                      c.mode === 'preemptive'
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                    )}
                  >
                    {c.mode}
                  </span>
                </div>
                <div className="mb-2 font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {c.paramsText}
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <MetricCell
                    label="Waiting"
                    value={result.averageWaitingTime}
                    highlight={result.averageWaitingTime === bestWaiting}
                  />
                  <MetricCell
                    label="Turnaround"
                    value={result.averageTurnaroundTime}
                    highlight={result.averageTurnaroundTime === bestTurnaround}
                  />
                  <MetricCell
                    label="Response"
                    value={result.averageResponseTime}
                    highlight={result.averageResponseTime === bestResponse}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <MiniTimeline result={result} styles={processStyles} />
                  {isBestWaiting ? (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                      Waiting מינימלי
                    </span>
                  ) : null}
                </div>
                <div className="mt-2 text-[11px] text-blue-700 dark:text-blue-300">
                  {isSelected ? 'נבחר — גלילה למטה' : 'לחץ לבדיקה מעמיקה'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* LAYER B — Focused detail view */}
      {selected ? (
        <div
          className="rounded-xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
          dir="rtl"
        >
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
                בדיקה מעמיקה
              </div>
              <h3 className="m-0 text-lg font-bold text-slate-950 dark:text-slate-50">
                {selected.case.label} — {selected.case.englishName}
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {selected.case.mode}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {selected.case.paramsText}
            </span>
            <button
              type="button"
              onClick={() => setSelectedId(null)}
              className="ms-auto text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
            >
              סגור
            </button>
          </div>

          <p className="m-0 mb-3 rounded-lg bg-indigo-50 p-3 text-sm leading-relaxed text-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-200">
            {selected.case.explanation}
          </p>

          <div className="mb-3">
            <IoAwareTimelineStrip
              cpuEntries={selected.result.cpuSegments}
              ioEntries={selected.result.ioSegments}
              totalTime={getTotalTime(selected.result)}
              currentTime={getTotalTime(selected.result)}
              processStyles={processStyles}
              isRunComplete
            />
          </div>

          <TimelineWorkloadSummary
            processes={PRESET.processes}
            metrics={selected.result.metrics}
            averageWaitingTime={selected.result.averageWaitingTime}
            averageTurnaroundTime={selected.result.averageTurnaroundTime}
            averageResponseTime={selected.result.averageResponseTime}
          />
        </div>
      ) : (
        <div className="rounded-xl border border-dashed bg-white/60 p-4 text-center text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          לחץ על אחת מהכרטיסיות למעלה כדי לראות את ציר הזמן המלא, חישוב המדדים
          ופירוט איך האלגוריתם פעל על ה-preset.
        </div>
      )}
    </section>
  );
}

interface MetricCellProps {
  label: string;
  value: number;
  highlight?: boolean;
}

function MetricCell({ label, value, highlight }: MetricCellProps) {
  return (
    <div
      className={cn(
        'rounded-md p-1.5',
        highlight
          ? 'bg-emerald-50 dark:bg-emerald-950/30'
          : 'bg-slate-50 dark:bg-slate-800/50'
      )}
    >
      <div
        className={cn(
          'text-[10px] font-semibold',
          highlight
            ? 'text-emerald-700 dark:text-emerald-300'
            : 'text-slate-500 dark:text-slate-400'
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          'font-mono text-sm font-bold',
          highlight
            ? 'text-emerald-900 dark:text-emerald-100'
            : 'text-slate-900 dark:text-slate-100'
        )}
      >
        {fmt(value)}
      </div>
    </div>
  );
}

interface MiniTimelineProps {
  result: SchedulingResult;
  styles: ReturnType<typeof computeProcessStyles>;
}

function MiniTimeline({ result, styles }: MiniTimelineProps) {
  const total = getTotalTime(result);
  return (
    <div className="flex h-2 flex-1 overflow-hidden rounded bg-slate-200 dark:bg-slate-800">
      {result.cpuSegments.map((seg) => {
        const pct = ((seg.end - seg.start) / total) * 100;
        const style = seg.processId ? styles[seg.processId] : undefined;
        const isIdle = seg.processId === null;
        return (
          <div
            key={seg.id}
            className={cn(
              isIdle
                ? 'bg-slate-300 dark:bg-slate-700'
                : (style?.solid ?? 'bg-slate-500')
            )}
            style={{ width: `${pct}%` }}
            title={`${seg.processId ?? 'Idle'} ${seg.start}–${seg.end}`}
          />
        );
      })}
    </div>
  );
}
