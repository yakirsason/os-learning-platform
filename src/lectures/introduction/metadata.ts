import type { LectureMetadata } from '@/types';

// מטא-דאטה מקומית - זהה לרשומה ב-src/config/lectures.ts.
// נשמרת בנפרד כדי לאפשר ייבוא ישיר מתוך ה-MDX אם צריך.
export const metadata: LectureMetadata = {
  id: 'introduction',
  number: 1,
  title: 'מבוא למערכות הפעלה',
  englishTitle: 'Introduction to Operating Systems',
  description:
    'סקירה כללית של מערכות הפעלה - מהן, מה הן עושות, וכיצד הן בנויות. הרצאת פתיחה שמציגה את המבנה של מחשב, interrupts, היררכיית זיכרון, ומערכות מרובות מעבדים.',
  estimatedMinutes: 60,
  topics: [
    'מהי מערכת הפעלה ומה תפקידיה',
    'מבנה מחשב: Hardware, OS, Applications, Users',
    'אתחול מחשב (Bootstrap) ו-Firmware',
    'ארגון מערכת מחשב ו-Bus',
    'Interrupts - המנגנון המרכזי של OS',
    'I/O סינכרוני מול אסינכרוני',
    'היררכיית התקני אחסון',
    'Direct Memory Access (DMA)',
    'מערכות מרובות מעבדים (Multiprocessing)',
    'Multiprogramming ו-Timesharing',
  ],
  isReady: true,
};
