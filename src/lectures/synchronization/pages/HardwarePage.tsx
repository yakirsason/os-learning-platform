import StudyCallout from '@/components/common/StudyCallout';
import PageShell from '../components/PageShell';

export default function HardwarePage() {
  return (
    <PageShell
      eyebrow="Synchronization Hardware"
      title="סנכרון חומרה"
      intro="פתרונות תוכנתיים כמו Peterson יכולים להיות מורכבים. מעבדים מודרניים מספקים פקודות חומרה אטומיות שמפשטות את הפתרון."
    >
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
        <div className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
          הרעיון: Lock
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          אפשר לייצג את ה-critical section כמנעול (lock): תהליך שרוצה להיכנס "נועל" את הכניסה, ומשחרר כשגמר.
          שאר התהליכים רואים שהמנעול נעול ומחכים.
          הבעיה: פעולת "בדוק אם פנוי וגם תפוס" חייבת להיות אטומית — אחרת ייתכן race condition על המנעול עצמו.
        </p>
      </div>

      <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="mb-1 text-xs font-bold text-blue-700 dark:text-blue-300">
          ביטול הפרעות (Disable Interrupts)
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          פתרון פשוט: לפני ה-critical section, בטל interrupts. כך אף context switch לא יקרה באמצע.
          זה עובד במערכות חד-מעבדיות פשוטות, אבל לא מעשי למערכות מודרניות: לא ניתן להסתמך עליו ב-multiprocessor,
          וביטול interrupts לזמן ממושך פוגע בתגובתיות המערכת.
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">
          TestAndSet
        </h2>
        <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>TestAndSet</strong> היא פקודת חומרה אטומית שמבצעת בבת אחת: קוראת את הערך הנוכחי, ומגדירה אותו ל-true.
        </p>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// executed atomically by hardware'}</div>
          <div className="mt-1">
            <span className="text-amber-400">boolean</span>
            <span className="text-blue-300"> TestAndSet</span>
            <span className="text-slate-300">(</span>
            <span className="text-amber-400">boolean</span>
            <span className="text-slate-300"> *target) {'{'}</span>
          </div>
          <div className="ps-4">
            <span className="text-amber-400">boolean</span>
            <span className="text-slate-300"> rv = *target;</span>
          </div>
          <div className="ps-4">
            <span className="text-slate-300">*target = </span>
            <span className="text-emerald-400">true</span>
            <span className="text-slate-300">;</span>
          </div>
          <div className="ps-4">
            <span className="text-amber-400">return</span>
            <span className="text-slate-300"> rv;</span>
          </div>
          <div className="text-slate-300">{'}'}</div>
          <div className="mt-3 text-slate-400">{'// usage — mutual exclusion:'}</div>
          <div className="mt-1 text-slate-400">{'// boolean lock = false;'}</div>
          <div>
            <span className="text-amber-400">while</span>
            <span className="text-slate-300"> (TestAndSet(&amp;lock)) ;</span>
            <span className="text-slate-400"> {'// busy wait'}</span>
          </div>
          <div className="text-slate-400">{'// ← critical section →'}</div>
          <div>
            <span className="text-slate-300">lock = </span>
            <span className="text-emerald-400">false</span>
            <span className="text-slate-300">;</span>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">Swap</h2>
        <p className="mb-3 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <strong>Swap</strong> מחליפה בצורה אטומית את הערכים של שני משתנים בוליאניים.
        </p>
        <div className="rounded-md bg-slate-900 p-4 font-mono text-sm text-slate-100 dark:bg-slate-950" dir="ltr">
          <div className="text-slate-400">{'// executed atomically by hardware'}</div>
          <div className="mt-1">
            <span className="text-amber-400">void</span>
            <span className="text-blue-300"> Swap</span>
            <span className="text-slate-300">(</span>
            <span className="text-amber-400">boolean</span>
            <span className="text-slate-300"> *a, </span>
            <span className="text-amber-400">boolean</span>
            <span className="text-slate-300"> *b) {'{'}</span>
          </div>
          <div className="ps-4">
            <span className="text-amber-400">boolean</span>
            <span className="text-slate-300"> temp = *a;</span>
          </div>
          <div className="ps-4">
            <span className="text-slate-300">*a = *b;</span>
          </div>
          <div className="ps-4">
            <span className="text-slate-300">*b = temp;</span>
          </div>
          <div className="text-slate-300">{'}'}</div>
          <div className="mt-3 text-slate-400">{'// usage:'}</div>
          <div className="mt-1 text-slate-400">{'// boolean lock = false;'}</div>
          <div>
            <span className="text-amber-400">boolean</span>
            <span className="text-slate-300"> key = </span>
            <span className="text-emerald-400">true</span>
            <span className="text-slate-300">;</span>
          </div>
          <div>
            <span className="text-amber-400">while</span>
            <span className="text-slate-300"> (key == </span>
            <span className="text-emerald-400">true</span>
            <span className="text-slate-300">) Swap(&amp;lock, &amp;key);</span>
          </div>
          <div className="text-slate-400">{'// ← critical section →'}</div>
          <div>
            <span className="text-slate-300">lock = </span>
            <span className="text-emerald-400">false</span>
            <span className="text-slate-300">;</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
        <div className="mb-2 text-sm font-semibold text-amber-800 dark:text-amber-300">
          מגבלה: Bounded Waiting לא מובטחת
        </div>
        <p className="m-0 text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          הפתרון הפשוט עם TestAndSet אינו מבטיח Bounded Waiting. תהליך יכול לנסות שוב ושוב ולפספס את ה-lock כשאחרים משחררים ותופסים אותו שוב.
          כדי לפתור זאת, אפשר להוסיף מערך <span dir="ltr" className="font-mono">waiting[n]</span>: כשתהליך משחרר, הוא בודק לפי סדר מעגלי מי הבא בתור ומעיר אותו.
        </p>
      </div>

      <StudyCallout variant="remember">
        הנקודה המרכזית: פקודות כמו TestAndSet הן <em>אטומיות</em> — החומרה מבטיחה שבדיקה ועדכון יקרו בבת אחת ללא הפרעה.
        זה מה שמאפשר לממש mutual exclusion נכון.
      </StudyCallout>
    </PageShell>
  );
}
