import { Suspense, lazy, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import EmptyLecture from '@/components/common/EmptyLecture';
import { getLectureById } from '@/config/lectures';

// טעינה דינמית של קבצי MDX מתוך src/lectures/{id}/index.mdx.
// כאשר אין תיקייה מתאימה (מצב ברירת מחדל של תשתית נקייה) - תוצג EmptyLecture.
const lectureModules = import.meta.glob('/src/lectures/*/index.mdx');

export default function LecturePage() {
  const { id } = useParams<{ id: string }>();
  const lecture = id ? getLectureById(id) : undefined;

  const LazyContent = useMemo(() => {
    if (!id) return null;
    const loader = lectureModules[`/src/lectures/${id}/index.mdx`];
    if (!loader) return null;
    return lazy(loader as () => Promise<{ default: React.ComponentType }>);
  }, [id]);

  if (!lecture) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          ההרצאה לא נמצאה
        </h2>
      </div>
    );
  }

  if (!lecture.isReady || !LazyContent) {
    return <EmptyLecture lecture={lecture} />;
  }

  return (
    <article className="prose prose-slate max-w-none dark:prose-invert">
      <Suspense fallback={<div className="py-8 text-center text-sm">טוען הרצאה...</div>}>
        <LazyContent />
      </Suspense>
    </article>
  );
}
