import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LectureStatus } from '@/types';

interface LectureStore {
  progress: Record<string, LectureStatus>;
  darkMode: boolean;
  setStatus: (lectureId: string, status: LectureStatus) => void;
  toggleDarkMode: () => void;
  resetProgress: () => void;
}

export const useLectureStore = create<LectureStore>()(
  persist(
    (set) => ({
      progress: {},
      darkMode: false,
      setStatus: (lectureId, status) =>
        set((state) => ({
          progress: { ...state.progress, [lectureId]: status },
        })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      resetProgress: () => set({ progress: {} }),
    }),
    {
      name: 'os-learning-storage',
    }
  )
);

export function getLectureStatus(
  progress: Record<string, LectureStatus>,
  lectureId: string
): LectureStatus {
  return progress[lectureId] ?? 'not-started';
}
