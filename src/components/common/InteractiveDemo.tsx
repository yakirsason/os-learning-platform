import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface InteractiveDemoProps {
  title: string;
  children: ReactNode; // האזור הויזואלי - תרשים/אנימציה/הדמיה
  explanation?: ReactNode; // הסבר צדדי אופציונלי
}

export default function InteractiveDemo({
  title,
  children,
  explanation,
}: InteractiveDemoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-h-[280px] rounded-lg border bg-slate-50 p-4 dark:bg-slate-900/50">
            {children}
          </div>
          {explanation ? (
            <aside className="rounded-lg border bg-muted/40 p-4 text-sm leading-relaxed">
              {explanation}
            </aside>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
