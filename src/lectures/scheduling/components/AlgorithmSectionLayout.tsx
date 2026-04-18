import type { ReactNode } from 'react';

interface AlgorithmSectionLayoutProps {
  id: string;
  title: string;
  englishName: string;
  explanation: string;
  whyItMatters: string;
  simulatorNote: string;
  noteTitle?: string;
  children?: ReactNode;
}

export default function AlgorithmSectionLayout({
  id,
  title,
  englishName,
  explanation,
  whyItMatters,
  simulatorNote,
  noteTitle = 'מה חשוב כאן',
  children,
}: AlgorithmSectionLayoutProps) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
    >
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
          {title}
        </h3>
        <span className="rounded-md border px-2 py-0.5 font-mono text-[11px] text-slate-600 dark:border-slate-700 dark:text-slate-300">
          {englishName}
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
            מה הרעיון
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {explanation}
          </p>
        </div>

        <div className="rounded-md border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="mb-1 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            למה זה חשוב
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {whyItMatters}
          </p>
        </div>

        <div className="rounded-md border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="mb-1 text-xs font-bold text-amber-700 dark:text-amber-300">
            {noteTitle}
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            {simulatorNote}
          </p>
        </div>
      </div>

      {children ? <div className="mt-4">{children}</div> : null}
    </section>
  );
}
