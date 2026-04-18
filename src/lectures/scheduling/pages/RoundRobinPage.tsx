import PageShell from '../components/PageShell';
import RoundRobinSection from '../components/algorithms/RoundRobinSection';
import CoreAlgorithmsGanttSimulator from '../visualizations/CoreAlgorithmsGanttSimulator';

export default function RoundRobinPage() {
  return (
    <PageShell
      eyebrow="Round Robin"
      title="Round Robin"
      intro="עמוד ממוקד ל-Round Robin: quantum קבוע, preemption על ידי timer, וחזרה לסוף ה-Ready Queue."
    >
      <CoreAlgorithmsGanttSimulator initialAlgorithm="round-robin" />
      <RoundRobinSection />
    </PageShell>
  );
}
