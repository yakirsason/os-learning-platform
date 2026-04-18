// תרחישים להדגמה צעד-צעד של אלגוריתם Peterson לשני תהליכים.
// כל צעד מצהיר על המצב המלא לאחר ביצוע — קל לעבור קדימה ואחורה ללא מחשבון state.

export type ProcessId = 0 | 1;

export type PetersonPhase =
  | 'remainder' // מחוץ לכניסה — לא מנסה להיכנס
  | 'set-flag' // ביצע flag[i]=true; הצעד הבא יהיה turn=j
  | 'set-turn' // ביצע turn=j; הצעד הבא יהיה while-check
  | 'waiting' // ב-while loop, התנאי היה אמיתי — ימשיך לבדוק
  | 'critical'; // בקטע הקריטי

export interface PetersonState {
  flag: [boolean, boolean];
  turn: ProcessId;
  p0Phase: PetersonPhase;
  p1Phase: PetersonPhase;
}

/** שורת הקוד שבוצעה. 1-5 מתוך אלגוריתם Peterson. 0 = "בקטע הקריטי" (לא שורה אמיתית). */
export type PetersonLine = 0 | 1 | 2 | 3 | 5;

export interface PetersonStep {
  actor: ProcessId;
  /** השורה שבוצעה כעת (לצורך הדגשה ויזואלית) */
  line: PetersonLine;
  /** טקסט קצר של הפעולה, בעברית */
  action: string;
  /** המצב המלא לאחר ביצוע הצעד */
  state: PetersonState;
  /** הסבר מלא בעברית למה קרה ולמה זה משנה */
  explanation: string;
  /** הערה אופציונלית בנקודות מפתח */
  note?: string;
}

export interface PetersonScenario {
  id: string;
  title: string;
  subtitle: string;
  initial: PetersonState;
  steps: PetersonStep[];
  conclusion: string;
}

export const PETERSON_LINES_BY_PROCESS: Record<ProcessId, string[]> = {
  0: [
    'flag[0] = true;',
    'turn = 1;',
    'while (flag[1] && turn == 1) ;',
    '// critical section',
    'flag[0] = false;',
  ],
  1: [
    'flag[1] = true;',
    'turn = 0;',
    'while (flag[0] && turn == 0) ;',
    '// critical section',
    'flag[1] = false;',
  ],
};

const INITIAL_STATE: PetersonState = {
  flag: [false, false],
  turn: 0,
  p0Phase: 'remainder',
  p1Phase: 'remainder',
};

const SCENARIO_SOLO: PetersonScenario = {
  id: 'solo',
  title: 'P0 לבד — ללא תחרות',
  subtitle: 'P0 רוצה להיכנס. P1 לא מתעניין כרגע. P0 צריך להצליח להיכנס מיד.',
  initial: INITIAL_STATE,
  steps: [
    {
      actor: 0,
      line: 1,
      action: 'flag[0] = true',
      state: {
        flag: [true, false],
        turn: 0,
        p0Phase: 'set-flag',
        p1Phase: 'remainder',
      },
      explanation:
        'P0 מסמן שהוא רוצה להיכנס: flag[0] = true. זה ה"דגל" שאומר לעולם — אני מועמד.',
    },
    {
      actor: 0,
      line: 2,
      action: 'turn = 1',
      state: {
        flag: [true, false],
        turn: 1,
        p0Phase: 'set-turn',
        p1Phase: 'remainder',
      },
      explanation:
        'P0 קובע turn = 1. זה אומר: "אם יש תחרות — תורו של P1 תחילה". זאת מחווה של אדיבות שמונעת deadlock.',
    },
    {
      actor: 0,
      line: 3,
      action: 'while-check → flag[1]=false, נכנס',
      state: {
        flag: [true, false],
        turn: 1,
        p0Phase: 'critical',
        p1Phase: 'remainder',
      },
      explanation:
        'P0 בודק: flag[1] && turn == 1. flag[1] הוא false — אין מועמד אחר. התנאי לא מתקיים, P0 נכנס לקטע הקריטי.',
      note: 'כאן רואים את התפקיד של flag — אם השני לא רוצה להיכנס, הראשון לא מחכה.',
    },
    {
      actor: 0,
      line: 0,
      action: 'P0 בקטע הקריטי',
      state: {
        flag: [true, false],
        turn: 1,
        p0Phase: 'critical',
        p1Phase: 'remainder',
      },
      explanation:
        'P0 עכשיו בתוך הקטע הקריטי, מבצע את העבודה שלו. flag[0] עדיין true כדי שתהליך אחר שיגיע ידע שהמקום תפוס.',
    },
    {
      actor: 0,
      line: 5,
      action: 'flag[0] = false',
      state: {
        flag: [false, false],
        turn: 1,
        p0Phase: 'remainder',
        p1Phase: 'remainder',
      },
      explanation:
        'P0 יוצא וקובע flag[0] = false. עכשיו אם P1 ירצה להיכנס, הוא לא ייתקל בהתנגדות.',
    },
  ],
  conclusion:
    'בהיעדר תחרות, P0 נכנס מיד בלי לחכות. זה Progress: כשאף אחד אחר לא מנסה — לא חוסמים אותך.',
};

const SCENARIO_BOTH: PetersonScenario = {
  id: 'both',
  title: 'שניהם בו-זמנית — תחרות',
  subtitle:
    'P0 ו-P1 מנסים להיכנס בערך באותו זמן. נראה איך turn קובע מי נכנס ראשון ומי מחכה.',
  initial: INITIAL_STATE,
  steps: [
    {
      actor: 0,
      line: 1,
      action: 'P0: flag[0] = true',
      state: {
        flag: [true, false],
        turn: 0,
        p0Phase: 'set-flag',
        p1Phase: 'remainder',
      },
      explanation: 'P0 מתחיל את קוד הכניסה ומסמן flag[0] = true.',
    },
    {
      actor: 1,
      line: 1,
      action: 'P1: flag[1] = true',
      state: {
        flag: [true, true],
        turn: 0,
        p0Phase: 'set-flag',
        p1Phase: 'set-flag',
      },
      explanation:
        'גם P1 הגיע. הוא מסמן flag[1] = true. עכשיו שני הדגלים פתוחים — שניהם מועמדים.',
      note: 'זה הרגע שבו תחרות אמיתית מתחילה. נראה איך turn ימנע מהם להיכנס יחד.',
    },
    {
      actor: 0,
      line: 2,
      action: 'P0: turn = 1',
      state: {
        flag: [true, true],
        turn: 1,
        p0Phase: 'set-turn',
        p1Phase: 'set-flag',
      },
      explanation: 'P0 מתחשב ואומר: "אם יש תחרות, תורו של P1". turn = 1.',
    },
    {
      actor: 1,
      line: 2,
      action: 'P1: turn = 0',
      state: {
        flag: [true, true],
        turn: 0,
        p0Phase: 'set-turn',
        p1Phase: 'set-turn',
      },
      explanation:
        'P1 גם מתחשב ואומר: "תורו של P0". turn = 0. שימו לב: P1 כתב last, אז turn יישאר 0.',
      note: 'הכלל: מי שכותב last ל-turn — מוותר. כאן P1 ויתר אחרון, אז P0 ייכנס ראשון.',
    },
    {
      actor: 0,
      line: 3,
      action: 'P0: while-check → flag[1]=true, turn=0 (≠1) → נכנס',
      state: {
        flag: [true, true],
        turn: 0,
        p0Phase: 'critical',
        p1Phase: 'set-turn',
      },
      explanation:
        'P0 בודק: flag[1] && turn == 1. flag[1]=true אבל turn=0 (לא 1). התנאי לא מתקיים — P0 נכנס.',
    },
    {
      actor: 1,
      line: 3,
      action: 'P1: while-check → flag[0]=true, turn=0 (==0) → ממתין',
      state: {
        flag: [true, true],
        turn: 0,
        p0Phase: 'critical',
        p1Phase: 'waiting',
      },
      explanation:
        'P1 בודק: flag[0] && turn == 0. שניהם נכונים — P1 חייב להמתין. הוא נשאר ב-while loop.',
      note: 'זאת ההדדיות בפעולה: לא יכול להיות ששניהם בקטע הקריטי בו-זמנית.',
    },
    {
      actor: 0,
      line: 5,
      action: 'P0: flag[0] = false',
      state: {
        flag: [false, true],
        turn: 0,
        p0Phase: 'remainder',
        p1Phase: 'waiting',
      },
      explanation:
        'P0 סיים בקטע הקריטי ויוצא. flag[0] = false. עכשיו P1, שעדיין בודק בלולאה, יראה את השינוי.',
    },
    {
      actor: 1,
      line: 3,
      action: 'P1: while-check חוזר → flag[0]=false → נכנס',
      state: {
        flag: [false, true],
        turn: 0,
        p0Phase: 'remainder',
        p1Phase: 'critical',
      },
      explanation:
        'P1 בודק שוב: flag[0]=false עכשיו. התנאי לא מתקיים — P1 נכנס. ההמתנה הסתיימה ברגע שP0 שחרר.',
      note: 'זאת Bounded Waiting: P1 חיכה בדיוק כניסה אחת של P0 — לא יותר.',
    },
    {
      actor: 1,
      line: 5,
      action: 'P1: flag[1] = false',
      state: {
        flag: [false, false],
        turn: 0,
        p0Phase: 'remainder',
        p1Phase: 'remainder',
      },
      explanation: 'P1 סיים גם הוא ויצא. שניהם חזרו ל-remainder. המערכת מוכנה לסבב הבא.',
    },
  ],
  conclusion:
    'שני התהליכים נכנסו אחד אחרי השני — בלי הדדיות מופרת ובלי המתנה אינסופית. כל שלושת התנאים — Mutual Exclusion, Progress ו-Bounded Waiting — נשמרו.',
};

export const PETERSON_SCENARIOS: PetersonScenario[] = [SCENARIO_SOLO, SCENARIO_BOTH];

export function getPetersonScenarioById(id: string): PetersonScenario {
  return PETERSON_SCENARIOS.find((s) => s.id === id) ?? PETERSON_SCENARIOS[0];
}

export const PHASE_LABELS: Record<PetersonPhase, { hebrew: string; short: string; tone: string }> = {
  remainder: { hebrew: 'יתרת הקוד', short: 'remainder', tone: 'neutral' },
  'set-flag': { hebrew: 'הציב flag', short: 'set-flag', tone: 'progress' },
  'set-turn': { hebrew: 'הציב turn', short: 'set-turn', tone: 'progress' },
  waiting: { hebrew: 'ממתין ב-while', short: 'waiting', tone: 'wait' },
  critical: { hebrew: 'בקטע הקריטי', short: 'critical', tone: 'critical' },
};
