import { Link } from 'react-router-dom';
import StudyCallout from '@/components/common/StudyCallout';
import { SYNC_PAGES } from '../components/syncPages';
import PageShell from '../components/PageShell';
import RaceConditionDemo from '../visualizations/RaceConditionDemo';

export default function OverviewPage() {
  return (
    <PageShell
      eyebrow="Process Synchronization"
      title="סנכרון תהליכים"
      intro="כשכמה תהליכים משתפים נתונים, צריך לוודא שהם לא דורסים זה את זה. זאת בדיוק הבעיה שסנכרון בא לפתור."
    >
      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-s-4 border-blue-500 bg-blue-50 p-4 dark:border-blue-700 dark:bg-blue-950/30">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300">
            במה נעסוק
          </div>
          <ul className="m-0 space-y-1 text-sm text-slate-700 dark:text-slate-200">
            <li>• Race Condition — מה קורה כשגישה לא מסונכרנת</li>
            <li>• Critical Section — הגדרת הבעיה ושלושת התנאים</li>
            <li>• Peterson, חומרה אטומית, Semaphores</li>
            <li>• שלוש הבעיות הקלאסיות ו-Monitors</li>
          </ul>
        </div>
        <div className="rounded-lg border border-s-4 border-emerald-500 bg-emerald-50 p-4 dark:border-emerald-700 dark:bg-emerald-950/30">
          <div className="mb-2 text-xs font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
            למה זה חשוב
          </div>
          <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
            תוכניות רבות מריצות כמה תהליכים במקביל שמשתפים זיכרון. בלי סנכרון, תוצאות החישוב יכולות להיות שגויות בצורה לא צפויה — ובאגים כאלה קשים מאוד לאתר.
          </p>
        </div>
      </div>

      <StudyCallout variant="oneliner">
        הנושא המרכזי: איך מבטיחים שגישה משותפת לנתונים תהיה בטוחה, נכונה ויעילה.
      </StudyCallout>

      <div className="space-y-2">
        <h2 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-50">
          איך נראית בעיית סנכרון בפועל?
        </h2>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          תהליך מפיק (Producer) מוסיף 1 לדלפק, ובמקביל תהליך צרכן (Consumer) מחסיר 1 ממנו.
          לכאורה, זוג הפעולות צריך לבטל זה את זה. אבל ברמת המכונה כל פעולה מורכבת מ-3 פקודות,
          וכשהן משתלבות בסדר לא טוב — מתקבלת תוצאה שגויה.
        </p>
      </div>

      <section className="w-full min-w-0 space-y-4 rounded-lg border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 sm:p-5">
        <header className="space-y-1">
          <h3 className="m-0 text-base font-semibold text-slate-950 dark:text-slate-50">
            הדמיה: Race Condition בפעולה
          </h3>
          <p className="m-0 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
            <strong>מה לעקוב אחריו:</strong> שימו לב לערך של{' '}
            <span dir="ltr" className="font-mono">counter</span> ולערכי הרגיסטרים המקומיים{' '}
            <span dir="ltr" className="font-mono">R1</span> (של הProducer) ו-
            <span dir="ltr" className="font-mono">R2</span> (של הConsumer) בכל צעד.
            בתרחיש הבטוח התוצאה נכונה; בתרחיש הבעייתי הכתיבה האחרונה דורסת את הקודמת — וזו בדיוק הסיבה שאנו זקוקים לסנכרון.
          </p>
        </header>
        <RaceConditionDemo />
      </section>

      <StudyCallout variant="exam">
        Race Condition: התוצאה הסופית של חישוב משותף תלויה בסדר המדויק שבו התהליכים פועלים.
        זה הופך את הבאג ללא דטרמיניסטי — לפעמים יעבוד, לפעמים לא.
      </StudyCallout>

      <div className="space-y-2">
        <h2 className="m-0 text-lg font-semibold text-slate-900 dark:text-slate-50">
          המשך הלמידה לפי נושאים
        </h2>
        <p className="m-0 text-xs text-slate-600 dark:text-slate-400">
          כל עמוד מתמקד בנושא אחד. אפשר ללמוד לפי הסדר או לקפוץ למה שמעניין.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {SYNC_PAGES.filter((page) => page.slug !== 'overview').map((page) => (
          <Link
            key={page.slug}
            to={`/lecture/synchronization/${page.slug}`}
            className="rounded-lg border bg-white p-4 no-underline shadow-sm transition-colors hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800 dark:hover:bg-blue-950/30"
          >
            <div className="font-semibold text-slate-950 dark:text-slate-50">{page.title}</div>
            {page.englishTitle ? (
              <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400">
                {page.englishTitle}
              </div>
            ) : null}
            <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {page.description}
            </p>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
