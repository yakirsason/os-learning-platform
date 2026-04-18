import type { ComponentType } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getSyncPage, type SyncPageSlug } from './syncPages';
import OverviewPage from '../pages/OverviewPage';
import CriticalSectionPage from '../pages/CriticalSectionPage';
import PetersonPage from '../pages/PetersonPage';
import HardwarePage from '../pages/HardwarePage';
import SemaphoresPage from '../pages/SemaphoresPage';
import ClassicProblemsPage from '../pages/ClassicProblemsPage';
import BoundedBufferPage from '../pages/BoundedBufferPage';
import ReadersWritersPage from '../pages/ReadersWritersPage';
import DiningPhilosophersPage from '../pages/DiningPhilosophersPage';
import MonitorsPage from '../pages/MonitorsPage';

const PAGE_COMPONENTS: Record<SyncPageSlug, ComponentType> = {
  overview: OverviewPage,
  'critical-section': CriticalSectionPage,
  peterson: PetersonPage,
  hardware: HardwarePage,
  semaphores: SemaphoresPage,
  'classic-problems': ClassicProblemsPage,
  'bounded-buffer': BoundedBufferPage,
  'readers-writers': ReadersWritersPage,
  'dining-philosophers': DiningPhilosophersPage,
  monitors: MonitorsPage,
};

export default function SyncLectureShell() {
  const { section } = useParams<{ section?: string }>();
  const page = getSyncPage(section);
  const PageComponent = PAGE_COMPONENTS[page.slug];

  return (
    <div dir="rtl" className="space-y-5">
      {section && section !== page.slug ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm dark:border-amber-900 dark:bg-amber-950/30">
          הנושא המבוקש לא נמצא. חזרנו לפתיחת ההרצאה.
          <Link className="ms-2 font-semibold" to="/lecture/synchronization">
            לפתיחה
          </Link>
        </div>
      ) : null}

      <div className="rounded-lg border bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900/40">
        <Link to="/lecture/synchronization" className="font-semibold no-underline">
          סנכרון ו-Semaphores
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
