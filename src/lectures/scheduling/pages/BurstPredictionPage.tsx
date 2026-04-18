import PageShell from '../components/PageShell';
import BurstPredictionSection from '../components/algorithms/BurstPredictionSection';

export default function BurstPredictionPage() {
  return (
    <PageShell
      eyebrow="CPU Burst Prediction"
      title="חיזוי CPU burst"
      intro="עמוד המשך ל-SJF: איך ה-OS יכול להעריך את ה-CPU burst הבא כשהוא לא באמת יודע את העתיד."
    >
      <BurstPredictionSection />
    </PageShell>
  );
}
