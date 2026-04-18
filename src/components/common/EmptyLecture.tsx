import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { LectureMetadata } from '@/types';

interface EmptyLectureProps {
  lecture: LectureMetadata;
}

export default function EmptyLecture({ lecture }: EmptyLectureProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10">
        <BookOpen className="h-12 w-12 text-primary" />
      </div>

      <h2 className="mb-3 text-2xl font-semibold text-slate-900 dark:text-slate-50">
        ההרצאה עדיין לא נוספה
      </h2>

      <p className="mb-8 max-w-md text-sm leading-relaxed text-slate-600 dark:text-slate-400">
        כדי להוסיף הרצאה זו, שלח את המצגת לצ'אט עם Claude וקבל prompt מותאם
        ל-Claude Code
      </p>

      <Card className="w-full max-w-md">
        <CardContent className="flex items-center justify-between gap-4 p-4">
          <div className="flex flex-col gap-1 text-start">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              הרצאה {lecture.number}
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-50">
              {lecture.title}
            </span>
          </div>
          <Badge variant="outline" className="font-mono">
            {lecture.englishTitle}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
}
