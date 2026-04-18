import PageShell from '../components/PageShell';
import FcfsSection from '../components/algorithms/FcfsSection';
import CoreAlgorithmsGanttSimulator from '../visualizations/CoreAlgorithmsGanttSimulator';

export default function FcfsPage() {
  return (
    <PageShell
      eyebrow="FCFS"
      title="FCFS"
      intro="עמוד ממוקד ל-First-Come, First-Served: סדר הגעה, nonpreemptive ו-convoy effect."
    >
      <CoreAlgorithmsGanttSimulator initialAlgorithm="fcfs" />
      <FcfsSection />
    </PageShell>
  );
}
