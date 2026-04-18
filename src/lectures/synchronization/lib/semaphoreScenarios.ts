// תרחישים להדגמת semaphore עם תור חסימה (blocking).
// כל צעד מתאים לשורת קוד אחת ב-wait() או ב-signal(),
// כך שהלומד רואה code → step → consequence.

export type ProcessState =
  | 'ready' // זמין, לא ביצע פעולה עדיין
  | 'critical' // בקטע הקריטי / מחזיק במשאב
  | 'blocked' // חסום בתור הסמאפור
  | 'done'; // סיים את הריצה שלו

export type CodePath = 'wait' | 'signal';
export type CodeLine = 1 | 2 | 3 | 4;

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
  /** מי מבצע את שורת הקוד */
  actor: string;
  /** באיזה מסלול קוד נמצאים — wait(S) או signal(S) */
  codePath: CodePath;
  /** איזו שורה בתוך הפונקציה בוצעה כעת */
  codeLine: CodeLine;
  /** המצב המלא לאחר ביצוע השורה */
  state: SemaphoreState;
  /** הסבר בעברית — מה השורה עושה, איך המצב השתנה ולמה */
  explanation: string;
  /** הערה הוראתית (כותרת "שים לב") */
  note?: string;
  /** אם הפעולה גרמה ליקיצה של תהליך שנחסם בתור */
  wokeUp?: string;
}

export interface SemaphoreScenario {
  id: string;
  title: string;
  subtitle: string;
  initialValue: number;
  participants: string[];
  initial: SemaphoreState;
  steps: SemaphoreStep[];
  conclusion: string;
}

/** הקוד המתואר ב-wait(S). שורות בתוך גוף הפונקציה. */
export const WAIT_CODE: { num: CodeLine; text: string }[] = [
  { num: 1, text: 'S.value--;' },
  { num: 2, text: 'if (S.value < 0) {' },
  { num: 3, text: '    add this process to S.list;' },
  { num: 4, text: '    block();' },
];

/** הקוד המתואר ב-signal(S). */
export const SIGNAL_CODE: { num: CodeLine; text: string }[] = [
  { num: 1, text: 'S.value++;' },
  { num: 2, text: 'if (S.value <= 0) {' },
  { num: 3, text: '    remove a process P from S.list;' },
  { num: 4, text: '    wakeup(P);' },
];

function buildInitial(
  initialValue: number,
  participants: string[]
): SemaphoreState {
  const processes: Record<string, ProcessState> = {};
  for (const id of participants) processes[id] = 'ready';
  return {
    semaphore: { value: initialValue, queue: [] },
    processes,
  };
}

// ============================================================
// בניית תרחישים בעזרת "runner" זעיר שמתחזק state חי
// ועוטה כל פעולה לסדרת sub-steps ברמת שורת קוד.
// ============================================================

interface Runner {
  value: number;
  queue: string[];
  procs: Record<string, ProcessState>;
  steps: SemaphoreStep[];
}

function snapshot(r: Runner): SemaphoreState {
  return {
    semaphore: { value: r.value, queue: [...r.queue] },
    processes: { ...r.procs },
  };
}

function push(
  r: Runner,
  actor: string,
  codePath: CodePath,
  codeLine: CodeLine,
  explanation: string,
  extras?: { note?: string; wokeUp?: string }
) {
  r.steps.push({
    actor,
    codePath,
    codeLine,
    state: snapshot(r),
    explanation,
    note: extras?.note,
    wokeUp: extras?.wokeUp,
  });
}

/** wait() — תמיד מתחיל ב-S.value-- ואז בודק. אם חיובי/אפס → ממשיך. אחרת → נכנס לתור ונחסם. */
function doWait(r: Runner, actor: string, note?: { onBlock?: string; onPass?: string }) {
  // שורה 1: S.value--
  r.value -= 1;
  push(r, actor, 'wait', 1, `${actor} מבצע wait(S): שורה 1 — S.value יורד ל-${r.value}.`);

  // שורה 2: הבדיקה
  if (r.value < 0) {
    push(
      r,
      actor,
      'wait',
      2,
      `הבדיקה S.value < 0 מתקיימת (${r.value} < 0). נכנסים לענף החסימה — נמשיך לשורות 3-4.`,
      { note: note?.onBlock }
    );
    // שורה 3: add to queue
    r.queue.push(actor);
    push(
      r,
      actor,
      'wait',
      3,
      `${actor} נוסף לסוף התור. התור הפך ל-[${r.queue.join(', ')}].`
    );
    // שורה 4: block()
    r.procs[actor] = 'blocked';
    push(
      r,
      actor,
      'wait',
      4,
      `block() נקרא — ${actor} יוצא מריצה. הוא לא צורך CPU יותר ממתין שיתעוררו אותו.`
    );
  } else {
    push(
      r,
      actor,
      'wait',
      2,
      `הבדיקה S.value < 0 לא מתקיימת (${r.value} ≥ 0). מדלגים על הענף, ו-${actor} ממשיך ישירות לקטע הקריטי.`,
      { note: note?.onPass }
    );
    r.procs[actor] = 'critical';
  }
}

/** signal() — תמיד מתחיל ב-S.value++ ואז בודק. אם יש בתור (value<=0) → שולף ומעיר. */
function doSignal(
  r: Runner,
  actor: string,
  note?: { onWake?: string; onNoWake?: string }
) {
  // שורה 1: S.value++
  r.value += 1;
  push(r, actor, 'signal', 1, `${actor} מבצע signal(S): שורה 1 — S.value עולה ל-${r.value}.`);

  // שורה 2: הבדיקה
  if (r.value <= 0) {
    push(
      r,
      actor,
      'signal',
      2,
      `הבדיקה S.value ≤ 0 מתקיימת (${r.value} ≤ 0) — סימן שיש ממתינים בתור. ממשיכים לשורות 3-4.`,
      { note: note?.onWake }
    );
    // שורה 3: remove from queue
    const woken = r.queue.shift();
    if (!woken) throw new Error('signal expected queue to be non-empty');
    push(
      r,
      actor,
      'signal',
      3,
      `מוציאים את ${woken} מראש התור. התור הפך ל-[${r.queue.join(', ')}].`
    );
    // שורה 4: wakeup
    r.procs[woken] = 'critical';
    r.procs[actor] = 'done';
    push(
      r,
      actor,
      'signal',
      4,
      `wakeup(${woken}) — ${woken} חוזר לריצה ונכנס לקטע הקריטי. ${actor} סיים.`,
      { wokeUp: woken }
    );
  } else {
    r.procs[actor] = 'done';
    push(
      r,
      actor,
      'signal',
      2,
      `הבדיקה S.value ≤ 0 לא מתקיימת (${r.value} > 0) — אין ממתינים. מדלגים על הענף. ${actor} סיים.`,
      { note: note?.onNoWake }
    );
  }
}

function makeRunner(initialValue: number, participants: string[]): Runner {
  return {
    value: initialValue,
    queue: [],
    procs: Object.fromEntries(participants.map((id) => [id, 'ready' as ProcessState])),
    steps: [],
  };
}

// ============================================================
// Scenario 1: Binary mutex — no contention
// ============================================================
const SCENARIO_NO_CONTENTION: SemaphoreScenario = (() => {
  const participants = ['P1', 'P2'];
  const r = makeRunner(1, participants);
  doWait(r, 'P1', { onPass: 'היה ערך 1 — זמין. אין חסימה.' });
  doSignal(r, 'P1', { onNoWake: 'התור ריק — אין מי להעיר.' });
  doWait(r, 'P2');
  doSignal(r, 'P2');
  return {
    id: 'binary-no-contention',
    title: 'Mutex — בלי תחרות',
    subtitle:
      'שני תהליכים רצופים, בלי חסימה. נראה איך כל שורת קוד בתוך wait() ו-signal() משנה את הערך.',
    initialValue: 1,
    participants,
    initial: buildInitial(1, participants),
    steps: r.steps,
    conclusion:
      'wait() עם ערך חיובי: שורה 1 מורידה, שורה 2 מדלגת על הענף. signal() עם תור ריק: שורה 1 מעלה, שורה 2 מדלגת. אין כניסה לשורות 3-4.',
  };
})();

// ============================================================
// Scenario 2: Binary mutex — with blocking queue
// ============================================================
const SCENARIO_BLOCKING: SemaphoreScenario = (() => {
  const participants = ['P1', 'P2', 'P3'];
  const r = makeRunner(1, participants);
  doWait(r, 'P1');
  doWait(r, 'P2', {
    onBlock:
      'שלב קריטי: ערך שלילי מסמן "יש ממתין". במימוש blocking התהליך לא מסתובב — הוא יוצא מריצה.',
  });
  doWait(r, 'P3');
  doSignal(r, 'P1', {
    onWake: 'כאן רואים בדיוק למה שורה 2 בודקת ≤0: אם הערך שלילי, יש מי להוציא מהתור.',
  });
  doSignal(r, 'P2');
  doSignal(r, 'P3', {
    onNoWake: 'הערך חזר ל-1 והתור ריק. הסמאפור חזר למצב ההתחלתי.',
  });
  return {
    id: 'binary-blocking',
    title: 'Mutex — עם תור חסימה',
    subtitle:
      'שלושה תהליכים על mutex אחד. שניים נחסמים — רואים את שורות 3-4 של wait() בפעולה, ואת שורות 3-4 של signal() מעירות אותם.',
    initialValue: 1,
    participants,
    initial: buildInitial(1, participants),
    steps: r.steps,
    conclusion:
      'התור FIFO של השמאפור + ערך שלילי הם הגרעין של blocking: כל signal עם ערך ≤0 שולף תהליך מהתור ומעיר אותו — בלי busy waiting.',
  };
})();

// ============================================================
// Scenario 3: Counting semaphore
// ============================================================
const SCENARIO_COUNTING: SemaphoreScenario = (() => {
  const participants = ['P1', 'P2', 'P3'];
  const r = makeRunner(2, participants);
  doWait(r, 'P1');
  doWait(r, 'P2', {
    onPass:
      'counting: הערך ההתחלתי 2, ולכן שני תהליכים יכולים לעבור wait() בלי לחסום זה את זה.',
  });
  doWait(r, 'P3', {
    onBlock: 'המשאב השלישי תפוס. רק עכשיו wait() של P3 יוצא שלילי וחוסם.',
  });
  doSignal(r, 'P1', {
    onWake:
      'שחרור של P1 מקפיץ את הערך מ-1- ל-0. ≤0 מתקיים — שולפים את P3 ומעירים אותו.',
  });
  doSignal(r, 'P2');
  doSignal(r, 'P3');
  return {
    id: 'counting',
    title: 'Counting Semaphore — שני משאבים',
    subtitle:
      'Semaphore עם ערך התחלתי 2. שני תהליכים נכנסים יחד, השלישי נחסם עד ששוחרר משאב.',
    initialValue: 2,
    participants,
    initial: buildInitial(2, participants),
    steps: r.steps,
    conclusion:
      'אותו קוד בדיוק של wait()/signal() — רק ערך התחלתי שונה. הלוגיקה לא משתנה בין binary ל-counting.',
  };
})();

export const SEMAPHORE_SCENARIOS: SemaphoreScenario[] = [
  SCENARIO_NO_CONTENTION,
  SCENARIO_BLOCKING,
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
