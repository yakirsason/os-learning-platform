import { useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import StudyCallout from '@/components/common/StudyCallout';
import { cn } from '@/lib/utils';
import PageShell from '../components/PageShell';
import {
  OPTION_IDS,
  SYNC_PRACTICE_QUESTIONS,
  type PracticeOptionId,
  type PracticeQuestion,
} from '../lib/practiceQuestions';

type AnswerMap = Partial<Record<number, PracticeOptionId>>;
type SubmittedMap = Partial<Record<number, boolean>>;

function renderQuestionText(question: string) {
  const codeStart = question.indexOf('Process P1:');
  if (codeStart === -1) {
    return <p className="m-0 whitespace-pre-line text-base leading-relaxed">{question}</p>;
  }

  const intro = question.slice(0, codeStart).trim();
  const tailStart = question.indexOf('כאשר', codeStart);
  const code = question.slice(codeStart, tailStart).trim();
  const tail = question.slice(tailStart).trim();

  return (
    <div className="space-y-3">
      <p className="m-0 leading-relaxed">{intro}</p>
      <pre
        className="m-0 max-w-full overflow-x-auto rounded-md bg-slate-950 p-3 text-xs leading-relaxed text-slate-100"
        dir="ltr"
      >
        {code}
      </pre>
      <p className="m-0 whitespace-pre-line leading-relaxed">{tail}</p>
    </div>
  );
}

interface OptionButtonProps {
  question: PracticeQuestion;
  optionId: PracticeOptionId;
  selected: boolean;
  submitted: boolean;
  onSelect: (option: PracticeOptionId) => void;
}

function OptionButton({ question, optionId, selected, submitted, onSelect }: OptionButtonProps) {
  const correct = question.correct === optionId;
  const wrongSelection = submitted && selected && !correct;
  const correctSelection = submitted && correct;

  return (
    <button
      type="button"
      disabled={submitted}
      onClick={() => onSelect(optionId)}
      className={cn(
        'flex w-full min-w-0 items-start gap-3 rounded-lg border p-3 text-start text-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
        selected && !submitted
          ? 'border-blue-500 bg-blue-50 text-blue-950 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-100'
          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900',
        correctSelection
          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 dark:border-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-100'
          : '',
        wrongSelection
          ? 'border-red-500 bg-red-50 text-red-950 dark:border-red-700 dark:bg-red-950/40 dark:text-red-100'
          : '',
        submitted ? 'cursor-default hover:bg-inherit' : ''
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
          selected || correctSelection
            ? 'border-current bg-white/70 dark:bg-slate-950/40'
            : 'border-slate-300 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
        )}
      >
        {optionId}
      </span>
      <span className="min-w-0 flex-1 leading-relaxed">{question.options[optionId]}</span>
      {correctSelection ? <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" /> : null}
      {wrongSelection ? <XCircle className="mt-1 h-4 w-4 shrink-0 text-red-600" /> : null}
    </button>
  );
}

export default function PracticePage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState<SubmittedMap>({});

  const question = SYNC_PRACTICE_QUESTIONS[currentIndex];
  const selected = answers[question.id];
  const isSubmitted = submitted[question.id] === true;
  const isCorrect = isSubmitted && selected === question.correct;

  const stats = useMemo(() => {
    const checked = SYNC_PRACTICE_QUESTIONS.filter((item) => submitted[item.id]).length;
    const correct = SYNC_PRACTICE_QUESTIONS.filter(
      (item) => submitted[item.id] && answers[item.id] === item.correct
    ).length;
    return { checked, correct };
  }, [answers, submitted]);

  const handleSelect = (option: PracticeOptionId) => {
    if (isSubmitted) return;
    setAnswers((prev) => ({ ...prev, [question.id]: option }));
  };

  const handleSubmit = () => {
    if (!selected || isSubmitted) return;
    setSubmitted((prev) => ({ ...prev, [question.id]: true }));
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setAnswers({});
    setSubmitted({});
  };

  return (
    <PageShell
      eyebrow="Practice"
      title="תרגול"
      intro="עשר שאלות אמריקאיות קצרות בסגנון מבחן על סנכרון תהליכים. בחרו תשובה, בדקו, והמשיכו לשאלה הבאה."
    >
      <StudyCallout variant="exam">
        המטרה כאן היא זיהוי מהיר של המושגים: Race Condition, Critical Section, Peterson ו-Semaphores.
        אין ניקוד רשמי או זמן - זה תרגול ממוקד לפני מבחן.
      </StudyCallout>

      <section className="w-full min-w-0 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="text-xs font-bold text-blue-700 dark:text-blue-300">
              שאלה {currentIndex + 1} מתוך {SYNC_PRACTICE_QUESTIONS.length}
            </div>
            <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              נבדקו {stats.checked} / {SYNC_PRACTICE_QUESTIONS.length} · נכונות {stats.correct}
            </div>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            איפוס תרגול
          </button>
        </div>

        <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{
              width: `${((currentIndex + 1) / SYNC_PRACTICE_QUESTIONS.length) * 100}%`,
            }}
          />
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/60">
          <div className="mb-4 text-slate-900 dark:text-slate-50">
            {renderQuestionText(question.question)}
          </div>

          <div className="space-y-2">
            {OPTION_IDS.map((optionId) => (
              <OptionButton
                key={`${question.id}-${optionId}`}
                question={question}
                optionId={optionId}
                selected={selected === optionId}
                submitted={isSubmitted}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </div>

        <div className="mt-4 min-h-24 rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
          {isSubmitted ? (
            <div className="space-y-2 text-sm leading-relaxed">
              <div
                className={cn(
                  'flex items-center gap-2 font-semibold',
                  isCorrect ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'
                )}
              >
                {isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                {isCorrect ? 'נכון' : 'לא נכון'}
              </div>
              <p className="m-0 text-slate-700 dark:text-slate-200">
                התשובה הנכונה היא <strong>{question.correct}</strong>: {question.options[question.correct]}
              </p>
              {question.explanation ? (
                <p className="m-0 text-xs text-slate-600 dark:text-slate-400">{question.explanation}</p>
              ) : null}
            </div>
          ) : (
            <p className="m-0 text-sm text-slate-600 dark:text-slate-300">
              בחרו תשובה אחת ולחצו על "בדוק תשובה".
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setCurrentIndex((idx) => Math.max(0, idx - 1))}
            disabled={currentIndex === 0}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            הקודמת
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!selected || isSubmitted}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-600 dark:disabled:bg-slate-700 dark:disabled:text-slate-300"
          >
            בדוק תשובה
          </button>

          <button
            type="button"
            onClick={() =>
              setCurrentIndex((idx) => Math.min(SYNC_PRACTICE_QUESTIONS.length - 1, idx + 1))
            }
            disabled={currentIndex === SYNC_PRACTICE_QUESTIONS.length - 1}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
          >
            הבאה
          </button>
        </div>
      </section>
    </PageShell>
  );
}
