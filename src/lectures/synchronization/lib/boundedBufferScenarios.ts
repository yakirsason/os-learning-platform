// תרחישים להדגמת בעיית Bounded Buffer עם semaphores: mutex, empty, full.
// כל צעד מציג את המצב המלא לאחר ביצוע — כך אפשר להתקדם ולחזור בקלות.

export type ActorRole = 'producer' | 'consumer';

export type ActorPhase =
  | 'idle' // לא פעיל כרגע
  | 'waiting-empty' // נחסם ב-wait(empty)
  | 'waiting-full' // נחסם ב-wait(full)
  | 'waiting-mutex' // נחסם ב-wait(mutex)
  | 'in-cs' // בקטע הקריטי — ניגש לחוצץ
  | 'done'; // סיים את האיטרציה

export interface ActorSnapshot {
  phase: ActorPhase;
  /** שורה בקוד הפסאודו (1-5) שהאקטור כרגע מבצע / סיים זה עתה */
  line: number | null;
}

export interface BBState {
  /** תוכן החוצץ; null משמעו מקום פנוי */
  buffer: (string | null)[];
  mutex: number;
  empty: number;
  full: number;
  producer: ActorSnapshot;
  consumer: ActorSnapshot;
}

export type ChangedSemaphore = 'mutex' | 'empty' | 'full' | 'buffer';

export interface BBStep {
  actor: ActorRole;
  /** כיתוב קצר של הפעולה */
  action: string;
  state: BBState;
  explanation: string;
  note?: string;
  /** הדגשה ויזואלית של המשאב שהשתנה בצעד הזה */
  changed?: ChangedSemaphore;
  /** האם היקיצה של תהליך אחר קשורה לצעד הזה */
  wokeUp?: ActorRole;
}

export interface BBScenario {
  id: string;
  title: string;
  subtitle: string;
  /** גודל החוצץ */
  bufferSize: number;
  initial: BBState;
  steps: BBStep[];
  conclusion: string;
}

export const PRODUCER_CODE: string[] = [
  'wait(empty);',
  'wait(mutex);',
  '// insert item',
  'signal(mutex);',
  'signal(full);',
];

export const CONSUMER_CODE: string[] = [
  'wait(full);',
  'wait(mutex);',
  '// remove item',
  'signal(mutex);',
  'signal(empty);',
];

function emptyBuffer(size: number): (string | null)[] {
  return Array.from({ length: size }, () => null);
}

function freshActor(): ActorSnapshot {
  return { phase: 'idle', line: null };
}

const BUFFER_SIZE = 3;

const SCENARIO_INSERT: BBScenario = {
  id: 'insert',
  title: 'Producer מכניס לחוצץ פנוי',
  subtitle:
    'Producer מבצע את רצף ה-wait/signal בסדר הנכון על חוצץ ריק. אין תחרות, אין חסימה.',
  bufferSize: BUFFER_SIZE,
  initial: {
    buffer: emptyBuffer(BUFFER_SIZE),
    mutex: 1,
    empty: BUFFER_SIZE,
    full: 0,
    producer: freshActor(),
    consumer: freshActor(),
  },
  steps: [
    {
      actor: 'producer',
      action: 'wait(empty)',
      state: {
        buffer: emptyBuffer(BUFFER_SIZE),
        mutex: 1,
        empty: 2,
        full: 0,
        producer: { phase: 'idle', line: 1 },
        consumer: freshActor(),
      },
      explanation:
        'Producer קורא wait(empty). הערך יורד מ-3 ל-2 — נשארו 2 מקומות פנויים. Producer ממשיך כי הסמאפור היה חיובי.',
      changed: 'empty',
    },
    {
      actor: 'producer',
      action: 'wait(mutex)',
      state: {
        buffer: emptyBuffer(BUFFER_SIZE),
        mutex: 0,
        empty: 2,
        full: 0,
        producer: { phase: 'in-cs', line: 2 },
        consumer: freshActor(),
      },
      explanation:
        'Producer קורא wait(mutex). הערך יורד מ-1 ל-0 — Producer נכנס לקטע הקריטי, נעילה בלעדית על החוצץ.',
      changed: 'mutex',
    },
    {
      actor: 'producer',
      action: '// insert item A',
      state: {
        buffer: ['A', null, null],
        mutex: 0,
        empty: 2,
        full: 0,
        producer: { phase: 'in-cs', line: 3 },
        consumer: freshActor(),
      },
      explanation:
        'Producer מכניס פריט חדש (A) למקום הפנוי הראשון בחוצץ. הוא עדיין בקטע הקריטי — אף אחד אחר לא יכול לגעת בחוצץ.',
      changed: 'buffer',
      note: 'הכנסה לחוצץ היא הפעולה היחידה שמשנה את המבנה המשותף — לכן היא דורשת mutex.',
    },
    {
      actor: 'producer',
      action: 'signal(mutex)',
      state: {
        buffer: ['A', null, null],
        mutex: 1,
        empty: 2,
        full: 0,
        producer: { phase: 'idle', line: 4 },
        consumer: freshActor(),
      },
      explanation:
        'Producer משחרר את ה-mutex. הערך עולה ל-1. עכשיו Consumer יכול להיכנס לקטע הקריטי אם הוא רוצה.',
      changed: 'mutex',
    },
    {
      actor: 'producer',
      action: 'signal(full)',
      state: {
        buffer: ['A', null, null],
        mutex: 1,
        empty: 2,
        full: 1,
        producer: { phase: 'done', line: 5 },
        consumer: freshActor(),
      },
      explanation:
        'Producer מודיע שיש פריט חדש: signal(full) מעלה את full מ-0 ל-1. עכשיו Consumer שינסה wait(full) יצליח.',
      changed: 'full',
    },
  ],
  conclusion:
    'Producer סיים בלי לחכות. שימו לב: הסדר wait(empty) → wait(mutex) חיוני — הפוך היה מסכן deadlock כשהחוצץ מלא.',
};

const SCENARIO_REMOVE: BBScenario = {
  id: 'remove',
  title: 'Consumer מוציא מחוצץ עם פריט',
  subtitle:
    'החוצץ מתחיל עם פריט אחד. Consumer מבצע את רצף ה-wait/signal שלו. אין תחרות, אין חסימה.',
  bufferSize: BUFFER_SIZE,
  initial: {
    buffer: ['X', null, null],
    mutex: 1,
    empty: 2,
    full: 1,
    producer: freshActor(),
    consumer: freshActor(),
  },
  steps: [
    {
      actor: 'consumer',
      action: 'wait(full)',
      state: {
        buffer: ['X', null, null],
        mutex: 1,
        empty: 2,
        full: 0,
        producer: freshActor(),
        consumer: { phase: 'idle', line: 1 },
      },
      explanation:
        'Consumer קורא wait(full). הערך יורד מ-1 ל-0 — היה פריט אחד, "תופסים" אותו.',
      changed: 'full',
    },
    {
      actor: 'consumer',
      action: 'wait(mutex)',
      state: {
        buffer: ['X', null, null],
        mutex: 0,
        empty: 2,
        full: 0,
        producer: freshActor(),
        consumer: { phase: 'in-cs', line: 2 },
      },
      explanation:
        'Consumer לוקח את ה-mutex. הערך יורד מ-1 ל-0. נעילה בלעדית — אף אחד לא יכול לגעת בחוצץ במקביל.',
      changed: 'mutex',
    },
    {
      actor: 'consumer',
      action: '// remove item X',
      state: {
        buffer: [null, null, null],
        mutex: 0,
        empty: 2,
        full: 0,
        producer: freshActor(),
        consumer: { phase: 'in-cs', line: 3 },
      },
      explanation:
        'Consumer מוציא את הפריט X מהחוצץ. החוצץ ריק שוב. Consumer עדיין מחזיק את ה-mutex.',
      changed: 'buffer',
    },
    {
      actor: 'consumer',
      action: 'signal(mutex)',
      state: {
        buffer: [null, null, null],
        mutex: 1,
        empty: 2,
        full: 0,
        producer: freshActor(),
        consumer: { phase: 'idle', line: 4 },
      },
      explanation:
        'Consumer משחרר את ה-mutex. הערך חוזר ל-1.',
      changed: 'mutex',
    },
    {
      actor: 'consumer',
      action: 'signal(empty)',
      state: {
        buffer: [null, null, null],
        mutex: 1,
        empty: 3,
        full: 0,
        producer: freshActor(),
        consumer: { phase: 'done', line: 5 },
      },
      explanation:
        'Consumer מודיע שהתפנה מקום: signal(empty) מעלה את empty מ-2 ל-3. עכשיו 3 מקומות פנויים שוב.',
      changed: 'empty',
    },
  ],
  conclusion:
    'Consumer סיים בלי לחכות. שימו לב לסימטריה: empty/full מתחלפים, וה-mutex מגן רק על השינוי בפועל בחוצץ.',
};

const SCENARIO_PRODUCER_BLOCKS: BBScenario = {
  id: 'producer-blocks',
  title: 'Producer נחסם על חוצץ מלא',
  subtitle:
    'החוצץ מתחיל מלא. Producer מנסה להכניס ונחסם. Consumer מגיע ומשחרר אותו. בסוף Producer מצליח להכניס.',
  bufferSize: BUFFER_SIZE,
  initial: {
    buffer: ['X', 'Y', 'Z'],
    mutex: 1,
    empty: 0,
    full: BUFFER_SIZE,
    producer: freshActor(),
    consumer: freshActor(),
  },
  steps: [
    {
      actor: 'producer',
      action: 'wait(empty) — נחסם',
      state: {
        buffer: ['X', 'Y', 'Z'],
        mutex: 1,
        empty: -1,
        full: 3,
        producer: { phase: 'waiting-empty', line: 1 },
        consumer: freshActor(),
      },
      explanation:
        'Producer קורא wait(empty). הערך יורד מ-0 ל-1-. במימוש blocking, ערך שלילי משמעו שהתהליך נחסם — Producer בתור.',
      changed: 'empty',
      note: 'אין שום מקום פנוי בחוצץ, ולכן אין מה להכניס. Producer חייב לחכות.',
    },
    {
      actor: 'consumer',
      action: 'wait(full)',
      state: {
        buffer: ['X', 'Y', 'Z'],
        mutex: 1,
        empty: -1,
        full: 2,
        producer: { phase: 'waiting-empty', line: 1 },
        consumer: { phase: 'idle', line: 1 },
      },
      explanation:
        'Consumer מגיע. wait(full) — full יורד מ-3 ל-2. יש פריטים, Consumer ממשיך.',
      changed: 'full',
    },
    {
      actor: 'consumer',
      action: 'wait(mutex)',
      state: {
        buffer: ['X', 'Y', 'Z'],
        mutex: 0,
        empty: -1,
        full: 2,
        producer: { phase: 'waiting-empty', line: 1 },
        consumer: { phase: 'in-cs', line: 2 },
      },
      explanation: 'Consumer תופס את ה-mutex (1→0).',
      changed: 'mutex',
    },
    {
      actor: 'consumer',
      action: '// remove item X',
      state: {
        buffer: [null, 'Y', 'Z'],
        mutex: 0,
        empty: -1,
        full: 2,
        producer: { phase: 'waiting-empty', line: 1 },
        consumer: { phase: 'in-cs', line: 3 },
      },
      explanation:
        'Consumer מוציא את X. בחוצץ נשארו Y ו-Z. שימו לב: empty עדיין 1- כי signal(empty) עוד לא קרה.',
      changed: 'buffer',
    },
    {
      actor: 'consumer',
      action: 'signal(mutex)',
      state: {
        buffer: [null, 'Y', 'Z'],
        mutex: 1,
        empty: -1,
        full: 2,
        producer: { phase: 'waiting-empty', line: 1 },
        consumer: { phase: 'idle', line: 4 },
      },
      explanation: 'Consumer משחרר את ה-mutex.',
      changed: 'mutex',
    },
    {
      actor: 'consumer',
      action: 'signal(empty) — מעיר את Producer',
      wokeUp: 'producer',
      state: {
        buffer: [null, 'Y', 'Z'],
        mutex: 1,
        empty: 0,
        full: 2,
        producer: { phase: 'idle', line: 1 },
        consumer: { phase: 'done', line: 5 },
      },
      explanation:
        'signal(empty) מעלה את empty מ-1- ל-0. ערך עדיין לא חיובי, אבל יש מי שממתין — Producer מתעורר ויכול להמשיך.',
      changed: 'empty',
      note: 'זה הרגע המכריע: היציאה של Consumer פתחה את הדרך ל-Producer. הם תיאמו דרך הסמאפורים.',
    },
    {
      actor: 'producer',
      action: 'wait(mutex)',
      state: {
        buffer: [null, 'Y', 'Z'],
        mutex: 0,
        empty: 0,
        full: 2,
        producer: { phase: 'in-cs', line: 2 },
        consumer: { phase: 'done', line: 5 },
      },
      explanation: 'Producer ממשיך מהשורה השנייה. תופס את ה-mutex (1→0).',
      changed: 'mutex',
    },
    {
      actor: 'producer',
      action: '// insert item W',
      state: {
        buffer: ['W', 'Y', 'Z'],
        mutex: 0,
        empty: 0,
        full: 2,
        producer: { phase: 'in-cs', line: 3 },
        consumer: { phase: 'done', line: 5 },
      },
      explanation:
        'Producer מכניס פריט חדש W למקום שהתפנה. החוצץ שוב מלא בשלושה פריטים.',
      changed: 'buffer',
    },
    {
      actor: 'producer',
      action: 'signal(mutex)',
      state: {
        buffer: ['W', 'Y', 'Z'],
        mutex: 1,
        empty: 0,
        full: 2,
        producer: { phase: 'idle', line: 4 },
        consumer: { phase: 'done', line: 5 },
      },
      explanation: 'Producer משחרר את ה-mutex.',
      changed: 'mutex',
    },
    {
      actor: 'producer',
      action: 'signal(full)',
      state: {
        buffer: ['W', 'Y', 'Z'],
        mutex: 1,
        empty: 0,
        full: 3,
        producer: { phase: 'done', line: 5 },
        consumer: { phase: 'done', line: 5 },
      },
      explanation:
        'signal(full) מעלה את full ל-3. החוצץ מלא שוב. Producer סיים.',
      changed: 'full',
    },
  ],
  conclusion:
    'Producer חיכה ב-empty עד שConsumer פינה מקום. אילו סדר ה-wait היה הפוך (mutex לפני empty), Producer היה תופס את mutex ואז נחסם — Consumer לא היה יכול להיכנס. Deadlock.',
};

export const BB_SCENARIOS: BBScenario[] = [
  SCENARIO_INSERT,
  SCENARIO_REMOVE,
  SCENARIO_PRODUCER_BLOCKS,
];

export function getBBScenarioById(id: string): BBScenario {
  return BB_SCENARIOS.find((s) => s.id === id) ?? BB_SCENARIOS[0];
}

export const PHASE_LABELS: Record<ActorPhase, { hebrew: string; tone: string }> = {
  idle: { hebrew: 'מחוץ לקטע הקריטי', tone: 'neutral' },
  'waiting-empty': { hebrew: 'ממתין על empty', tone: 'wait' },
  'waiting-full': { hebrew: 'ממתין על full', tone: 'wait' },
  'waiting-mutex': { hebrew: 'ממתין על mutex', tone: 'wait' },
  'in-cs': { hebrew: 'בקטע הקריטי', tone: 'critical' },
  done: { hebrew: 'סיים', tone: 'done' },
};
