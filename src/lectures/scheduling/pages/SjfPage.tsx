import { Link } from 'react-router-dom';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';
import SjfSection from '../components/algorithms/SjfSection';
import CoreAlgorithmsGanttSimulator from '../visualizations/CoreAlgorithmsGanttSimulator';

export default function SjfPage() {
  return (
    <PageShell
      eyebrow="SJF"
      title="SJF"
      intro="עמוד ממוקד ל-Shortest Job First בגרסה nonpreemptive: בוחרים את ה-CPU burst הקצר ביותר מבין התהליכים המוכנים."
    >
      <CoreAlgorithmsGanttSimulator initialAlgorithm="sjf" />
      <SjfSection />
      <StudyCallout variant="remember" title="הקושי המעשי">
        ב-SJF אנחנו מניחים שיודעים מה ה-CPU burst הבא. בפועל ה-OS לא יודע את העתיד
        בדיוק, ולכן משתמשים בהערכה. את שיטת החיזוי עצמה לומדים בעמוד{' '}
        <Link
          to="/lecture/scheduling/burst-prediction"
          className="font-semibold text-blue-700 no-underline hover:underline dark:text-blue-300"
        >
          חיזוי CPU burst
        </Link>
        .
      </StudyCallout>
    </PageShell>
  );
}
