import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function MultilevelFeedbackQueueSection() {
  return (
    <AlgorithmSectionLayout
      id="multilevel-feedback-queue"
      title="תורים מרובי רמות עם משוב"
      englishName="Multilevel Feedback Queue"
      explanation="גם כאן יש כמה תורים, אבל תהליך יכול לעבור ביניהם לפי ההתנהגות שלו בזמן ריצה."
      whyItMatters="זה מכין אותנו לרעיון חשוב: המערכת יכולה ללמוד משהו מההתנהגות של התהליך, גם בלי לדעת מראש את ה-burst הבא."
      simulatorNote="בגל מאוחר יותר נוסיף הדמיה שמראה תהליך עולה או יורד בין תורים לפי השימוש שלו ב-CPU."
    />
  );
}
