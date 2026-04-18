export type PhilosopherState = 'thinking' | 'hungry' | 'waiting' | 'eating';

export type ProgressState = 'possible' | 'danger' | 'deadlocked';

export type DPScenarioId = 'naive-deadlock' | 'atomic-pickup';

export interface PhilosopherSnapshot {
  id: number;
  state: PhilosopherState;
  heldChopsticks: number[];
  waitingFor: number[];
}

export interface ChopstickSnapshot {
  id: number;
  owner: number | null;
}

export interface DPState {
  philosophers: PhilosopherSnapshot[];
  chopsticks: ChopstickSnapshot[];
  progress: ProgressState;
}

export interface DPCodeLine {
  num: number;
  text: string;
}

export interface DPStep {
  title: string;
  action: string;
  codeLine: number;
  activePhilosophers: number[];
  activeChopsticks: number[];
  state: DPState;
  explanation: string;
  note?: string;
}

export interface DPScenario {
  id: DPScenarioId;
  title: string;
  subtitle: string;
  remedyLabel?: string;
  codeTitle: string;
  code: DPCodeLine[];
  initial: DPState;
  steps: DPStep[];
  conclusion: string;
}

export const PHILOSOPHER_IDS = [0, 1, 2, 3, 4];
export const CHOPSTICK_IDS = [0, 1, 2, 3, 4];

export const PHILOSOPHER_STATE_LABELS: Record<
  PhilosopherState,
  { label: string; tone: 'neutral' | 'hungry' | 'waiting' | 'eating' }
> = {
  thinking: { label: 'חושב', tone: 'neutral' },
  hungry: { label: 'רעב', tone: 'hungry' },
  waiting: { label: 'ממתין', tone: 'waiting' },
  eating: { label: 'אוכל', tone: 'eating' },
};

export const NAIVE_CODE: DPCodeLine[] = [
  { num: 1, text: 'think();' },
  { num: 2, text: 'state[i] = HUNGRY;' },
  { num: 3, text: 'wait(chopstick[i]);        // left' },
  { num: 4, text: 'wait(chopstick[(i + 1) % 5]); // right' },
  { num: 5, text: 'eat();' },
  { num: 6, text: 'signal(chopstick[(i + 1) % 5]);' },
  { num: 7, text: 'signal(chopstick[i]);' },
];

export const ATOMIC_PICKUP_CODE: DPCodeLine[] = [
  { num: 1, text: 'state[i] = HUNGRY;' },
  { num: 2, text: 'if (leftFree && rightFree) {' },
  { num: 3, text: '  take(left); take(right);' },
  { num: 4, text: '  eat();' },
  { num: 5, text: '  put(left); put(right);' },
  { num: 6, text: '} else wait without holding;' },
];

type StateOverrides = Partial<Record<number, PhilosopherState>>;
type ChopstickOwners = Partial<Record<number, number | null>>;
type WaitingMap = Partial<Record<number, number[]>>;

function makeState(
  states: StateOverrides,
  owners: ChopstickOwners,
  waiting: WaitingMap,
  progress: ProgressState
): DPState {
  const ownerOf = (chopstickId: number) => owners[chopstickId] ?? null;

  return {
    progress,
    philosophers: PHILOSOPHER_IDS.map((id) => ({
      id,
      state: states[id] ?? 'thinking',
      heldChopsticks: CHOPSTICK_IDS.filter((chopstickId) => ownerOf(chopstickId) === id),
      waitingFor: waiting[id] ?? [],
    })),
    chopsticks: CHOPSTICK_IDS.map((id) => ({
      id,
      owner: ownerOf(id),
    })),
  };
}

const ALL_HUNGRY: StateOverrides = {
  0: 'hungry',
  1: 'hungry',
  2: 'hungry',
  3: 'hungry',
  4: 'hungry',
};

const ALL_WAITING: StateOverrides = {
  0: 'waiting',
  1: 'waiting',
  2: 'waiting',
  3: 'waiting',
  4: 'waiting',
};

const LEFT_OWNERS: ChopstickOwners = {
  0: 0,
  1: 1,
  2: 2,
  3: 3,
  4: 4,
};

const DEADLOCK_WAITING: WaitingMap = {
  0: [1],
  1: [2],
  2: [3],
  3: [4],
  4: [0],
};

const INITIAL_STATE = makeState({}, {}, {}, 'possible');

const NAIVE_DEADLOCK_SCENARIO: DPScenario = {
  id: 'naive-deadlock',
  title: 'תרחיש נאיבי: כולם נתקעים',
  subtitle:
    'כל פילוסוף לוקח קודם את המקל השמאלי שלו, ואז מנסה לקחת את הימני. אם כולם עושים זאת יחד, נוצר מעגל המתנה.',
  codeTitle: 'קוד נאיבי לכל פילוסוף',
  code: NAIVE_CODE,
  initial: INITIAL_STATE,
  steps: [
    {
      title: 'כולם נהיים רעבים',
      action: 'state[i] = HUNGRY',
      codeLine: 2,
      activePhilosophers: PHILOSOPHER_IDS,
      activeChopsticks: [],
      state: makeState(ALL_HUNGRY, {}, {}, 'possible'),
      explanation:
        'חמשת הפילוסופים רוצים לאכול. עדיין אין בעלות על מקלות, ולכן התקדמות אפשרית.',
    },
    {
      title: 'P0 לוקח את המקל השמאלי',
      action: 'P0: wait(C0)',
      codeLine: 3,
      activePhilosophers: [0],
      activeChopsticks: [0],
      state: makeState(ALL_HUNGRY, { 0: 0 }, {}, 'possible'),
      explanation:
        'P0 מצליח לקחת את C0. הוא עדיין צריך את C1 כדי לאכול, אבל ממשיך להחזיק את C0.',
    },
    {
      title: 'P1 לוקח את המקל השמאלי',
      action: 'P1: wait(C1)',
      codeLine: 3,
      activePhilosophers: [1],
      activeChopsticks: [1],
      state: makeState(ALL_HUNGRY, { 0: 0, 1: 1 }, {}, 'possible'),
      explanation:
        'P1 מצליח לקחת את C1. שימו לב: זה בדיוק המקל הימני ש-P0 יצטרך בשורה הבאה.',
    },
    {
      title: 'P2 לוקח את המקל השמאלי',
      action: 'P2: wait(C2)',
      codeLine: 3,
      activePhilosophers: [2],
      activeChopsticks: [2],
      state: makeState(ALL_HUNGRY, { 0: 0, 1: 1, 2: 2 }, {}, 'possible'),
      explanation:
        'P2 מצליח לקחת את C2. עוד משאב ננעל, אבל עדיין אף אחד לא אוכל.',
    },
    {
      title: 'P3 לוקח את המקל השמאלי',
      action: 'P3: wait(C3)',
      codeLine: 3,
      activePhilosophers: [3],
      activeChopsticks: [3],
      state: makeState(ALL_HUNGRY, { 0: 0, 1: 1, 2: 2, 3: 3 }, {}, 'possible'),
      explanation:
        'P3 מצליח לקחת את C3. כל פילוסוף שכבר התחיל מחזיק משאב אחד ומחכה להמשיך.',
    },
    {
      title: 'P4 משלים את המעגל',
      action: 'P4: wait(C4)',
      codeLine: 3,
      activePhilosophers: [4],
      activeChopsticks: [4],
      state: makeState(ALL_HUNGRY, LEFT_OWNERS, {}, 'danger'),
      explanation:
        'P4 לוקח את C4. עכשיו כל חמשת המקלות תפוסים, וכל פילוסוף מחזיק מקל אחד בלבד.',
      note: 'זה עוד לא מסומן כ-deadlock עד שכולם מנסים את המקל השני, אבל כבר אין מקל פנוי.',
    },
    {
      title: 'כולם מנסים לקחת את המקל השני',
      action: 'all: wait(right)',
      codeLine: 4,
      activePhilosophers: PHILOSOPHER_IDS,
      activeChopsticks: CHOPSTICK_IDS,
      state: makeState(ALL_WAITING, LEFT_OWNERS, DEADLOCK_WAITING, 'deadlocked'),
      explanation:
        'כל פילוסוף נכשל בשורה 4: P0 צריך את C1 שמוחזק על ידי P1, P1 צריך את C2, וכך הלאה עד P4 שצריך את C0. אין מי שיכול להתקדם ולשחרר.',
      note: 'זהו deadlock: יש mutual exclusion, hold-and-wait, אין preemption, ויש circular wait.',
    },
  ],
  conclusion:
    'הפתרון הנאיבי נראה טבעי, אבל מאפשר מצב שבו כולם מחזיקים משאב אחד ומחכים למשאב שמוחזק על ידי השכן. לכן אין פעולה עתידית שיכולה לשבור את המעגל.',
};

const ATOMIC_PICKUP_SCENARIO: DPScenario = {
  id: 'atomic-pickup',
  title: 'תרופה: לקחת רק אם שני המקלות פנויים',
  subtitle:
    'בתרחיש הזה פילוסוף לא מחזיק מקל אחד בזמן שהוא מחכה לשני. אם אחד המקלות תפוס, הוא מחכה בלי להחזיק כלום.',
  remedyLabel: 'Deadlock נמנע',
  codeTitle: 'וריאציה: לקיחה אטומית של שני המקלות',
  code: ATOMIC_PICKUP_CODE,
  initial: INITIAL_STATE,
  steps: [
    {
      title: 'כולם רוצים לאכול',
      action: 'state[i] = HUNGRY',
      codeLine: 1,
      activePhilosophers: PHILOSOPHER_IDS,
      activeChopsticks: [],
      state: makeState(ALL_HUNGRY, {}, {}, 'possible'),
      explanation:
        'כמו קודם, כולם רעבים. ההבדל הוא בכלל הלקיחה: אין מצב שבו פילוסוף מחזיק מקל אחד ומחכה לשני.',
    },
    {
      title: 'P0 מוצא שני מקלות פנויים',
      action: 'P0: take(C0,C1)',
      codeLine: 3,
      activePhilosophers: [0],
      activeChopsticks: [0, 1],
      state: makeState({ ...ALL_HUNGRY, 0: 'eating' }, { 0: 0, 1: 0 }, {}, 'possible'),
      explanation:
        'P0 בודק את C0 ואת C1. שניהם פנויים, ולכן הוא לוקח את שניהם ביחד ומתחיל לאכול.',
    },
    {
      title: 'P1 לא מקבל מקל חלקי',
      action: 'P1: C1 unavailable',
      codeLine: 6,
      activePhilosophers: [1],
      activeChopsticks: [1, 2],
      state: makeState(
        { ...ALL_HUNGRY, 0: 'eating', 1: 'waiting' },
        { 0: 0, 1: 0 },
        { 1: [1] },
        'possible'
      ),
      explanation:
        'P1 צריך את C1 ואת C2. C1 מוחזק על ידי P0, ולכן P1 לא לוקח את C2 לבדו. הוא ממתין בלי להחזיק משאב.',
      note: 'זו הנקודה שמונעת hold-and-wait: מי שלא מקבל את שני המקלות לא מחזיק אף אחד מהם.',
    },
    {
      title: 'P2 יכול לאכול במקביל',
      action: 'P2: take(C2,C3)',
      codeLine: 3,
      activePhilosophers: [2],
      activeChopsticks: [2, 3],
      state: makeState(
        { ...ALL_HUNGRY, 0: 'eating', 1: 'waiting', 2: 'eating' },
        { 0: 0, 1: 0, 2: 2, 3: 2 },
        { 1: [1] },
        'possible'
      ),
      explanation:
        'P2 בודק את C2 ואת C3. שניהם פנויים, אז הוא לוקח את שניהם ומתקדמת אכילה נוספת. המערכת לא תקועה.',
    },
    {
      title: 'P3 ממתין בלי לנעול את C4',
      action: 'P3: C3 unavailable',
      codeLine: 6,
      activePhilosophers: [3],
      activeChopsticks: [3, 4],
      state: makeState(
        { ...ALL_HUNGRY, 0: 'eating', 1: 'waiting', 2: 'eating', 3: 'waiting' },
        { 0: 0, 1: 0, 2: 2, 3: 2 },
        { 1: [1], 3: [3] },
        'possible'
      ),
      explanation:
        'P3 צריך את C3 ואת C4. C3 תפוס על ידי P2, ולכן P3 לא לוקח את C4. C4 נשאר פנוי למי שיכול להשתמש בו עם המקל השני שלו.',
    },
    {
      title: 'P0 מסיים ומשחרר',
      action: 'P0: put(C0,C1)',
      codeLine: 5,
      activePhilosophers: [0],
      activeChopsticks: [0, 1],
      state: makeState(
        { ...ALL_HUNGRY, 0: 'thinking', 1: 'waiting', 2: 'eating', 3: 'waiting' },
        { 2: 2, 3: 2 },
        { 1: [2], 3: [3] },
        'possible'
      ),
      explanation:
        'P0 משחרר את C0 ואת C1. עדיין ייתכן ש-P1 ממתין, כי C2 מוחזק על ידי P2, אבל יש התקדמות ושחרור משאבים.',
    },
    {
      title: 'P4 משתמש בהזדמנות',
      action: 'P4: take(C4,C0)',
      codeLine: 3,
      activePhilosophers: [4],
      activeChopsticks: [4, 0],
      state: makeState(
        { ...ALL_HUNGRY, 0: 'thinking', 1: 'waiting', 2: 'eating', 3: 'waiting', 4: 'eating' },
        { 0: 4, 2: 2, 3: 2, 4: 4 },
        { 1: [2], 3: [3] },
        'possible'
      ),
      explanation:
        'P4 צריך את C4 ואת C0. שניהם פנויים עכשיו, ולכן הוא יכול לאכול. גם כשיש ממתינים, המערכת ממשיכה לזוז.',
    },
    {
      title: 'P2 משחרר, ו-P1 יכול להתקדם',
      action: 'P1: take(C1,C2)',
      codeLine: 3,
      activePhilosophers: [1, 2],
      activeChopsticks: [1, 2],
      state: makeState(
        { ...ALL_HUNGRY, 0: 'thinking', 1: 'eating', 2: 'thinking', 3: 'waiting', 4: 'eating' },
        { 0: 4, 1: 1, 2: 1, 4: 4 },
        { 3: [4] },
        'possible'
      ),
      explanation:
        'P2 משחרר את C2 ואת C3. כעת P1 מוצא את C1 ואת C2 פנויים ולוקח את שניהם יחד. אין מעגל שבו כולם מחזיקים ומחכים.',
      note: 'התרופה מונעת deadlock, אבל היא לא מבטיחה הוגנות: מתזמן לא הוגן עדיין עלול לגרום starvation.',
    },
  ],
  conclusion:
    'לקיחה אטומית שוברת את תנאי hold-and-wait: פילוסוף לא נשאר עם מקל אחד בזמן שהוא מחכה לשני. לכן המעגל של deadlock לא נוצר, אף שעדיין צריך מדיניות הוגנת כדי למנוע רעב.',
};

export const DP_SCENARIOS: DPScenario[] = [
  NAIVE_DEADLOCK_SCENARIO,
  ATOMIC_PICKUP_SCENARIO,
];

export function getDPScenarioById(id: string): DPScenario {
  return DP_SCENARIOS.find((scenario) => scenario.id === id) ?? DP_SCENARIOS[0];
}

export const DP_REMEDY_CARDS = [
  {
    title: 'הגבלה ל-4 פילוסופים',
    description:
      'אם רק ארבעה יכולים לשבת/להתחרות בו-זמנית, תמיד נשאר לפחות מקל אחד פנוי ולכן המעגל המלא נשבר.',
  },
  {
    title: 'לקיחה רק כששניהם פנויים',
    description:
      'זה התרחיש האינטראקטיבי כאן: פילוסוף שלא קיבל שני מקלות לא מחזיק אף מקל בזמן ההמתנה.',
    highlighted: true,
  },
  {
    title: 'סדר א-סימטרי',
    description:
      'פילוסופים זוגיים ואי-זוגיים לוקחים בסדר שונה. כך שוברים את circular wait בלי לבנות סימולטור נוסף.',
  },
];
