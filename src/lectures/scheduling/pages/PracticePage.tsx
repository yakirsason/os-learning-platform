import PageShell from '../components/PageShell';
import ConceptPracticePanel from '../components/practice/ConceptPracticePanel';

export default function PracticePage() {
  return (
    <PageShell
      eyebrow="תרגול"
      title="תרגול מושגים בתזמון CPU"
      intro="שאלות רב־ברירה שמתרגלות את הרעיונות המרכזיים בהרצאה, בלי לבנות Gantt chart ובלי לבצע חישובי זמנים."
    >
      <ConceptPracticePanel />
    </PageShell>
  );
}
