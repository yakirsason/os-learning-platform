import type { ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSchedulingPage, type SchedulingPageSlug } from './schedulingPages';
import BasicConceptsPage from '../pages/BasicConceptsPage';
import BurstPredictionPage from '../pages/BurstPredictionPage';
import ComparisonWaitingTimePage from '../pages/ComparisonWaitingTimePage';
import CriteriaPage from '../pages/CriteriaPage';
import FcfsPage from '../pages/FcfsPage';
import MultilevelFeedbackQueuePage from '../pages/MultilevelFeedbackQueuePage';
import MultilevelQueuePage from '../pages/MultilevelQueuePage';
import OverviewPage from '../pages/OverviewPage';
import PracticePage from '../pages/PracticePage';
import PriorityPage from '../pages/PriorityPage';
import IoRoundRobinPage from '../pages/IoRoundRobinPage';
import RoundRobinPage from '../pages/RoundRobinPage';
import SchedulerDispatcherPage from '../pages/SchedulerDispatcherPage';
import SecondaryTopicsPage from '../pages/SecondaryTopicsPage';
import SjfPage from '../pages/SjfPage';
import SrtfPage from '../pages/SrtfPage';
import SummaryPage from '../pages/SummaryPage';

const PAGE_COMPONENTS: Record<SchedulingPageSlug, ComponentType> = {
  overview: OverviewPage,
  'basic-concepts': BasicConceptsPage,
  'scheduler-dispatcher': SchedulerDispatcherPage,
  criteria: CriteriaPage,
  fcfs: FcfsPage,
  sjf: SjfPage,
  'burst-prediction': BurstPredictionPage,
  srtf: SrtfPage,
  priority: PriorityPage,
  'round-robin': RoundRobinPage,
  'io-round-robin': IoRoundRobinPage,
  'multilevel-queue': MultilevelQueuePage,
  'multilevel-feedback-queue': MultilevelFeedbackQueuePage,
  'comparison-waiting-time': ComparisonWaitingTimePage,
  'secondary-topics': SecondaryTopicsPage,
  practice: PracticePage,
  summary: SummaryPage,
};

export default function SchedulingLectureShell() {
  const { section } = useParams<{ section?: string }>();
  const page = getSchedulingPage(section);
  const PageComponent = PAGE_COMPONENTS[page.slug];

  return (
    <div dir="rtl" className="space-y-5">
      {section && section !== page.slug ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          הנושא המבוקש לא נמצא. חזרנו לפתיחת ההרצאה.
          <Link className="ms-2 font-semibold" to="/lecture/scheduling">
            לפתיחה
          </Link>
        </div>
      ) : null}

      <div className="rounded-lg border bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <Link to="/lecture/scheduling" className="font-semibold no-underline">
          תזמון מעבד
        </Link>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-700 dark:text-slate-200">{page.title}</span>
      </div>

      <main className="min-w-0 rounded-lg border bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <PageComponent />
      </main>
    </div>
  );
}
