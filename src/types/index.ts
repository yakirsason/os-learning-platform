// טיפוסים כלליים של הפלטפורמה

export type LectureStatus = 'not-started' | 'in-progress' | 'completed';

export type LectureSubtopic = {
  id: string;
  title: string;
  englishTitle?: string;
  description?: string;
  group?: string;
};

export type LectureMetadata = {
  id: string;
  number: number;
  title: string;
  englishTitle: string;
  description: string;
  estimatedMinutes: number | null;
  topics: string[];
  subtopics?: LectureSubtopic[];
  isReady: boolean;
};
