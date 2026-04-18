import PageShell from '../components/PageShell';
import SrtfSection from '../components/algorithms/SrtfSection';
import CoreAlgorithmsGanttSimulator from '../visualizations/CoreAlgorithmsGanttSimulator';

export default function SrtfPage() {
  return (
    <PageShell
      eyebrow="SRTF"
      title="SRTF"
      intro="עמוד ממוקד ל-Shortest Remaining Time First: הגרסה ה-preemptive שבה תהליך חדש וקצר יותר יכול לעצור את מי שרץ."
    >
      <CoreAlgorithmsGanttSimulator initialAlgorithm="srtf" />
      <SrtfSection />
    </PageShell>
  );
}
