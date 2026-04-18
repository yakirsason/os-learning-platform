import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  CONCEPT_PRACTICE_CATEGORIES,
  CONCEPT_PRACTICE_QUESTIONS,
  type ConceptPracticeOptionId,
} from '../../lib/conceptPracticeQuestions';
import ConceptPracticeQuestionCard from './ConceptPracticeQuestionCard';

type AnswerMap = Partial<Record<string, ConceptPracticeOptionId>>;

export default function ConceptPracticePanel() {
  const [answers, setAnswers] = useState<AnswerMap>({});

  const totalQuestions = CONCEPT_PRACTICE_QUESTIONS.length;
  const answeredCount = CONCEPT_PRACTICE_QUESTIONS.filter(
    (question) => answers[question.id] !== undefined
  ).length;
  const correctCount = CONCEPT_PRACTICE_QUESTIONS.filter(
    (question) => answers[question.id] === question.correctOptionId
  ).length;
  const answeredPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleAnswer = (
    questionId: string,
    optionId: ConceptPracticeOptionId
  ) => {
    setAnswers((currentAnswers) => {
      if (currentAnswers[questionId] !== undefined) {
        return currentAnswers;
      }

      return {
        ...currentAnswers,
        [questionId]: optionId,
      };
    });
  };

  const handleResetQuestion = (questionId: string) => {
    setAnswers((currentAnswers) => {
      const nextAnswers = { ...currentAnswers };
      delete nextAnswers[questionId];
      return nextAnswers;
    });
  };

  return (
    <div className="space-y-5" dir="rtl">
      <section className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <h2 className="m-0 text-xl font-bold text-blue-950 dark:text-blue-100">
              תרגול מושגים רב־ברירה
            </h2>
            <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
              כאן מתרגלים הבנה, לא חישוב. בחר תשובה אחת בכל שאלה,
              וקבל מיד הסבר למה היא נכונה או למה התבלבלת.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setAnswers({})}
            disabled={answeredCount === 0}
            className="shrink-0 bg-white dark:bg-slate-950"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            איפוס תשובות
          </Button>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-md border border-blue-200 bg-white p-3 dark:border-blue-900 dark:bg-slate-950/30">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              התקדמות
            </div>
            <div className="mt-1 text-2xl font-bold text-slate-950 dark:text-slate-50">
              {answeredCount}/{totalQuestions}
            </div>
          </div>
          <div className="rounded-md border border-emerald-200 bg-white p-3 dark:border-emerald-900 dark:bg-slate-950/30">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              תשובות נכונות
            </div>
            <div className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-200">
              {correctCount}
            </div>
          </div>
          <div className="rounded-md border border-amber-200 bg-white p-3 dark:border-amber-900 dark:bg-slate-950/30">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400">
              טיפ עבודה
            </div>
            <div className="mt-1 text-sm font-semibold leading-relaxed text-amber-900 dark:text-amber-100">
              ענה לפני שאתה פותח את ההסבר. זה עוזר לזהות בלבול אמיתי.
            </div>
          </div>
        </div>

        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-white dark:bg-slate-950"
          aria-hidden="true"
        >
          <div
            className="h-full rounded-full bg-blue-600"
            style={{ width: `${answeredPercent}%` }}
          />
        </div>
      </section>

      {CONCEPT_PRACTICE_CATEGORIES.map((category) => {
        const questions = CONCEPT_PRACTICE_QUESTIONS.filter(
          (question) => question.categoryId === category.id
        );

        return (
          <section key={category.id} className="space-y-3">
            <header className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/40">
              <h2 className="m-0 text-xl font-bold text-slate-950 dark:text-slate-50">
                {category.title}
              </h2>
              <p className="m-0 mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {category.description}
              </p>
            </header>

            <div className="space-y-3">
              {questions.map((question) => (
                <ConceptPracticeQuestionCard
                  key={question.id}
                  question={question}
                  index={CONCEPT_PRACTICE_QUESTIONS.indexOf(question)}
                  selectedOptionId={answers[question.id]}
                  onAnswer={handleAnswer}
                  onReset={handleResetQuestion}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
