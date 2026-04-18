export type PracticeOptionId = 'א' | 'ב' | 'ג' | 'ד';

export interface PracticeQuestion {
  id: number;
  question: string;
  options: Record<PracticeOptionId, string>;
  correct: PracticeOptionId;
  explanation?: string;
}

export const SYNC_PRACTICE_QUESTIONS: PracticeQuestion[] = [
  {
    id: 1,
    question: 'מהו Race Condition?',
    options: {
      א: 'מצב בו מספר תהליכים רצים תמיד באותו סדר',
      ב: 'מצב בו מספר תהליכים ניגשים ומשנים נתונים משותפים, והתוצאה תלויה בסדר הביצוע',
      ג: 'מצב בו כל התהליכים מחכים ל-I/O',
      ד: 'מצב בו תהליך אחד בלבד משתמש ב-CPU',
    },
    correct: 'ב',
    explanation: 'הנקודה המרכזית היא תלות בסדר הביצוע של פעולות על נתונים משותפים.',
  },
  {
    id: 2,
    question: 'מהו Critical Section?',
    options: {
      א: 'קטע קוד שבו תהליך מבצע רק פעולות קלט/פלט',
      ב: 'קטע קוד שבו תהליך משנה או משתמש במשאבים/נתונים משותפים',
      ג: 'קטע קוד שבו תהליך תמיד עובר ל-waiting',
      ד: 'קטע קוד שמופיע רק בתוך kernel mode',
    },
    correct: 'ב',
    explanation: 'זהו הקטע שבו חייבים לשלוט בגישה למשאב משותף.',
  },
  {
    id: 3,
    question: 'איזה מהבאים הוא אחד משלושת התנאים שפתרון לבעיית ה-Critical Section חייב לקיים?',
    options: {
      א: 'Starvation',
      ב: 'Deadlock',
      ג: 'Mutual Exclusion',
      ד: 'Thrashing',
    },
    correct: 'ג',
    explanation: 'שלושת התנאים הם Mutual Exclusion, Progress ו-Bounded Waiting.',
  },
  {
    id: 4,
    question:
      'אם תהליך מסוים לעולם לא מצליח להיכנס ל-critical section, למרות שתהליכים אחרים שוב ושוב נכנסים, איזה תנאי נשבר?',
    options: {
      א: 'Mutual Exclusion',
      ב: 'Progress',
      ג: 'Bounded Waiting',
      ד: 'Context Switch',
    },
    correct: 'ג',
    explanation: 'Bounded Waiting דורש חסם על מספר הפעמים שאחרים ייכנסו לפני תהליך ממתין.',
  },
  {
    id: 5,
    question: 'מה ההבדל המרכזי בין Progress לבין Bounded Waiting?',
    options: {
      א: 'Progress עוסק במספר התהליכים במערכת, ו-Bounded Waiting עוסק בזיכרון',
      ב: 'Progress דורש שלא תהיה דחייה אינסופית בבחירת התהליך הבא, ו-Bounded Waiting דורש חסם על מספר הפעמים שאחרים ייכנסו לפני תהליך ממתין',
      ג: 'Progress עוסק רק ב-kernel, ו-Bounded Waiting עוסק רק ב-user mode',
      ד: 'אין הבדל ביניהם',
    },
    correct: 'ב',
    explanation: 'Progress מדבר על בחירת תהליך כשאפשר להתקדם; Bounded Waiting מדבר על הוגנות לתהליך שכבר מחכה.',
  },
  {
    id: 6,
    question: 'בפתרון של Peterson, מה התפקיד של המערך flag[2]?',
    options: {
      א: 'לשמור כמה פעמים כל תהליך נכנס ל-critical section',
      ב: 'לציין האם תהליך מוכן/רוצה להיכנס ל-critical section',
      ג: 'לשמור מי יצא אחרון מהמערכת',
      ד: 'לשמש כ-semaphore בינארי',
    },
    correct: 'ב',
    explanation: 'כל flag מציין האם התהליך המתאים מעוניין להיכנס.',
  },
  {
    id: 7,
    question: 'בפתרון של Peterson, מה התפקיד של המשתנה turn?',
    options: {
      א: 'לציין איזה תהליך נמצא ב-remainder section',
      ב: 'לציין איזה תהליך צריך לבצע signal()',
      ג: 'להכריע למי תינתן הזכות להיכנס כאשר שני התהליכים רוצים להיכנס יחד',
      ד: 'לספור כמה פעמים התבצע wait()',
    },
    correct: 'ג',
    explanation: 'turn הוא שובר שוויון כאשר שני התהליכים רוצים להיכנס באותו זמן.',
  },
  {
    id: 8,
    question:
      'נתון הקוד הבא עבור שני תהליכים:\n\nProcess P1:\nwait(S);\nwait(Q);\n/* critical section */\nsignal(S);\nsignal(Q);\n\nProcess P2:\nwait(Q);\nwait(S);\n/* critical section */\nsignal(Q);\nsignal(S);\n\nכאשר S ו-Q הם semaphores בינאריים מאותחלים ל-1.\n\nאיזה מהבאים הוא הנכון ביותר?',
    options: {
      א: 'הקוד אינו מקיים Mutual Exclusion',
      ב: 'הקוד תמיד מקיים Progress',
      ג: 'הקוד עלול להוביל ל-deadlock ולכן אינו מקיים Progress',
      ד: 'הקוד אינו מקיים Bounded Waiting בלבד',
    },
    correct: 'ג',
    explanation: 'P1 יכול להחזיק את S ולחכות ל-Q, בזמן ש-P2 מחזיק את Q ומחכה ל-S.',
  },
  {
    id: 9,
    question: 'מה נכון לגבי Binary Semaphore?',
    options: {
      א: 'ערכו יכול להיות כל מספר שלם חיובי',
      ב: 'הוא משמש רק לניהול זיכרון',
      ג: 'ערכו נע בין 0 ל-1 ומשמש לעיתים קרובות ל-mutual exclusion',
      ד: 'הוא משמש רק לפתרון Readers-Writers',
    },
    correct: 'ג',
    explanation: 'Binary semaphore הוא כלי של שני מצבים, ולכן מתאים במיוחד לנעילה הדדית.',
  },
  {
    id: 10,
    question: 'מהו החיסרון המרכזי של מימוש Semaphore בעזרת Busy Waiting?',
    options: {
      א: 'התהליך עובר מייד ל-terminated',
      ב: 'התהליך מבזבז מחזורי CPU בזמן המתנה',
      ג: 'לא ניתן לבצע signal()',
      ד: 'לא ניתן להשתמש ביותר מ-semaphore אחד',
    },
    correct: 'ב',
    explanation: 'ב-busy waiting התהליך ממשיך לרוץ ולבדוק תנאי במקום להיחסם ולפנות את ה-CPU.',
  },
];

export const OPTION_IDS: PracticeOptionId[] = ['א', 'ב', 'ג', 'ד'];
