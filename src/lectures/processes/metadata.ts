import type { LectureMetadata } from '@/types';

// מטא-דאטה מקומית - זהה לרשומה ב-src/config/lectures.ts.
export const metadata: LectureMetadata = {
  id: 'processes',
  number: 3,
  title: 'תהליכים',
  englishTitle: 'Processes',
  description:
    'מהו תהליך, איך הוא מאוחסן בזיכרון, חמשת מצבי התהליך, ה-PCB, Context Switch, תורים ומתזמנים, יצירה וסיום תהליכים ב-UNIX, ו-IPC בסיסי.',
  estimatedMinutes: 75,
  topics: [
    'תוכנית מול תהליך (Program vs Process)',
    'מבנה זיכרון של תהליך: Text, Data, Heap, Stack',
    '5 מצבים: New / Ready / Running / Waiting / Terminated',
    'Process Control Block (PCB)',
    'Context Switch ועלותו',
    'תורי תהליכים: Job / Ready / Device',
    'מתזמנים: Short / Long / Medium-term',
    'CPU-bound מול I/O-bound',
    'יצירת תהליכים: fork, exec, wait, exit',
    'Zombie, Orphan, Cascading Termination',
    'IPC: Shared Memory מול Message Passing',
  ],
  isReady: true,
};
