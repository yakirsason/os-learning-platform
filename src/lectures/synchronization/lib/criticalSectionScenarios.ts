// תרחישים שמדגימים את שלושת תנאי הפתרון לבעיית Critical Section.
// כל תרחיש מתמקד בכלל אחד (mutex / progress / bounded-waiting),
// ומראה הרצה שמכבדת או מפרה אותו.

export type Section = 'remainder' | 'entry' | 'critical' | 'exit';

export type Rule = 'mutex' | 'progress' | 'bounded-waiting';

export interface ProcessSnapshot {
  /** מזהה התהליך, למשל "P1" */
  id: string;
  section: Section;
  /** התהליך המודגש בצעד הזה (זה שביצע פעולה) */
  acted?: boolean;
}

export type RuleStatus = 'ok' | 'violated' | 'pending';

export interface RuleCheckStep {
  processes: ProcessSnapshot[];
  /** סטטוס לכל אחד משלושת הכללים בנקודת הזמן הזאת */
  ruleStatus: Record<Rule, RuleStatus>;
  /** כותרת קצרה לצעד */
  title: string;
  /** הסבר בעברית של מה קרה ולמה הכלל נשמר/הופר */
  explanation: string;
}

export interface RuleScenario {
  id: string;
  title: string;
  rule: Rule;
  outcome: 'preserved' | 'violated';
  /** הסבר קצר לפתיחת התרחיש */
  description: string;
  /** רשימת התהליכים בתרחיש (לא משתנה) */
  participants: string[];
  steps: RuleCheckStep[];
  /** מסקנה שמופיעה בסוף ההרצה */
  conclusion: string;
}

const RULE_LABELS: Record<Rule, { hebrew: string; english: string; short: string }> = {
  mutex: { hebrew: 'הדדיות (Mutual Exclusion)', english: 'Mutual Exclusion', short: 'Mutual Exclusion' },
  progress: { hebrew: 'התקדמות (Progress)', english: 'Progress', short: 'Progress' },
  'bounded-waiting': {
    hebrew: 'המתנה מוגבלת (Bounded Waiting)',
    english: 'Bounded Waiting',
    short: 'Bounded Waiting',
  },
};

export function getRuleLabel(rule: Rule) {
  return RULE_LABELS[rule];
}

const SECTION_LABELS: Record<Section, { hebrew: string; english: string }> = {
  remainder: { hebrew: 'יתרת הקוד', english: 'Remainder' },
  entry: { hebrew: 'בקשת כניסה', english: 'Entry' },
  critical: { hebrew: 'קטע קריטי', english: 'Critical' },
  exit: { hebrew: 'יציאה', english: 'Exit' },
};

export function getSectionLabel(section: Section) {
  return SECTION_LABELS[section];
}

export const SECTIONS_ORDER: Section[] = ['remainder', 'entry', 'critical', 'exit'];

const allOk: Record<Rule, RuleStatus> = {
  mutex: 'ok',
  progress: 'ok',
  'bounded-waiting': 'ok',
};

const allPending: Record<Rule, RuleStatus> = {
  mutex: 'pending',
  progress: 'pending',
  'bounded-waiting': 'pending',
};

const MUTEX_OK_SCENARIO: RuleScenario = {
  id: 'mutex-ok',
  title: 'הדדיות נשמרת',
  rule: 'mutex',
  outcome: 'preserved',
  description:
    'P1 ו-P2 מנסים להיכנס. רק אחד מצליח להיכנס לקטע הקריטי בכל רגע. הכניסה השנייה ממתינה.',
  participants: ['P1', 'P2'],
  steps: [
    {
      title: 'שניהם בהתחלה',
      processes: [
        { id: 'P1', section: 'remainder' },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: allPending,
      explanation: 'נקודת התחלה: שני התהליכים בקוד הרגיל, לא מנסים להיכנס.',
    },
    {
      title: 'P1 מבקש כניסה',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: { mutex: 'pending', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation: 'P1 מבצע את קוד הכניסה. אין עדיין אף אחד בקטע הקריטי.',
    },
    {
      title: 'P1 בקטע הקריטי',
      processes: [
        { id: 'P1', section: 'critical', acted: true },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation: 'P1 בקטע הקריטי. רק תהליך אחד בפנים — Mutual Exclusion נשמר.',
    },
    {
      title: 'P2 מבקש כניסה',
      processes: [
        { id: 'P1', section: 'critical' },
        { id: 'P2', section: 'entry', acted: true },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation: 'P2 מבקש להיכנס. הוא נחסם בקוד הכניסה כי P1 בפנים — בדיוק מה שצריך.',
    },
    {
      title: 'P1 יוצא',
      processes: [
        { id: 'P1', section: 'exit', acted: true },
        { id: 'P2', section: 'entry' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'ok' },
      explanation: 'P1 משחרר. P2 מקבל את התור ויכנס בצעד הבא.',
    },
    {
      title: 'P2 בקטע הקריטי',
      processes: [
        { id: 'P1', section: 'remainder' },
        { id: 'P2', section: 'critical', acted: true },
      ],
      ruleStatus: allOk,
      explanation: 'P2 נכנס לקטע הקריטי. שוב — תהליך אחד בלבד בפנים.',
    },
  ],
  conclusion: 'הדדיות נשמרה לאורך כל ההרצה. בכל רגע — לכל היותר תהליך אחד בקטע הקריטי.',
};

const MUTEX_VIOLATED_SCENARIO: RuleScenario = {
  id: 'mutex-violated',
  title: 'הדדיות מופרת',
  rule: 'mutex',
  outcome: 'violated',
  description:
    'בלי mutual exclusion: שני תהליכים נכנסים יחד. זה בדיוק התרחיש שגורם ל-Race Condition כפי שראינו בדוגמת counter.',
  participants: ['P1', 'P2'],
  steps: [
    {
      title: 'שניהם בהתחלה',
      processes: [
        { id: 'P1', section: 'remainder' },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: allPending,
      explanation: 'נקודת התחלה.',
    },
    {
      title: 'שניהם מבקשים כניסה',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'entry', acted: true },
      ],
      ruleStatus: { mutex: 'pending', progress: 'pending', 'bounded-waiting': 'pending' },
      explanation: 'שניהם מבקשים להיכנס בערך באותו זמן. בלי הגנה — שניהם ייכנסו.',
    },
    {
      title: 'שניהם בקטע הקריטי',
      processes: [
        { id: 'P1', section: 'critical', acted: true },
        { id: 'P2', section: 'critical', acted: true },
      ],
      ruleStatus: { mutex: 'violated', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation:
        'שני התהליכים נכנסו יחד לקטע הקריטי — Mutual Exclusion הופר. זה המצב שיוצר Race Condition על המשאב המשותף.',
    },
  ],
  conclusion:
    'ההפרה: שני תהליכים בקטע הקריטי בו-זמנית. כל פעולה משותפת על המשאב יכולה להפיק תוצאה שגויה.',
};

const PROGRESS_VIOLATED_SCENARIO: RuleScenario = {
  id: 'progress-violated',
  title: 'התקדמות מופרת',
  rule: 'progress',
  outcome: 'violated',
  description:
    'אף אחד לא בקטע הקריטי, אבל ההחלטה מי ייכנס תקועה. P1 רוצה להיכנס וחסום, גם כשאף אחד לא מפריע.',
  participants: ['P1', 'P2'],
  steps: [
    {
      title: 'מצב התחלה',
      processes: [
        { id: 'P1', section: 'remainder' },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: allPending,
      explanation: 'אף אחד לא מבקש להיכנס.',
    },
    {
      title: 'P1 מבקש כניסה',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'pending', 'bounded-waiting': 'pending' },
      explanation: 'P1 מנסה להיכנס. P2 בכלל לא מנסה — הוא ביתרת הקוד.',
    },
    {
      title: 'אבל P1 לא מתקדם',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'violated', 'bounded-waiting': 'pending' },
      explanation:
        'הקטע הקריטי פנוי, אף אחד אחר לא מבקש להיכנס — ועדיין אלגוריתם הכניסה לא מאפשר ל-P1 להיכנס. Progress הופר.',
    },
    {
      title: 'הזמן עובר ושום דבר לא קורה',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'violated', 'bounded-waiting': 'pending' },
      explanation:
        'P1 ימשיך להיות תקוע בקוד הכניסה לנצח. תזכרו: Progress דורש שאם הקטע פנוי, ההחלטה מי ייכנס לא תתעכב לנצח.',
    },
  ],
  conclusion:
    'אף אחד לא בקטע הקריטי, אבל P1 לא יכול להתקדם. תהליכים שביתרת הקוד לא משפיעים על ההחלטה — וזה בדיוק מה שהופר כאן.',
};

const BOUNDED_WAITING_VIOLATED_SCENARIO: RuleScenario = {
  id: 'bounded-waiting-violated',
  title: 'המתנה מוגבלת מופרת',
  rule: 'bounded-waiting',
  outcome: 'violated',
  description:
    'P1 ביקש להיכנס, אבל P2 משיג אותו שוב ושוב. אין גבול עליון לכמה פעמים P2 ייכנס לפני שP1 יקבל תור.',
  participants: ['P1', 'P2'],
  steps: [
    {
      title: 'מצב התחלה',
      processes: [
        { id: 'P1', section: 'remainder' },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: allPending,
      explanation: 'אף אחד לא מבקש כניסה כרגע.',
    },
    {
      title: 'P1 מבקש כניסה ראשון',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'remainder' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation: 'P1 הראשון להגיע לקוד הכניסה. הוא ממתין לתור שלו.',
    },
    {
      title: 'P2 מגיע ועוקף',
      processes: [
        { id: 'P1', section: 'entry' },
        { id: 'P2', section: 'critical', acted: true },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation: 'P2 הגיע אחרי P1 — אבל נכנס לפניו. עדיין לא מצב חמור: זאת רק הפעם הראשונה.',
    },
    {
      title: 'P2 חוזר ועוקף שוב',
      processes: [
        { id: 'P1', section: 'entry' },
        { id: 'P2', section: 'critical', acted: true },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'pending' },
      explanation: 'P2 סיים, חזר ל-remainder, ואז נכנס שוב — ושוב לפני P1.',
    },
    {
      title: 'וכך בלי הפסקה',
      processes: [
        { id: 'P1', section: 'entry', acted: true },
        { id: 'P2', section: 'critical' },
      ],
      ruleStatus: { mutex: 'ok', progress: 'ok', 'bounded-waiting': 'violated' },
      explanation:
        'אם אין גבול עליון לכמה פעמים P2 יכול להיכנס לפני שP1 יקבל תור — Bounded Waiting הופר. P1 יכול לחכות לנצח.',
    },
  ],
  conclusion:
    'הדדיות נשמרה (אף פעם לא שניים בפנים) ו-Progress נשמר (יש מי שנכנס) — אבל P1 לא קיבל תור. זה רעב (starvation).',
};

export const RULE_SCENARIOS: RuleScenario[] = [
  MUTEX_OK_SCENARIO,
  MUTEX_VIOLATED_SCENARIO,
  PROGRESS_VIOLATED_SCENARIO,
  BOUNDED_WAITING_VIOLATED_SCENARIO,
];

export function getRuleScenarioById(id: string): RuleScenario {
  return RULE_SCENARIOS.find((s) => s.id === id) ?? RULE_SCENARIOS[0];
}
