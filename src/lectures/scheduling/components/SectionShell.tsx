import type { ReactNode } from 'react';

interface SectionShellProps {
  id?: string;
  eyebrow?: string;
  title: string;
  intro: string;
  children: ReactNode;
}

export default function SectionShell({
  id,
  eyebrow,
  title,
  intro,
  children,
}: SectionShellProps) {
  return (
    <section id={id} className="scroll-mt-24 space-y-4">
      <div className="space-y-2">
        {eyebrow ? (
          <div className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-2xl font-bold text-slate-950 dark:text-slate-50">
          {title}
        </h2>
        <p className="max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {intro}
        </p>
      </div>
      {children}
    </section>
  );
}
