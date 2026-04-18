import { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, ChevronDown, ChevronUp, Circle, Clock } from 'lucide-react';
import { LECTURES } from '@/config/lectures';
import { getLectureStatus, useLectureStore } from '@/store/useLectureStore';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

function StatusIcon({ status }: { status: ReturnType<typeof getLectureStatus> }) {
  const className = 'h-4 w-4 shrink-0';
  if (status === 'completed') {
    return <CheckCircle2 className={cn(className, 'text-emerald-500')} />;
  }
  if (status === 'in-progress') {
    return <Clock className={cn(className, 'text-amber-500')} />;
  }
  return <Circle className={cn(className, 'text-slate-400')} />;
}

export default function Sidebar() {
  const progress = useLectureStore((s) => s.progress);
  const resetProgress = useLectureStore((s) => s.resetProgress);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [expandedLectureId, setExpandedLectureId] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const activeLectureId = useMemo(() => {
    const activeLecture = LECTURES.find((lecture) => {
      const lecturePath = `/lecture/${lecture.id}`;
      return (
        location.pathname === lecturePath ||
        location.pathname.startsWith(`${lecturePath}/`)
      );
    });
    return activeLecture?.id ?? null;
  }, [location.pathname]);

  useEffect(() => {
    if (!activeLectureId) {
      setExpandedLectureId(null);
      return;
    }
    const activeLecture = LECTURES.find((lecture) => lecture.id === activeLectureId);
    if (activeLecture?.subtopics?.length) {
      setExpandedLectureId(activeLectureId);
    } else {
      setExpandedLectureId(null);
    }
  }, [activeLectureId]);

  const handleLectureToggle = (
    lectureId: string,
    lecturePath: string,
    isLectureActive: boolean
  ) => {
    setExpandedLectureId((current) => (current === lectureId ? null : lectureId));
    if (!isLectureActive) {
      navigate(lecturePath);
    }
  };

  return (
    <aside className="flex w-72 shrink-0 flex-col border-e bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex-1 overflow-y-auto p-4">
        <h2 className="mb-3 px-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          תכני הקורס
        </h2>

        <nav className="space-y-1">
          {LECTURES.map((lecture) => {
            const status = getLectureStatus(progress, lecture.id);
            const lecturePath = `/lecture/${lecture.id}`;
            const isLectureActive =
              location.pathname === lecturePath ||
              location.pathname.startsWith(`${lecturePath}/`);
            const subtopics = lecture.subtopics ?? [];
            const hasSubtopics = subtopics.length > 0;
            const isExpanded = expandedLectureId === lecture.id;
            return (
              <div key={lecture.id}>
                {hasSubtopics ? (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    className={cn(
                      'group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                      isLectureActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                    )}
                    onClick={() =>
                      handleLectureToggle(lecture.id, lecturePath, isLectureActive)
                    }
                  >
                    <>
                      <span
                        className={cn(
                          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                          isLectureActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                        )}
                      >
                        {lecture.number}
                      </span>
                      <span className="flex-1 truncate">{lecture.title}</span>
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 shrink-0 opacity-70" />
                      ) : (
                        <ChevronDown className="h-4 w-4 shrink-0 opacity-70" />
                      )}
                      <StatusIcon status={status} />
                    </>
                  </button>
                ) : (
                  <NavLink
                    to={lecturePath}
                    className={({ isActive }) =>
                      cn(
                        'group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
                        isActive || isLectureActive
                          ? 'bg-primary/10 text-primary'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                            isActive || isLectureActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          )}
                        >
                          {lecture.number}
                        </span>
                        <span className="flex-1 truncate">{lecture.title}</span>
                        <StatusIcon status={status} />
                      </>
                    )}
                  </NavLink>
                )}

                {isExpanded && hasSubtopics ? (
                  <div className="ms-9 mt-1 space-y-0.5 border-s border-slate-200 ps-3 dark:border-slate-700">
                    {subtopics.map((subtopic) => {
                      const subtopicPath =
                        subtopic.id === 'overview'
                          ? lecturePath
                          : `${lecturePath}/${subtopic.id}`;
                      const isSubtopicActive =
                        location.pathname === subtopicPath ||
                        (subtopic.id === 'overview' && location.pathname === lecturePath);

                      return (
                        <NavLink
                          key={subtopic.id}
                          to={subtopicPath}
                          end={subtopic.id === 'overview'}
                          className={({ isActive }) =>
                            cn(
                              'block rounded-md px-2 py-1.5 text-xs no-underline transition-colors',
                              isActive || isSubtopicActive
                                ? 'bg-primary/10 font-semibold text-primary'
                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                            )
                          }
                        >
                          <span className="block truncate">{subtopic.title}</span>
                          {subtopic.englishTitle ? (
                            <span className="block truncate font-mono text-[9px] opacity-70">
                              {subtopic.englishTitle}
                            </span>
                          ) : null}
                        </NavLink>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4 dark:border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50"
          onClick={() => setConfirmOpen(true)}
        >
          אפס התקדמות
        </Button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>איפוס התקדמות</DialogTitle>
            <DialogDescription>
              הפעולה תמחק את מצב הסיום והתקדמותך בכל ההרצאות. האם להמשיך?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              ביטול
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                resetProgress();
                setConfirmOpen(false);
              }}
            >
              אפס
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </aside>
  );
}
