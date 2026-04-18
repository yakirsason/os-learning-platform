import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ConceptVariant = 'default' | 'info' | 'warning' | 'success';

export interface ConceptCardProps {
  title: string;
  englishTerm?: string;
  description: string;
  variant?: ConceptVariant;
}

const VARIANT_STYLES: Record<ConceptVariant, string> = {
  default: '',
  info: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/50',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/50',
  success:
    'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/50',
};

export default function ConceptCard({
  title,
  englishTerm,
  description,
  variant = 'default',
}: ConceptCardProps) {
  return (
    <Card className={cn(VARIANT_STYLES[variant])}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg">{title}</CardTitle>
          {englishTerm ? (
            <Badge variant="outline" className="font-mono text-xs">
              {englishTerm}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}
