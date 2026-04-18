import PageShell from '../components/PageShell';
import SecondaryTopicsOverview from '../components/SecondaryTopicsOverview';

export default function SecondaryTopicsPage() {
  return (
    <PageShell
      eyebrow="Secondary Topics"
      title="נושאים משלימים"
      intro="נושאי המשך קצרים מהשקפים נשמרים כאן כעמוד נפרד, בלי להעמיק בהם עדיין."
    >
      <SecondaryTopicsOverview />
    </PageShell>
  );
}
