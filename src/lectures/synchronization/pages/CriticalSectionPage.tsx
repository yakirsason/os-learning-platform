import ConceptCard from '@/components/common/ConceptCard';
import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';

export default function CriticalSectionPage() {
  return (
    <PageShell
      eyebrow="Critical Section Problem"
      title="בעיית Critical Section"
      intro="כשכמה תהליכים ניגשים לאותם נתונים משותפים בו-זמנית, עלולה להיווצר Race Condition — שגיאה שתלויה בסדר הביצוע המדויק."
    >
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-5 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
          דוגמה: counter++ ו-counter--
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          מפיק (Producer) מבצע <span dir="ltr" className="font-mono">counter++</span> ובו-זמנית צרכן (Consumer) מבצע{' '}
          <span dir="ltr" className="font-mono">counter--</span>. כל אחת מהפעולות האלו מתורגמת ל-3 פקודות מכונה.
          אם הן משתלבות בצורה לא מסודרת, התוצאה עלולה להיות שגויה.
        </p>
        <div className="mt-3 rounded-md bg-slate-900 p-3 font-mono text-xs text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// counter = 5'}</div>
          <div className="mt-1 text-emerald-400">{'// producer: register1 = counter         → 5'}</div>
          <div className="text-emerald-400">{'//           register1 = register1 + 1   → 6'}</div>
          <div className="text-amber-400">{'// consumer: register2 = counter         → 5'}</div>
          <div className="text-amber-400">{'//           register2 = register2 - 1   → 4'}</div>
          <div className="text-emerald-400">{'// producer: counter = register1         → 6'}</div>
          <div className="text-amber-400">{'// consumer: counter = register2         → 4  ← שגוי!'}</div>
        </div>
        <p className="m-0 mt-3 text-xs text-slate-600 dark:text-slate-300">
          התוצאה הנכונה היא 5, אבל קיבלנו 4. זוהי Race Condition.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          מבנה תהליך עם Critical Section
        </h2>
        <div className="grid gap-2 md:grid-cols-4">
          {[
            {
              label: 'Entry Section',
              desc: 'בקשת הרשאה להיכנס ל-critical section.',
              color: 'border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30',
              labelColor: 'text-blue-700 dark:text-blue-300',
            },
            {
              label: 'Critical Section',
              desc: 'הקוד שניגש לנתונים המשותפים. רק תהליך אחד יכול להיות כאן בכל רגע.',
              color: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/30',
              labelColor: 'text-red-700 dark:text-red-300',
            },
            {
              label: 'Exit Section',
              desc: 'שחרור ההרשאה כדי שתהליכים אחרים יוכלו להיכנס.',
              color: 'border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/30',
              labelColor: 'text-emerald-700 dark:text-emerald-300',
            },
            {
              label: 'Remainder Section',
              desc: 'שאר הקוד של התהליך שלא נוגע בנתונים המשותפים.',
              color: 'border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/40',
              labelColor: 'text-slate-600 dark:text-slate-300',
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-lg border p-3 ${s.color}`}>
              <div className={`mb-1 text-xs font-bold ${s.labelColor}`}>{s.label}</div>
              <p className="m-0 text-xs leading-relaxed text-slate-700 dark:text-slate-200">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          שלושת תנאי הפתרון
        </h2>
        <div className="space-y-3">
          <ConceptCard
            title="Mutual Exclusion"
            englishTerm="Mutual Exclusion"
            description="בכל רגע, לא יותר מתהליך אחד יכול להיות בתוך ה-critical section. זהו התנאי הבסיסי ביותר."
            variant="info"
          />
          <ConceptCard
            title="התקדמות"
            englishTerm="Progress"
            description="אם אף תהליך לא נמצא ב-critical section ויש תהליכים שרוצים להיכנס — ההחלטה על מי ייכנס לא יכולה להתעכב לנצח. תהליכים שנמצאים ב-remainder section לא משתתפים בהחלטה."
            variant="info"
          />
          <ConceptCard
            title="המתנה מוגבלת"
            englishTerm="Bounded Waiting"
            description="אחרי שתהליך ביקש להיכנס ל-critical section, יש גבול לכמה פעמים תהליכים אחרים יוכלו להיכנס לפניו. זה מונע רעב (starvation)."
            variant="info"
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          Preemptive מול Nonpreemptive Kernel
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          ב-<strong>nonpreemptive kernel</strong> — תהליך ב-kernel mode לא יכול להיות נעצר. לכן race conditions ב-kernel פחות סבירות, אבל המערכת פחות מגיבה.
          ב-<strong>preemptive kernel</strong> — תהליך יכול להיעצר בכל רגע, גם כשהוא ב-kernel mode. זה דורש סנכרון קפדני יותר, אבל מאפשר תגובתיות טובה יותר.
        </p>
      </div>

      <StudyCallout variant="exam">
        שלושת התנאים — Mutual Exclusion, Progress, Bounded Waiting — הם נושא מבחן קלאסי.
        וודאו שאתם יודעים להסביר כל אחד ולהדגים מה קורה אם הוא לא מתקיים.
      </StudyCallout>
    </PageShell>
  );
}
