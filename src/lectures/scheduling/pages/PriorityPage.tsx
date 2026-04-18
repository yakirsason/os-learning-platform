import PageShell from '../components/PageShell';
import PrioritySchedulingSection from '../components/algorithms/PrioritySchedulingSection';
import CoreAlgorithmsGanttSimulator from '../visualizations/CoreAlgorithmsGanttSimulator';

export default function PriorityPage() {
  return (
    <PageShell
      eyebrow="Priority Scheduling"
      title="Priority Scheduling"
      intro="עמוד ממוקד לתזמון לפי עדיפות: מספר קטן יותר, starvation ו-aging."
    >
      <CoreAlgorithmsGanttSimulator initialAlgorithm="priority" />
      <PrioritySchedulingSection />
    </PageShell>
  );
}
