import { SYNCHRONIZATION_SUBTOPICS } from '@/config/lectureSubtopics';

export type SyncPageSlug =
  | 'overview'
  | 'critical-section'
  | 'peterson'
  | 'hardware'
  | 'semaphores'
  | 'classic-problems'
  | 'bounded-buffer'
  | 'readers-writers'
  | 'dining-philosophers'
  | 'monitors'
  | 'practice';

export interface SyncPageInfo {
  slug: SyncPageSlug;
  title: string;
  englishTitle?: string;
  description: string;
  group?: string;
}

export const SYNC_PAGES: SyncPageInfo[] = SYNCHRONIZATION_SUBTOPICS.map((subtopic) => ({
  slug: subtopic.id as SyncPageSlug,
  title: subtopic.title,
  englishTitle: subtopic.englishTitle,
  description: subtopic.description ?? '',
  group: subtopic.group,
}));

export function getSyncPage(slug?: string): SyncPageInfo {
  return SYNC_PAGES.find((page) => page.slug === slug) ?? SYNC_PAGES[0];
}
