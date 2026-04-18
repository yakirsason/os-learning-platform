import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  ConceptPracticeOption,
  ConceptPracticeOptionId,
  ConceptPracticeQuestion,
} from '../../lib/conceptPracticeQuestions';

interface ConceptPracticeQuestionCardProps {
  question: ConceptPracticeQuestion;
  index: number;
  selectedOptionId?: ConceptPracticeOptionId;
  onAnswer: (questionId: string, optionId: ConceptPracticeOptionId) => void;
  onReset: (questionId: string) => void;
}

const OPTION_LABELS: Record<ConceptPracticeOptionId, string> = {
  a: 'א',
  b: 'ב',
  c: 'ג',
  d: 'ד',
};

function getOptionStateLabel(
  option: ConceptPracticeOption,
  selectedOptionId: ConceptPracticeOptionId | undefined,
  correctOptionId: ConceptPracticeOptionId
) {
  if (option.id === correctOptionId) {
    return '✓ תשובה נכונה';
  }

  if (option.id === selectedOptionId) {
    return '✗ נבחרה בטעות';
  }

  return null;
}

export default function ConceptPracticeQuestionCard({
  question,
  index,
  selectedOptionId,
  onAnswer,
  onReset,
}: ConceptPracticeQuestionCardProps) {
  const isAnswered = selectedOptionId !== undefined;
  const isCorrect = selectedOptionId === question.correctOptionId;
  const correctOption = question.options.find(
    (option) => option.id === question.correctOptionId
  );

  return (
    <article
      id={question.id}
      className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950/30"
    >
      <header className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              שאלה {index + 1}
            </span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
              {question.topic}
            </span>
            {isAnswered ? (
              <span
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
                  isCorrect
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'
                    : 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-200'
                )}
              >
                {isCorrect ? (
                  <CheckCircle2 className="size-4" aria-hidden="true" />
                ) : (
                  <XCircle className="size-4" aria-hidden="true" />
                )}
                {isCorrect ? '✓ נכון' : '✗ לא נכון'}
              </span>
            ) : null}
          </div>
          <h3 className="m-0 text-lg font-bold leading-snug text-slate-950 dark:text-slate-50">
            {question.prompt}
          </h3>
        </div>

        {isAnswered ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onReset(question.id)}
            className="shrink-0 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-slate-50"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            נסה שוב
          </Button>
        ) : null}
      </header>

      <div className="grid gap-2">
        {question.options.map((option) => {
          const optionStateLabel = isAnswered
            ? getOptionStateLabel(
                option,
                selectedOptionId,
                question.correctOptionId
              )
            : null;
          const isSelected = option.id === selectedOptionId;
          const isOptionCorrect = option.id === question.correctOptionId;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onAnswer(question.id, option.id)}
              disabled={isAnswered}
              aria-pressed={isSelected}
              className={cn(
                'flex w-full items-start gap-3 rounded-md border p-3 text-start text-sm leading-relaxed transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950',
                !isAnswered &&
                  'border-slate-200 bg-slate-50 text-slate-800 hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-100 dark:hover:border-blue-800 dark:hover:bg-blue-950/30',
                isAnswered &&
                  isOptionCorrect &&
                  'border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-100',
                isAnswered &&
                  isSelected &&
                  !isOptionCorrect &&
                  'border-red-300 bg-red-50 text-red-950 dark:border-red-800 dark:bg-red-950/30 dark:text-red-100',
                isAnswered &&
                  !isSelected &&
                  !isOptionCorrect &&
                  'border-slate-200 bg-white text-slate-500 opacity-80 dark:border-slate-800 dark:bg-slate-950/20 dark:text-slate-400'
              )}
            >
              <span
                className={cn(
                  'mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
                  isAnswered && isOptionCorrect
                    ? 'border-emerald-400 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-100'
                    : 'border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
                  isAnswered &&
                    isSelected &&
                    !isOptionCorrect &&
                    'border-red-400 bg-red-100 text-red-800 dark:border-red-700 dark:bg-red-900/60 dark:text-red-100'
                )}
              >
                {OPTION_LABELS[option.id]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{option.text}</span>
                {optionStateLabel ? (
                  <span className="mt-1 block text-xs font-bold">
                    {optionStateLabel}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {isAnswered && correctOption ? (
        <section className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="mb-2 text-sm font-bold text-blue-900 dark:text-blue-100">
            הסבר
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
            {question.explanation}
          </p>

          <div className="mt-3 grid gap-2 text-sm">
            <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-950/30">
              <strong className="text-emerald-700 dark:text-emerald-200">
                למה התשובה הנכונה נכונה:
              </strong>{' '}
              <span className="text-slate-700 dark:text-slate-200">
                {correctOption.explanation}
              </span>
            </div>
            <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950/30">
              <strong className="text-slate-800 dark:text-slate-100">
                למה האחרות לא:
              </strong>
              <ul className="m-0 mt-2 space-y-1 text-slate-700 dark:text-slate-200">
                {question.options
                  .filter((option) => option.id !== question.correctOptionId)
                  .map((option) => (
                    <li key={option.id}>
                      <span className="font-bold">
                        {OPTION_LABELS[option.id]}:
                      </span>{' '}
                      {option.explanation}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100">
              <strong>זכור למבחן:</strong> {question.examTip}
            </div>
          </div>
        </section>
      ) : null}
    </article>
  );
}
