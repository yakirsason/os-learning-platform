import AlgorithmSectionLayout from '../AlgorithmSectionLayout';

export default function MultilevelQueueSection() {
  return (
    <AlgorithmSectionLayout
      id="multilevel-queue"
      title="תורים מרובי רמות"
      englishName="Multilevel Queue"
      explanation="מחלקים תהליכים לכמה תורים, למשל foreground ו-background. לכל תור יכולה להיות מדיניות תזמון משלו."
      whyItMatters="המודל הזה מראה שה-Scheduler לא חייב להתייחס לכל התהליכים כאילו הם מאותו סוג."
      simulatorNote="בהמשך נוסיף תרשים תורים שמפריד בין סוגי עומסים ומדיניות לכל תור."
    />
  );
}
