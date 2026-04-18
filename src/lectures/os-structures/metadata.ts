import type { LectureMetadata } from '@/types';

// מטא-דאטה מקומית - זהה לרשומה ב-src/config/lectures.ts.
export const metadata: LectureMetadata = {
  id: 'os-structures',
  number: 2,
  title: 'מבני מערכות הפעלה',
  englishTitle: 'Operating-System Structures',
  description:
    'שירותי OS, ממשקי משתמש, System Calls ו-APIs, Dual-Mode, System Programs, ומבני OS שונים - Simple, Monolithic, Layered, Microkernel, Modular ו-Hybrid.',
  estimatedMinutes: 60,
  topics: [
    'שירותי מערכת הפעלה',
    'ממשקי משתמש (CLI, GUI, Touch)',
    'Dual-Mode Operation',
    'System Calls ו-APIs',
    'העברת פרמטרים',
    'System Programs',
    'Policy vs Mechanism',
    'מבני OS (Simple, Monolithic, Layered, Microkernel, Modular, Hybrid)',
    'Virtual Machines',
    'Debugging & Performance Tuning',
  ],
  isReady: true,
};
