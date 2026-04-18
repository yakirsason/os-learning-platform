import { Link } from 'react-router-dom';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';

const PROBLEMS = [
  {
    slug: 'bounded-buffer',
    title: 'Bounded Buffer',
    hebrewTitle: 'חוצץ מוגבל',
    desc: 'מפיק וצרכן שמשתפים חוצץ בגודל קבוע. מדגים שימוש ב-counting semaphores לניהול כמות פריטים ומקומות פנויים.',
    color: 'border-blue-300 hover:border-blue-400 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-950/30',
  },
  {
    slug: 'readers-writers',
    title: 'Readers-Writers',
    hebrewTitle: 'קוראים-כותבים',
    desc: 'קוראים רבים יכולים לגשת בו-זמנית לנתונים, אבל כותב חייב לקבל גישה בלעדית. בעיה קלאסית של ניהול שיתוף.',
    color: 'border-emerald-300 hover:border-emerald-400 hover:bg-emerald-50 dark:border-emerald-800 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30',
  },
  {
    slug: 'dining-philosophers',
    title: 'Dining Philosophers',
    hebrewTitle: 'פילוסופים סועדים',
    desc: 'חמישה פילוסופים סועדים עם חמש צלחות. בעיה קלאסית שמדגימה deadlock ורעב.',
    color: 'border-violet-300 hover:border-violet-400 hover:bg-violet-50 dark:border-violet-800 dark:hover:border-violet-700 dark:hover:bg-violet-950/30',
  },
];

export default function ClassicProblemsPage() {
  return (
    <PageShell
      eyebrow="Classic Synchronization Problems"
      title="בעיות קלאסיות"
      intro="שלוש הבעיות הקלאסיות של סנכרון מופיעות בכל ספר מערכות הפעלה. כל אחת מדגימה אתגר אחר ומספקת תבנית פתרון שניתן לשחזר."
    >
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        הבעיות הקלאסיות חשובות לא רק כחידות — הן מייצגות דפוסים שחוזרים שוב ושוב ב-OS אמיתי:
        ניהול תורים, שיתוף משאבים בין קוראים לכותבים, ומניעת deadlock. כשמבינים את הפתרונות האלו,
        קל יותר לזהות ולפתור בעיות סנכרון בפרקטיקה.
      </p>

      <div className="space-y-3">
        {PROBLEMS.map((p) => (
          <Link
            key={p.slug}
            to={`/lecture/synchronization/${p.slug}`}
            className={`flex flex-col gap-1 rounded-lg border bg-white p-5 no-underline shadow-sm transition-colors ${p.color} dark:bg-slate-900`}
          >
            <div className="flex items-baseline gap-3">
              <span className="text-base font-semibold text-slate-950 dark:text-slate-50">
                {p.title}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{p.hebrewTitle}</span>
            </div>
            <p className="m-0 text-sm leading-relaxed text-slate-600 dark:text-slate-300">{p.desc}</p>
          </Link>
        ))}
      </div>

      <StudyCallout variant="exam">
        לכל אחת מהבעיות — הבינו את הגדרת הבעיה, אילו סמאפורים משתמשים ולמה, ואיזה נזק יכול לקרות אם סדר ה-wait/signal שגוי.
      </StudyCallout>
    </PageShell>
  );
}
