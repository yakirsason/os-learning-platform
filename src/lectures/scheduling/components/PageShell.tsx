import type { ReactNode } from 'react';

interface PageShellProps {
  eyebrow?: string;
  title: string;
  intro?: string;
  children: ReactNode;
}

export default function PageShell({
  eyebrow,
  title,
  intro,
  children,
}: PageShellProps) {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        {eyebrow ? (
          <div className="text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="m-0 text-3xl font-bold text-slate-950 dark:text-slate-50">
          {title}
        </h1>
        {intro ? (
          <p className="m-0 max-w-3xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
            {intro}
          </p>
        ) : null}
      </header>
      {children}
    </section>
  );
}
