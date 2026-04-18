import { SCHEDULING_SUBTOPICS } from '@/config/lectureSubtopics';

export type SchedulingPageSlug =
  | 'overview'
  | 'basic-concepts'
  | 'scheduler-dispatcher'
  | 'criteria'
  | 'fcfs'
  | 'sjf'
  | 'burst-prediction'
  | 'srtf'
  | 'priority'
  | 'round-robin'
  | 'io-round-robin'
  | 'multilevel-queue'
  | 'multilevel-feedback-queue'
  | 'comparison-waiting-time'
  | 'secondary-topics'
  | 'practice'
  | 'summary';

export interface SchedulingPageInfo {
  slug: SchedulingPageSlug;
  title: string;
  englishTitle?: string;
  description: string;
  group?: string;
}

export const SCHEDULING_PAGES: SchedulingPageInfo[] = SCHEDULING_SUBTOPICS.map(
  (subtopic) => ({
    slug: subtopic.id as SchedulingPageSlug,
    title: subtopic.title,
    englishTitle: subtopic.englishTitle,
    description: subtopic.description ?? '',
    group: subtopic.group,
  })
);

export function getSchedulingPage(slug?: string): SchedulingPageInfo {
  return (
    SCHEDULING_PAGES.find((page) => page.slug === slug) ?? SCHEDULING_PAGES[0]
  );
}
