// תרחישים להדגמת הבעיה הראשונה של קוראים-כותבים (Readers-Writers).
// כל צעד מתאים לשורת קוד אחת של Reader או Writer, כך שהלומד רואה
// code → step → consequence.

export type ActorRole = 'reader' | 'writer';

export type ActorPhase =
  | 'idle'
  | 'entering' // בתוך פרוטוקול הכניסה של קורא (מגן mutex, משנה readcount)
  | 'reading' // קורא בפועל
  | 'exiting' // בתוך פרוטוקול היציאה של קורא
  | 'waiting-wrt' // כותב שחסום על wrt
  | 'writing' // כותב בפועל
  | 'done';

export interface ActorSnapshot {
  id: string;
  role: ActorRole;
  phase: ActorPhase;
}

export type DbState = 'free' | 'reading' | 'writing';

export interface RWState {
  readcount: number;
  mutex: number;
  wrt: number;
  dbState: DbState;
  actors: ActorSnapshot[];
}

export type ChangedKey = 'mutex' | 'wrt' | 'readcount' | 'db';

export type CodePath = 'reader' | 'writer';

export interface RWStep {
  actorId: string;
  codePath: CodePath;
  codeLine: number; // reader: 1..9, writer: 1..3
  state: RWState;
  explanation: string;
  note?: string;
  changed?: ChangedKey;
  wokeUp?: string;
}

export interface RWScenario {
  id: string;
  title: string;
  subtitle: string;
  initial: RWState;
  steps: RWStep[];
  conclusion: string;
}

/** קוד ה-Reader (9 שורות). משמש להצגה בקוד הפאנל. */
export const READER_CODE: { num: number; text: string }[] = [
  { num: 1, text: 'wait(mutex);' },
  { num: 2, text: 'readcount++;' },
  { num: 3, text: 'if (readcount == 1) wait(wrt);' },
  { num: 4, text: 'signal(mutex);' },
  { num: 5, text: '// reading...' },
  { num: 6, text: 'wait(mutex);' },
  { num: 7, text: 'readcount--;' },
  { num: 8, text: 'if (readcount == 0) signal(wrt);' },
  { num: 9, text: 'signal(mutex);' },
];

/** קוד ה-Writer (3 שורות). */
export const WRITER_CODE: { num: number; text: string }[] = [
  { num: 1, text: 'wait(wrt);' },
  { num: 2, text: '// writing...' },
  { num: 3, text: 'signal(wrt);' },
];

// ============================================================
// Runner פנימי לבניית תרחישים ברמת שורת קוד.
// ============================================================

interface Runner {
  readcount: number;
  mutex: number;
  wrt: number;
  wrtQueue: string[];
  actorOrder: string[];
  roles: Record<string, ActorRole>;
  phases: Record<string, ActorPhase>;
  steps: RWStep[];
}

function deriveDbState(r: Runner): DbState {
  for (const id of r.actorOrder) {
    if (r.phases[id] === 'writing') return 'writing';
  }
  for (const id of r.actorOrder) {
    if (r.phases[id] === 'reading') return 'reading';
  }
  return 'free';
}

function snapshot(r: Runner): RWState {
  return {
    readcount: r.readcount,
    mutex: r.mutex,
    wrt: r.wrt,
    dbState: deriveDbState(r),
    actors: r.actorOrder.map((id) => ({
      id,
      role: r.roles[id],
      phase: r.phases[id],
    })),
  };
}

function push(
  r: Runner,
  actorId: string,
  codePath: CodePath,
  codeLine: number,
  explanation: string,
  extras?: { note?: string; wokeUp?: string; changed?: ChangedKey }
) {
  r.steps.push({
    actorId,
    codePath,
    codeLine,
    state: snapshot(r),
    explanation,
    note: extras?.note,
    wokeUp: extras?.wokeUp,
    changed: extras?.changed,
  });
}

// -------- Reader line helpers --------

function readerL1(r: Runner, id: string) {
  r.mutex -= 1;
  r.phases[id] = 'entering';
  push(
    r,
    id,
    'reader',
    1,
    `${id}: wait(mutex) — שורה 1. mutex יורד מ-1 ל-0. ${id} נכנס לאזור מוגן כדי לטפל בבטחה ב-readcount.`,
    { changed: 'mutex' }
  );
}

function readerL2(r: Runner, id: string) {
  r.readcount += 1;
  push(
    r,
    id,
    'reader',
    2,
    `${id}: readcount++ — שורה 2. readcount עולה מ-${r.readcount - 1} ל-${r.readcount}.`,
    { changed: 'readcount' }
  );
}

function readerL3(r: Runner, id: string, noteIfFirst?: string) {
  if (r.readcount === 1) {
    r.wrt -= 1;
    push(
      r,
      id,
      'reader',
      3,
      `${id}: הבדיקה readcount == 1 מתקיימת — ${id} הוא הקורא הראשון. קורא wait(wrt) — wrt יורד מ-1 ל-0. מעכשיו כותבים חסומים.`,
      { changed: 'wrt', note: noteIfFirst }
    );
  } else {
    push(
      r,
      id,
      'reader',
      3,
      `${id}: הבדיקה readcount == 1 לא מתקיימת (${id} לא ראשון, readcount = ${r.readcount}). מדלג על wait(wrt) — לא נוגע בנעילה של המסד.`
    );
  }
}

function readerL4(r: Runner, id: string) {
  r.mutex += 1;
  r.phases[id] = 'reading';
  push(
    r,
    id,
    'reader',
    4,
    `${id}: signal(mutex) — שורה 4. mutex חוזר ל-1. ${id} יוצא מהאזור המוגן ומתחיל לקרוא בפועל.`,
    { changed: 'mutex' }
  );
}

function readerL5(r: Runner, id: string, note?: string) {
  push(
    r,
    id,
    'reader',
    5,
    `${id}: // reading — שורה 5. ${id} קורא מהמסד. בזמן הזה קוראים נוספים יכולים להצטרף בלי להמתין, אבל כותבים חסומים.`,
    { note }
  );
}

function readerL6(r: Runner, id: string) {
  r.mutex -= 1;
  r.phases[id] = 'exiting';
  push(
    r,
    id,
    'reader',
    6,
    `${id}: wait(mutex) — שורה 6. ${id} מתחיל פרוטוקול יציאה. לוקח את ה-mutex כדי להוריד את readcount בבטחה.`,
    { changed: 'mutex' }
  );
}

function readerL7(r: Runner, id: string) {
  r.readcount -= 1;
  push(
    r,
    id,
    'reader',
    7,
    `${id}: readcount-- — שורה 7. readcount יורד מ-${r.readcount + 1} ל-${r.readcount}.`,
    { changed: 'readcount' }
  );
}

function readerL8(r: Runner, id: string, noteIfLast?: string) {
  if (r.readcount === 0) {
    r.wrt += 1;
    let wokeUp: string | undefined;
    if (r.wrt <= 0 && r.wrtQueue.length > 0) {
      wokeUp = r.wrtQueue.shift()!;
      r.phases[wokeUp] = 'writing';
    }
    push(
      r,
      id,
      'reader',
      8,
      wokeUp
        ? `${id}: הבדיקה readcount == 0 מתקיימת — ${id} אחרון. signal(wrt) מעלה את wrt ל-${r.wrt}. יש בתור — ${wokeUp} מתעורר ונכנס לכתיבה.`
        : `${id}: הבדיקה readcount == 0 מתקיימת — ${id} אחרון. signal(wrt) מעלה את wrt ל-${r.wrt}. המסד פנוי שוב לכותבים.`,
      { changed: 'wrt', wokeUp, note: noteIfLast }
    );
  } else {
    push(
      r,
      id,
      'reader',
      8,
      `${id}: הבדיקה readcount == 0 לא מתקיימת (readcount = ${r.readcount}). מדלג על signal(wrt) — לא משחרר את הנעילה, כי יש עוד קוראים.`
    );
  }
}

function readerL9(r: Runner, id: string) {
  r.mutex += 1;
  r.phases[id] = 'done';
  push(
    r,
    id,
    'reader',
    9,
    `${id}: signal(mutex) — שורה 9. mutex חוזר ל-1. ${id} סיים את הפרוטוקול.`,
    { changed: 'mutex' }
  );
}

function readerEntry(r: Runner, id: string, noteIfFirst?: string) {
  readerL1(r, id);
  readerL2(r, id);
  readerL3(r, id, noteIfFirst);
  readerL4(r, id);
}

function readerExit(r: Runner, id: string, noteIfLast?: string) {
  readerL6(r, id);
  readerL7(r, id);
  readerL8(r, id, noteIfLast);
  readerL9(r, id);
}

// -------- Writer line helpers --------

function writerW1(r: Runner, id: string, noteIfBlock?: string) {
  r.wrt -= 1;
  if (r.wrt < 0) {
    r.wrtQueue.push(id);
    r.phases[id] = 'waiting-wrt';
    push(
      r,
      id,
      'writer',
      1,
      `${id}: wait(wrt) — שורה 1. wrt יורד ל-${r.wrt}. ערך שלילי — ${id} נחסם בתור של wrt עד ששוחרר.`,
      { changed: 'wrt', note: noteIfBlock }
    );
  } else {
    r.phases[id] = 'writing';
    push(
      r,
      id,
      'writer',
      1,
      `${id}: wait(wrt) — שורה 1. wrt יורד ל-${r.wrt}. ${id} ממשיך ישר לכתיבה בלעדית.`,
      { changed: 'wrt' }
    );
  }
}

function writerW2(r: Runner, id: string) {
  push(
    r,
    id,
    'writer',
    2,
    `${id}: // writing — שורה 2. ${id} מחזיק גישה בלעדית למסד. אף קורא ואף כותב אחר לא יכול להיכנס.`
  );
}

function writerW3(r: Runner, id: string) {
  r.wrt += 1;
  r.phases[id] = 'done';
  push(
    r,
    id,
    'writer',
    3,
    `${id}: signal(wrt) — שורה 3. wrt חוזר ל-${r.wrt}. ${id} סיים, המסד פנוי.`,
    { changed: 'wrt' }
  );
}

function makeRunner(): Runner {
  return {
    readcount: 0,
    mutex: 1,
    wrt: 1,
    wrtQueue: [],
    actorOrder: ['R1', 'R2', 'W1'],
    roles: { R1: 'reader', R2: 'reader', W1: 'writer' },
    phases: { R1: 'idle', R2: 'idle', W1: 'idle' },
    steps: [],
  };
}

function buildInitial(): RWState {
  const r = makeRunner();
  return snapshot(r);
}

// ============================================================
// Scenario 1: קורא בודד (כל שורה בפני עצמה)
// ============================================================
const SCENARIO_SOLO: RWScenario = (() => {
  const r = makeRunner();
  readerL1(r, 'R1');
  readerL2(r, 'R1');
  readerL3(r, 'R1', 'זה הרגע שבו הקורא הראשון "מרים" את wrt בשביל כל הקוראים הבאים.');
  readerL4(r, 'R1');
  readerL5(r, 'R1');
  readerL6(r, 'R1');
  readerL7(r, 'R1');
  readerL8(r, 'R1', 'הקורא האחרון הוא היחיד שמשחרר wrt — כך כותב יכול להיכנס.');
  readerL9(r, 'R1');
  return {
    id: 'solo-reader',
    title: 'קורא בודד — כל שורה',
    subtitle:
      'קורא יחיד מבצע את כל תשע שורות הקוד, אחת-אחת. נראה בדיוק איך כל שורה משנה את readcount, mutex ו-wrt.',
    initial: buildInitial(),
    steps: r.steps,
    conclusion:
      'הלוגיקה: mutex מגן על readcount; הקורא הראשון נוגע ב-wrt, האחרון משחרר אותו; כל שאר השורות אינן נוגעות ב-wrt.',
  };
})();

// ============================================================
// Scenario 2: שני קוראים במקביל
// ============================================================
const SCENARIO_CONCURRENT: RWScenario = (() => {
  const r = makeRunner();
  readerEntry(r, 'R1');
  readerL5(r, 'R1');
  readerEntry(
    r,
    'R2',
    undefined
  );
  readerL5(
    r,
    'R2',
    'שימו לב: R2 לא נגע ב-wrt בשורה 3 שלו. שני הקוראים חולקים את הגישה ללא חסימה.'
  );
  readerExit(r, 'R1');
  readerExit(
    r,
    'R2',
    'R2 היה האחרון — כאן נכנסת שורה 8 לפעולה: signal(wrt) משחרר את הנעילה.'
  );
  return {
    id: 'two-readers',
    title: 'שני קוראים במקביל',
    subtitle:
      'R1 מתחיל, R2 מצטרף באמצע. נראה איך שורה 3 של R2 מדלגת על wait(wrt), וכיצד רק הקורא האחרון מגיע ל-signal(wrt).',
    initial: buildInitial(),
    steps: r.steps,
    conclusion:
      'הקורא הראשון לוקח את wrt פעם אחת. כל שאר הקוראים רק משנים readcount. רק האחרון משחרר את wrt — כך הכותבים חסומים כל עוד יש קורא אחד לפחות.',
  };
})();

// ============================================================
// Scenario 3: Writer ממתין
// ============================================================
const SCENARIO_WRITER_WAITS: RWScenario = (() => {
  const r = makeRunner();
  readerEntry(r, 'R1');
  readerL5(r, 'R1');
  readerEntry(r, 'R2');
  readerL5(r, 'R2');
  writerW1(
    r,
    'W1',
    'שורה 1 של Writer היא הנקודה הקריטית: כאן רואים איך הכותב חסום ברמת הקוד — לא בקוד של ה-Reader, אלא ב-wait(wrt) שלו.'
  );
  readerExit(r, 'R1');
  readerExit(
    r,
    'R2',
    'שורה 8 של R2 לא רק משחררת את wrt — היא גם מעירה את W1 שחיכה בתור. זה הקישור בין קוד הקוראים לקוד הכותב.'
  );
  writerW2(r, 'W1');
  writerW3(r, 'W1');
  return {
    id: 'writer-waits',
    title: 'Writer ממתין לקוראים',
    subtitle:
      'שני קוראים פעילים. כותב מגיע ונחסם על wait(wrt). רק כשהקורא האחרון יוצא — הכותב נכנס.',
    initial: buildInitial(),
    steps: r.steps,
    conclusion:
      'כל הקישור בין קוראים לכותב עובר דרך wrt: הקורא הראשון חוסם (שורה 3), האחרון משחרר (שורה 8), והכותב שהיה בתור מתעורר וממשיך משורה 2 שלו — בלי קוראים בתווך.',
  };
})();

export const RW_SCENARIOS: RWScenario[] = [
  SCENARIO_SOLO,
  SCENARIO_CONCURRENT,
  SCENARIO_WRITER_WAITS,
];

export function getRWScenarioById(id: string): RWScenario {
  return RW_SCENARIOS.find((s) => s.id === id) ?? RW_SCENARIOS[0];
}

export const PHASE_LABELS: Record<ActorPhase, { hebrew: string; tone: string }> = {
  idle: { hebrew: 'לא פעיל', tone: 'neutral' },
  entering: { hebrew: 'בפרוטוקול כניסה', tone: 'entering' },
  reading: { hebrew: 'קורא', tone: 'reading' },
  exiting: { hebrew: 'בפרוטוקול יציאה', tone: 'entering' },
  'waiting-wrt': { hebrew: 'ממתין על wrt', tone: 'wait' },
  writing: { hebrew: 'כותב', tone: 'writing' },
  done: { hebrew: 'סיים', tone: 'done' },
};
