import type { LectureMetadata } from '@/types';
import { SYNCHRONIZATION_SUBTOPICS } from '@/config/lectureSubtopics';

export const metadata: LectureMetadata = {
  id: 'synchronization',
  number: 5,
  title: 'סנכרון ו-Semaphores',
  englishTitle: 'Process Synchronization',
  description:
    'Race conditions, בעיית Critical Section, Peterson, חומרה אטומית, Semaphores, שלוש הבעיות הקלאסיות ו-Monitors.',
  estimatedMinutes: 90,
  topics: [
    'Race Condition ובעיית הסנכרון',
    'Critical Section — שלושת התנאים',
    "פתרון Peterson",
    'TestAndSet ו-Swap — סנכרון חומרה',
    'Semaphores: binary ו-counting',
    'Bounded Buffer, Readers-Writers, Dining Philosophers',
    'Monitors ו-Condition Variables',
  ],
  subtopics: SYNCHRONIZATION_SUBTOPICS,
  isReady: true,
};
