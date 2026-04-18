import type { LectureMetadata } from '@/types';

// מטא-דאטה מקומית - זהה לרשומה ב-src/config/lectures.ts.
export const metadata: LectureMetadata = {
  id: 'scheduling',
  number: 4,
  title: 'תזמון מעבד',
  englishTitle: 'CPU Scheduling',
  description:
    'בחירת התהליך הבא שירוץ על ה-CPU: מחזורי CPU/I/O, Scheduler ו-Dispatcher, מדדי תזמון, והיכרות ראשונית עם FCFS, SJF, SRTF, Priority, Round Robin ותורים מרובי רמות.',
  estimatedMinutes: 70,
  topics: [
    'מחזור CPU burst ו-I/O burst',
    'נקודות החלטה של ה-Scheduler',
    'Dispatcher ו-dispatch latency',
    'מדדי תזמון: CPU utilization, throughput, turnaround, waiting, response',
    'FCFS',
    'SJF ו-SRTF',
    'Priority Scheduling',
    'Round Robin ו-quantum',
    'Multilevel Queue ו-Multilevel Feedback Queue',
    'נושאים משלימים: burst prediction, multiprocessor, real-time, threads, OS examples, evaluation',
  ],
  isReady: true,
};
