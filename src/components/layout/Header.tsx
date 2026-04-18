import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLectureStore } from '@/store/useLectureStore';

export default function Header() {
  const darkMode = useLectureStore((s) => s.darkMode);
  const toggleDarkMode = useLectureStore((s) => s.toggleDarkMode);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b bg-white px-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold leading-tight text-slate-900 dark:text-slate-50">
          מערכות הפעלה - למידה ויזואלית
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          פלטפורמת לימוד אינטראקטיבית
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleDarkMode}
        aria-label={darkMode ? 'עבור למצב בהיר' : 'עבור למצב כהה'}
      >
        {darkMode ? (
          <Sun className="h-5 w-5" />
        ) : (
          <Moon className="h-5 w-5" />
        )}
      </Button>
    </header>
  );
}
