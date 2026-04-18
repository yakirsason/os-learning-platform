// תרחישים להדגמת semaphore עם תור חסימה (blocking).
// כל צעד מציג את המצב המלא לאחר ביצוע — קל לעבור קדימה ואחורה.

export type ProcessState =
  | 'ready' // זמין, לא ביצע פעולה עדיין
  | 'critical' // בקטע הקריטי / מחזיק במשאב
  | 'blocked' // חסום בתור הסמאפור
  | 'done'; // סיים את הריצה שלו

export type ActionType = 'wait' | 'signal' | 'enter';

export interface SemaphoreSnapshot {
  value: number;
  /** רשימת מזהי תהליכים בתור (FIFO — הראשון יתעורר ראשון) */
  queue: string[];
}

export interface SemaphoreState {
  semaphore: SemaphoreSnapshot;
  processes: Record<string, ProcessState>;
}

export interface SemaphoreStep {
  /** מי ביצע פעולה */
  actor: string;
  /** סוג הפעולה — לתיוג ויזואלי */
  actionType: ActionType;
  /** טקסט קצר של הפעולה */
  action: string;
  /** המצב המלא לאחר ביצוע */
  state: SemaphoreState;
  /** הסבר מורחב בעברית */
  explanation: string;
  /** הערה לצדדי הוראה */
  note?: string;
  /** האם הפעולה גרמה ליציאה של תהליך אחר מהתור */
  wokeUp?: string;
}

export interface SemaphoreScenario {
  id: string;
  title: string;
  subtitle: string;
  /** ערך התחלתי של הסמאפור */
  initialValue: number;
  /** התהליכים שמשתתפים בתרחיש — בסדר ההצגה */
  participants: string[];
  initial: SemaphoreState;
  steps: SemaphoreStep[];
  conclusion: string;
}

function buildInitialState(
  initialValue: number,
  participants: string[]
): SemaphoreState {
  const processes: Record<string, ProcessState> = {};
  for (const id of participants) {
    processes[id] = 'ready';
  }
  return {
    semaphore: { value: initialValue, queue: [] },
    processes,
  };
}

const SCENARIO_BINARY_NO_CONTENTION: SemaphoreScenario = (() => {
  const participants = ['P1', 'P2'];
  return {
    id: 'binary-no-contention',
    title: 'Mutex — בלי תחרות',
    subtitle:
      'Binary semaphore (mutex) עם שני תהליכים שניגשים אחד אחרי השני. אף אחד לא נחסם.',
    initialValue: 1,
    participants,
    initial: buildInitialState(1, participants),
    steps: [
      {
        actor: 'P1',
        actionType: 'wait',
        action: 'P1: wait(S)',
        state: {
          semaphore: { value: 0, queue: [] },
          processes: { P1: 'critical', P2: 'ready' },
        },
        explanation:
          'P1 קורא wait(S). הערך 1 יורד ל-0 — חיובי או 0, אין חסימה. P1 נכנס לקטע הקריטי.',
      },
      {
        actor: 'P1',
        actionType: 'signal',
        action: 'P1: signal(S)',
        state: {
          semaphore: { value: 1, queue: [] },
          processes: { P1: 'done', P2: 'ready' },
        },
        explanation:
          'P1 סיים את העבודה ומשחרר. signal(S) מעלה את הערך מ-0 ל-1. התור ריק, אז אין מי להעיר.',
      },
      {
        actor: 'P2',
        actionType: 'wait',
        action: 'P2: wait(S)',
        state: {
          semaphore: { value: 0, queue: [] },
          processes: { P1: 'done', P2: 'critical' },
        },
        explanation:
          'P2 מגיע ומבצע wait(S). הערך יורד ל-0. שוב — אין חסימה, P2 נכנס.',
      },
      {
        actor: 'P2',
        actionType: 'signal',
        action: 'P2: signal(S)',
        state: {
          semaphore: { value: 1, queue: [] },
          processes: { P1: 'done', P2: 'done' },
        },
        explanation:
          'P2 משחרר. הערך חוזר ל-1. הסמאפור חזר למצב ההתחלתי, מוכן לסבב הבא.',
      },
    ],
    conclusion:
      'בלי תחרות: כל wait מצליח מיד. הערך פשוט יורד ועולה בין 0 ל-1, ואף תהליך לא נחסם.',
  };
})();

const SCENARIO_BINARY_WITH_BLOCKING: SemaphoreScenario = (() => {
  const participants = ['P1', 'P2', 'P3'];
  return {
    id: 'binary-blocking',
    title: 'Mutex — עם תור חסימה',
    subtitle:
      'שלושה תהליכים מתחרים על mutex אחד. שניים נחסמים בתור — רואים איך הערך יורד מתחת ל-0 וכיצד signal מעיר.',
    initialValue: 1,
    participants,
    initial: buildInitialState(1, participants),
    steps: [
      {
        actor: 'P1',
        actionType: 'wait',
        action: 'P1: wait(S)',
        state: {
          semaphore: { value: 0, queue: [] },
          processes: { P1: 'critical', P2: 'ready', P3: 'ready' },
        },
        explanation:
          'P1 ראשון ל-wait. הערך יורד מ-1 ל-0. P1 נכנס לקטע הקריטי.',
      },
      {
        actor: 'P2',
        actionType: 'wait',
        action: 'P2: wait(S) — נחסם',
        state: {
          semaphore: { value: -1, queue: ['P2'] },
          processes: { P1: 'critical', P2: 'blocked', P3: 'ready' },
        },
        explanation:
          'P2 קורא wait(S). הערך יורד ל-1-. כשהערך שלילי במימוש blocking, התהליך נכנס לתור הסמאפור ונחסם (block).',
        note: 'במימוש blocking: ערך שלילי = כמה תהליכים ממתינים. כאן יש אחד.',
      },
      {
        actor: 'P3',
        actionType: 'wait',
        action: 'P3: wait(S) — נחסם',
        state: {
          semaphore: { value: -2, queue: ['P2', 'P3'] },
          processes: { P1: 'critical', P2: 'blocked', P3: 'blocked' },
        },
        explanation:
          'גם P3 ניסה wait(S). הערך יורד ל-2-. P3 מצטרף לסוף התור (FIFO).',
      },
      {
        actor: 'P1',
        actionType: 'signal',
        action: 'P1: signal(S) — מעיר את P2',
        wokeUp: 'P2',
        state: {
          semaphore: { value: -1, queue: ['P3'] },
          processes: { P1: 'done', P2: 'critical', P3: 'blocked' },
        },
        explanation:
          'P1 סיים. signal(S) מעלה את הערך ל-1-. הערך עדיין שלילי — סימן שיש מישהו בתור. שולפים את הראש (P2) ומעירים אותו, P2 נכנס לקטע הקריטי.',
        note: 'הערך לא חזר ל-0 כי קוד הסמאפור שלף קודם, כלומר ערך שלילי משקף עדיין את הצירוף "כמה ממתינים".',
      },
      {
        actor: 'P2',
        actionType: 'signal',
        action: 'P2: signal(S) — מעיר את P3',
        wokeUp: 'P3',
        state: {
          semaphore: { value: 0, queue: [] },
          processes: { P1: 'done', P2: 'done', P3: 'critical' },
        },
        explanation:
          'P2 סיים. signal(S) מעלה ל-0. עדיין יש בתור — P3 מתעורר ונכנס.',
      },
      {
        actor: 'P3',
        actionType: 'signal',
        action: 'P3: signal(S)',
        state: {
          semaphore: { value: 1, queue: [] },
          processes: { P1: 'done', P2: 'done', P3: 'done' },
        },
        explanation:
          'P3 סיים. signal(S) מעלה ל-1. אין מי להעיר. הסמאפור חזר למצב התחלתי.',
      },
    ],
    conclusion:
      'תהליכים שלא יכלו להיכנס המתינו בתור FIFO. כל signal שמצא תהליכים בתור העיר אחד מהם — בלי busy waiting.',
  };
})();

const SCENARIO_COUNTING: SemaphoreScenario = (() => {
  const participants = ['P1', 'P2', 'P3'];
  return {
    id: 'counting',
    title: 'Counting Semaphore — שני משאבים',
    subtitle:
      'Counting semaphore עם ערך התחלתי 2 — מייצג שני משאבים זהים. שלושה תהליכים מתחרים. שניים נכנסים יחד.',
    initialValue: 2,
    participants,
    initial: buildInitialState(2, participants),
    steps: [
      {
        actor: 'P1',
        actionType: 'wait',
        action: 'P1: wait(S)',
        state: {
          semaphore: { value: 1, queue: [] },
          processes: { P1: 'critical', P2: 'ready', P3: 'ready' },
        },
        explanation:
          'P1 לוקח את המשאב הראשון. הערך יורד מ-2 ל-1. עדיין יש מקום פנוי.',
      },
      {
        actor: 'P2',
        actionType: 'wait',
        action: 'P2: wait(S)',
        state: {
          semaphore: { value: 0, queue: [] },
          processes: { P1: 'critical', P2: 'critical', P3: 'ready' },
        },
        explanation:
          'P2 לוקח את המשאב השני. הערך יורד ל-0. שני תהליכים בקטע הקריטי בו-זמנית — מותר, כי counting semaphore.',
        note: 'שימו לב: בניגוד ל-mutex, כאן יותר מתהליך אחד בקטע הקריטי. זה תקין כי המשאב מאפשר שני "מקומות".',
      },
      {
        actor: 'P3',
        actionType: 'wait',
        action: 'P3: wait(S) — נחסם',
        state: {
          semaphore: { value: -1, queue: ['P3'] },
          processes: { P1: 'critical', P2: 'critical', P3: 'blocked' },
        },
        explanation:
          'P3 ניסה אבל אין משאב פנוי. הערך יורד ל-1-, P3 נכנס לתור.',
      },
      {
        actor: 'P1',
        actionType: 'signal',
        action: 'P1: signal(S) — מעיר את P3',
        wokeUp: 'P3',
        state: {
          semaphore: { value: 0, queue: [] },
          processes: { P1: 'done', P2: 'critical', P3: 'critical' },
        },
        explanation:
          'P1 שחרר את המשאב שלו. הערך עולה ל-0. יש בתור — P3 מתעורר ונכנס. עכשיו P2 ו-P3 בקטע הקריטי יחד.',
      },
      {
        actor: 'P2',
        actionType: 'signal',
        action: 'P2: signal(S)',
        state: {
          semaphore: { value: 1, queue: [] },
          processes: { P1: 'done', P2: 'done', P3: 'critical' },
        },
        explanation:
          'P2 שחרר. הערך עולה ל-1. אין בתור, אז אין מי להעיר.',
      },
      {
        actor: 'P3',
        actionType: 'signal',
        action: 'P3: signal(S)',
        state: {
          semaphore: { value: 2, queue: [] },
          processes: { P1: 'done', P2: 'done', P3: 'done' },
        },
        explanation:
          'P3 סיים גם הוא. הערך חוזר ל-2 — כל המשאבים פנויים שוב.',
      },
    ],
    conclusion:
      'Counting semaphore עם ערך 2 איפשר שני תהליכים בו-זמנית. השלישי המתין בתור עד ששוחרר משאב.',
  };
})();

export const SEMAPHORE_SCENARIOS: SemaphoreScenario[] = [
  SCENARIO_BINARY_NO_CONTENTION,
  SCENARIO_BINARY_WITH_BLOCKING,
  SCENARIO_COUNTING,
];

export function getSemaphoreScenarioById(id: string): SemaphoreScenario {
  return SEMAPHORE_SCENARIOS.find((s) => s.id === id) ?? SEMAPHORE_SCENARIOS[0];
}

export const PROCESS_STATE_LABELS: Record<ProcessState, { hebrew: string; english: string }> = {
  ready: { hebrew: 'מוכן', english: 'Ready' },
  critical: { hebrew: 'בקטע הקריטי', english: 'Critical' },
  blocked: { hebrew: 'חסום בתור', english: 'Blocked' },
  done: { hebrew: 'סיים', english: 'Done' },
};
