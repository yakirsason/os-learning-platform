// תרחישים להדגמת Race Condition.
// מצב משותף: counter שמתחיל ב-5.
// Producer מבצע counter++ (3 צעדי מכונה).
// Consumer מבצע counter-- (3 צעדי מכונה).

export type Actor = 'producer' | 'consumer';

export interface MachineState {
  counter: number;
  r1: number | null; // local register של producer
  r2: number | null; // local register של consumer
}

export interface InterleavingStep {
  actor: Actor;
  /** קוד פסאודו קצר של הפקודה */
  code: string;
  /** איזו שורה מתוך שלושת השלבים של ה-actor */
  actorLine: 0 | 1 | 2;
  /** המצב של המערכת לאחר ביצוע הצעד */
  state: MachineState;
  /** הסבר בעברית של מה קרה בצעד הזה */
  explanation: string;
  /** הערה על השלכות הצעד (אופציונלי) */
  note?: string;
}

export interface InterleavingScenario {
  id: string;
  title: string;
  subtitle: string;
  intent: 'safe' | 'race';
  /** ערך התחלתי של counter לפני הצעד הראשון */
  initialCounter: number;
  /** הערך הנכון אילו ההרצה הייתה אטומית לחלוטין */
  expectedFinal: number;
  /** הצעדים בסדר ביצועם */
  steps: InterleavingStep[];
  /** סיכום שמופיע בסוף ההרצה */
  summary: string;
}

const PRODUCER_LINES: Record<0 | 1 | 2, string> = {
  0: 'R1 = counter',
  1: 'R1 = R1 + 1',
  2: 'counter = R1',
};

const CONSUMER_LINES: Record<0 | 1 | 2, string> = {
  0: 'R2 = counter',
  1: 'R2 = R2 - 1',
  2: 'counter = R2',
};

export const PRODUCER_CODE: string[] = [PRODUCER_LINES[0], PRODUCER_LINES[1], PRODUCER_LINES[2]];
export const CONSUMER_CODE: string[] = [CONSUMER_LINES[0], CONSUMER_LINES[1], CONSUMER_LINES[2]];

const SAFE_SCENARIO: InterleavingScenario = {
  id: 'safe',
  title: 'הרצה רציפה — בלי שילוב',
  subtitle: 'הProducer מסיים את כל שלושת הצעדים שלו, ואז הConsumer מתחיל.',
  intent: 'safe',
  initialCounter: 5,
  expectedFinal: 5,
  steps: [
    {
      actor: 'producer',
      code: PRODUCER_LINES[0],
      actorLine: 0,
      state: { counter: 5, r1: 5, r2: null },
      explanation: 'הProducer קורא את הערך של counter (5) לתוך הרגיסטר המקומי R1.',
    },
    {
      actor: 'producer',
      code: PRODUCER_LINES[1],
      actorLine: 1,
      state: { counter: 5, r1: 6, r2: null },
      explanation: 'הProducer מוסיף 1 ל-R1. כעת R1 = 6, אבל counter עוד לא השתנה.',
    },
    {
      actor: 'producer',
      code: PRODUCER_LINES[2],
      actorLine: 2,
      state: { counter: 6, r1: 6, r2: null },
      explanation: 'הProducer כותב את R1 חזרה ל-counter. counter = 6 — בדיוק כמצופה.',
    },
    {
      actor: 'consumer',
      code: CONSUMER_LINES[0],
      actorLine: 0,
      state: { counter: 6, r1: 6, r2: 6 },
      explanation: 'הConsumer קורא את הערך הנוכחי של counter (6) לתוך R2.',
    },
    {
      actor: 'consumer',
      code: CONSUMER_LINES[1],
      actorLine: 1,
      state: { counter: 6, r1: 6, r2: 5 },
      explanation: 'הConsumer מחסיר 1 מ-R2. כעת R2 = 5.',
    },
    {
      actor: 'consumer',
      code: CONSUMER_LINES[2],
      actorLine: 2,
      state: { counter: 5, r1: 6, r2: 5 },
      explanation: 'הConsumer כותב את R2 חזרה ל-counter. counter = 5 — בדיוק התוצאה הנכונה.',
      note: 'כשהפעולות לא משתלבות, התוצאה תקינה. אבל אין לנו דרך להבטיח שזה ישאר ככה.',
    },
  ],
  summary: 'התוצאה הסופית: counter = 5. נכון. אבל זה רק כי הצלחנו לא לשלב את הצעדים.',
};

const RACE_SCENARIO: InterleavingScenario = {
  id: 'race',
  title: 'שילוב בעייתי — Race Condition',
  subtitle: 'הצעדים של הProducer והConsumer משתלבים. שניהם קוראים את counter לפני שאחד מהם כותב.',
  intent: 'race',
  initialCounter: 5,
  expectedFinal: 5,
  steps: [
    {
      actor: 'producer',
      code: PRODUCER_LINES[0],
      actorLine: 0,
      state: { counter: 5, r1: 5, r2: null },
      explanation: 'הProducer קורא את counter (5) ל-R1.',
    },
    {
      actor: 'producer',
      code: PRODUCER_LINES[1],
      actorLine: 1,
      state: { counter: 5, r1: 6, r2: null },
      explanation: 'הProducer מוסיף 1: R1 = 6. עדיין לא נכתב חזרה ל-counter.',
    },
    {
      actor: 'consumer',
      code: CONSUMER_LINES[0],
      actorLine: 0,
      state: { counter: 5, r1: 6, r2: 5 },
      explanation: 'עכשיו ה-CPU עובר לConsumer. הConsumer קורא את counter — שעדיין 5 — ל-R2.',
      note: 'זאת הנקודה הקריטית: שני התהליכים מחזיקים בערכים שונים שמבוססים על אותו ערך מקורי.',
    },
    {
      actor: 'consumer',
      code: CONSUMER_LINES[1],
      actorLine: 1,
      state: { counter: 5, r1: 6, r2: 4 },
      explanation: 'הConsumer מחסיר 1: R2 = 4.',
    },
    {
      actor: 'producer',
      code: PRODUCER_LINES[2],
      actorLine: 2,
      state: { counter: 6, r1: 6, r2: 4 },
      explanation: 'הProducer חוזר וכותב R1 ל-counter. counter = 6.',
    },
    {
      actor: 'consumer',
      code: CONSUMER_LINES[2],
      actorLine: 2,
      state: { counter: 4, r1: 6, r2: 4 },
      explanation: 'הConsumer כותב R2 ל-counter — ודורס את הכתיבה של הProducer. counter = 4.',
      note: 'התוצאה שגויה. counter היה צריך להישאר 5, אבל יצא 4. זאת בדיוק Race Condition.',
    },
  ],
  summary: 'התוצאה הסופית: counter = 4. שגוי. הכתיבה של הConsumer דרסה את זו של הProducer.',
};

export const RACE_SCENARIOS: InterleavingScenario[] = [SAFE_SCENARIO, RACE_SCENARIO];

export function getScenarioById(id: string): InterleavingScenario {
  return RACE_SCENARIOS.find((s) => s.id === id) ?? RACE_SCENARIOS[0];
}
