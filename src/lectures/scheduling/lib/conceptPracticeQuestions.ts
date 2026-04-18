export type ConceptPracticeCategoryId =
  | 'foundation'
  | 'criteria'
  | 'algorithm-concepts'
  | 'queues'
  | 'advanced';

export type ConceptPracticeOptionId = 'a' | 'b' | 'c' | 'd';

export interface ConceptPracticeCategory {
  id: ConceptPracticeCategoryId;
  title: string;
  description: string;
}

export interface ConceptPracticeOption {
  id: ConceptPracticeOptionId;
  text: string;
  explanation: string;
}

export interface ConceptPracticeQuestion {
  id: string;
  categoryId: ConceptPracticeCategoryId;
  topic: string;
  prompt: string;
  options: ConceptPracticeOption[];
  correctOptionId: ConceptPracticeOptionId;
  explanation: string;
  examTip: string;
}

export const CONCEPT_PRACTICE_CATEGORIES: ConceptPracticeCategory[] = [
  {
    id: 'foundation',
    title: 'יסודות התזמון',
    description: 'CPU burst, I/O burst, Scheduler, Dispatcher ו-preemption.',
  },
  {
    id: 'criteria',
    title: 'מדדי תזמון',
    description: 'איך מבדילים בין utilization, throughput, turnaround, waiting ו-response.',
  },
  {
    id: 'algorithm-concepts',
    title: 'רעיונות של אלגוריתמים',
    description: 'SJF, SRTF, Priority, starvation, aging ו-convoy effect.',
  },
  {
    id: 'queues',
    title: 'תורים ו-quantum',
    description: 'Ready Queue, Round Robin, MLQ ו-MLFQ.',
  },
  {
    id: 'advanced',
    title: 'נושאי המשך',
    description: 'Thread scheduling, SMP, real-time והערכת אלגוריתמים.',
  },
];

export const CONCEPT_PRACTICE_QUESTIONS: ConceptPracticeQuestion[] = [
  {
    id: 'multiprogramming-cpu-utilization',
    categoryId: 'foundation',
    topic: 'Multiprogramming',
    prompt: 'למה Multiprogramming בדרך כלל משפר CPU utilization?',
    correctOptionId: 'b',
    explanation:
      'הרעיון הוא לא לתת ל-CPU לעמוד ריק בזמן שתהליך אחד מחכה ל-I/O. כשיש כמה תהליכים בזיכרון, ה-CPU יכול להריץ תהליך אחר בזמן ההמתנה.',
    examTip:
      'במבחן חפש את המילים “תהליך מחכה ל-I/O”. זה בדרך כלל הרגע שבו Process אחר יכול להשתמש ב-CPU.',
    options: [
      {
        id: 'a',
        text: 'כי כל Process רץ מהר יותר מבחינה חישובית.',
        explanation:
          'לא נכון. Multiprogramming לא מקצר את ה-CPU burst עצמו, אלא מנצל טוב יותר את הזמן שבו תהליכים אחרים מחכים.',
      },
      {
        id: 'b',
        text: 'כי בזמן ש-Process מחכה ל-I/O, Process אחר יכול לרוץ על ה-CPU.',
        explanation:
          'נכון. זו בדיוק המטרה: להפחית זמן שבו ה-CPU פנוי בלי עבודה.',
      },
      {
        id: 'c',
        text: 'כי ה-Dispatcher מבטל את כל זמני ההמתנה.',
        explanation:
          'לא נכון. Dispatcher מעביר שליטה ל-Process שנבחר, אבל הוא לא מבטל waiting time.',
      },
      {
        id: 'd',
        text: 'כי כל התהליכים רצים באותו זמן על CPU אחד.',
        explanation:
          'לא נכון. על CPU יחיד רק Process אחד רץ בכל רגע. יש החלפה מהירה ביניהם.',
      },
    ],
  },
  {
    id: 'cpu-io-burst-cycle',
    categoryId: 'foundation',
    topic: 'CPU-I/O burst cycle',
    prompt: 'איזה תיאור מתאים למחזור CPU–I/O burst cycle?',
    correctOptionId: 'a',
    explanation:
      'הרצת Process בדרך כלל מתקדמת בגלים: זמן קצר של עבודה על ה-CPU, אחר כך המתנה ל-I/O, ואז חזרה ל-CPU.',
    examTip:
      'CPU burst הוא “עבודה על המעבד”. I/O burst הוא “המתנה לפעולת קלט/פלט”.',
    options: [
      {
        id: 'a',
        text: 'ה-Process עובד על ה-CPU, מחכה ל-I/O, ואז חוזר שוב ל-CPU.',
        explanation:
          'נכון. זה המחזור המרכזי שעליו בנוי תזמון CPU.',
      },
      {
        id: 'b',
        text: 'ה-Process תמיד מסיים את כל ה-I/O לפני שהוא מקבל CPU בפעם הראשונה.',
        explanation:
          'לא נכון. לפי המודל בהרצאה, הביצוע מתחיל בדרך כלל ב-CPU burst.',
      },
      {
        id: 'c',
        text: 'CPU burst הוא הזמן שבו ה-Process מחכה בדיסק.',
        explanation:
          'לא נכון. CPU burst הוא זמן ריצה על המעבד, לא זמן המתנה ל-I/O.',
      },
      {
        id: 'd',
        text: 'I/O burst הוא זמן שבו ה-CPU מריץ את ה-Process.',
        explanation:
          'לא נכון. I/O burst הוא שלב המתנה לפעולת I/O.',
      },
    ],
  },
  {
    id: 'burst-distribution',
    categoryId: 'foundation',
    topic: 'CPU burst distribution',
    prompt: 'מה חשוב לזכור לגבי התפלגות CPU bursts?',
    correctOptionId: 'c',
    explanation:
      'בשקפים מודגש שרוב ה-CPU bursts קצרים, ויש פחות bursts ארוכים. זה משפיע על החשיבה מאחורי SJF ו-SRTF.',
    examTip:
      'אל תניח שכל ה-bursts דומים באורך. הרבה מערכות רואות הרבה bursts קצרים ומעט ארוכים.',
    options: [
      {
        id: 'a',
        text: 'כל ה-CPU bursts בדרך כלל באותו אורך.',
        explanation:
          'לא נכון. דווקא השונות באורכים היא חלק חשוב מהדיון בתזמון.',
      },
      {
        id: 'b',
        text: 'רוב ה-CPU bursts ארוכים מאוד.',
        explanation:
          'לא נכון. לפי הרעיון הקלאסי בשקפים, רובם קצרים ומיעוטם ארוכים.',
      },
      {
        id: 'c',
        text: 'רוב ה-CPU bursts קצרים, ויש פחות bursts ארוכים.',
        explanation:
          'נכון. זה מסביר למה אלגוריתמים שמעדיפים עבודה קצרה יכולים להיות מעניינים.',
      },
      {
        id: 'd',
        text: 'אורך ה-burst לא קשור בכלל להחלטות Scheduler.',
        explanation:
          'לא נכון. SJF ו-SRTF מבוססים ישירות על אורך burst או זמן שנותר.',
      },
    ],
  },
  {
    id: 'short-term-scheduler',
    categoryId: 'foundation',
    topic: 'CPU Scheduler',
    prompt: 'מה עושה ה-Short-term Scheduler?',
    correctOptionId: 'd',
    explanation:
      'ה-Short-term Scheduler בוחר Process מתוך ה-Ready Queue שנמצא בזיכרון ונותן לו את ה-CPU.',
    examTip:
      'Scheduler בוחר. Dispatcher מבצע את ההעברה בפועל.',
    options: [
      {
        id: 'a',
        text: 'מחליט איזה תוכניות יותקנו במחשב.',
        explanation:
          'לא נכון. זו לא החלטת CPU scheduling.',
      },
      {
        id: 'b',
        text: 'מבצע את context switch בעצמו.',
        explanation:
          'לא מדויק. context switch הוא חלק מתפקיד ה-Dispatcher, אחרי שה-Scheduler בחר.',
      },
      {
        id: 'c',
        text: 'מחשב תמיד את waiting time של כל Process.',
        explanation:
          'לא נכון. מדדים יכולים לשמש להערכה, אבל זו לא ההגדרה של Short-term Scheduler.',
      },
      {
        id: 'd',
        text: 'בוחר Process מוכן בזיכרון ומקצה לו את ה-CPU.',
        explanation:
          'נכון. זה התפקיד המרכזי שלו.',
      },
    ],
  },
  {
    id: 'decision-points-preemptive',
    categoryId: 'foundation',
    topic: 'Scheduling decision points',
    prompt: 'באיזה מצב החלטת תזמון יכולה להיות preemptive?',
    correctOptionId: 'b',
    explanation:
      'Preemptive scheduling קורה כאשר מערכת ההפעלה יכולה להוציא Process שרץ גם אם הוא עדיין לא סיים את ה-CPU burst שלו.',
    examTip:
      'מעבר מ-running ל-waiting או termination הם nonpreemptive. הגעה של Process חדש או חזרה מ-I/O יכולות ליצור preemption.',
    options: [
      {
        id: 'a',
        text: 'כאשר Process מסתיים.',
        explanation:
          'לא נכון. כש-Process מסתיים אין מה להוציא בכוח. זה מצב nonpreemptive.',
      },
      {
        id: 'b',
        text: 'כאשר Process חדש מגיע ומותר לו להחליף Process שרץ עכשיו.',
        explanation:
          'נכון. אם האלגוריתם מאפשר החלפה באמצע burst, זו preemption.',
      },
      {
        id: 'c',
        text: 'כאשר Process מבקש I/O ועוזב את ה-CPU בעצמו.',
        explanation:
          'לא נכון. כאן ה-Process מוותר על ה-CPU, לכן זה nonpreemptive.',
      },
      {
        id: 'd',
        text: 'רק כאשר אין אף Process ב-Ready Queue.',
        explanation:
          'לא נכון. אם אין Process מוכן, אין בחירה תחרותית לבצע.',
      },
    ],
  },
  {
    id: 'dispatcher-responsibility',
    categoryId: 'foundation',
    topic: 'Dispatcher',
    prompt: 'איזה תפקיד שייך ל-Dispatcher?',
    correctOptionId: 'a',
    explanation:
      'אחרי שה-Scheduler בחר את ה-Process הבא, ה-Dispatcher מעביר אליו את השליטה: context switch, מעבר ל-user mode וקפיצה למקום הנכון בתוכנית.',
    examTip:
      'הפרדה חשובה: Scheduler מחליט מי, Dispatcher גורם לזה לקרות.',
    options: [
      {
        id: 'a',
        text: 'לבצע context switch ולהעביר את ה-CPU ל-Process שנבחר.',
        explanation:
          'נכון. זה חלק מהעבודה המעשית של Dispatcher.',
      },
      {
        id: 'b',
        text: 'לקבוע את priority של כל התהליכים לפי גודל הזיכרון שלהם.',
        explanation:
          'לא נכון. זה לא תפקיד Dispatcher.',
      },
      {
        id: 'c',
        text: 'לבחור את האלגוריתם הכי טוב לכל שאלה במבחן.',
        explanation:
          'לא נכון. Dispatcher לא בוחר אסטרטגיית תזמון.',
      },
      {
        id: 'd',
        text: 'למחוק את ה-Ready Queue אחרי כל בחירה.',
        explanation:
          'לא נכון. Ready Queue ממשיך לשמור תהליכים מוכנים.',
      },
    ],
  },
  {
    id: 'dispatch-latency',
    categoryId: 'foundation',
    topic: 'Dispatch latency',
    prompt: 'מהי Dispatch latency?',
    correctOptionId: 'c',
    explanation:
      'Dispatch latency היא הזמן שלוקח למערכת להעביר את ה-CPU מתהליך אחד לתהליך אחר אחרי החלטת התזמון.',
    examTip:
      'זה זמן תקורה. הוא לא מקדם את העבודה של אף Process משתמש.',
    options: [
      {
        id: 'a',
        text: 'הזמן שבו Process מחכה ל-I/O.',
        explanation:
          'לא נכון. זה I/O waiting, לא dispatch latency.',
      },
      {
        id: 'b',
        text: 'הזמן הכולל מרגע הגעה עד סיום Process.',
        explanation:
          'לא נכון. זה turnaround time.',
      },
      {
        id: 'c',
        text: 'הזמן שלוקח להעביר את ה-CPU ל-Process שנבחר.',
        explanation:
          'נכון. זה כולל את עלות ההעברה בין תהליכים.',
      },
      {
        id: 'd',
        text: 'מספר התהליכים שמסתיימים ביחידת זמן.',
        explanation:
          'לא נכון. זה throughput.',
      },
    ],
  },
  {
    id: 'cpu-utilization-throughput',
    categoryId: 'criteria',
    topic: 'Scheduling criteria',
    prompt: 'מה ההבדל בין CPU utilization לבין throughput?',
    correctOptionId: 'b',
    explanation:
      'CPU utilization מודד כמה מהזמן ה-CPU עסוק. Throughput מודד כמה תהליכים מסתיימים ביחידת זמן.',
    examTip:
      'Utilization שואל “כמה המעבד עסוק?”. Throughput שואל “כמה עבודה הסתיימה?”.',
    options: [
      {
        id: 'a',
        text: 'שניהם מודדים בדיוק את אותו דבר.',
        explanation:
          'לא נכון. הם קשורים, אבל לא זהים.',
      },
      {
        id: 'b',
        text: 'utilization מודד זמן CPU עסוק, throughput מודד קצב סיום תהליכים.',
        explanation:
          'נכון. זו ההבחנה המרכזית בין שני המדדים.',
      },
      {
        id: 'c',
        text: 'utilization מודד waiting time, throughput מודד response time.',
        explanation:
          'לא נכון. אלה מדדים אחרים לגמרי.',
      },
      {
        id: 'd',
        text: 'throughput רלוונטי רק לאלגוריתם Priority.',
        explanation:
          'לא נכון. throughput הוא מדד כללי לכל אלגוריתם תזמון.',
      },
    ],
  },
  {
    id: 'turnaround-vs-waiting',
    categoryId: 'criteria',
    topic: 'Turnaround and waiting',
    prompt: 'איזו הבחנה נכונה בין turnaround time לבין waiting time?',
    correctOptionId: 'd',
    explanation:
      'Turnaround time הוא כל הזמן מהגעה עד סיום. Waiting time הוא רק הזמן שבו ה-Process מחכה ב-Ready Queue.',
    examTip:
      'Waiting time לא כולל זמן ריצה על CPU ולא זמן I/O. הוא מתמקד בהמתנה לתור CPU.',
    options: [
      {
        id: 'a',
        text: 'waiting time כולל את כל הזמן מהגעה עד סיום.',
        explanation:
          'לא נכון. זו ההגדרה של turnaround time.',
      },
      {
        id: 'b',
        text: 'turnaround time הוא רק הזמן ב-Ready Queue.',
        explanation:
          'לא נכון. Ready Queue waiting הוא waiting time.',
      },
      {
        id: 'c',
        text: 'waiting time ו-turnaround time תמיד שווים.',
        explanation:
          'לא נכון. בדרך כלל turnaround גדול יותר כי הוא כולל גם ריצה ועוד שלבים.',
      },
      {
        id: 'd',
        text: 'turnaround הוא מהגעה עד סיום; waiting הוא המתנה ב-Ready Queue.',
        explanation:
          'נכון. זו הבחנה חשובה מאוד לשאלות מושגיות וחישוביות.',
      },
    ],
  },
  {
    id: 'response-time',
    categoryId: 'criteria',
    topic: 'Response time',
    prompt: 'מה מודד response time?',
    correctOptionId: 'a',
    explanation:
      'Response time מודד כמה זמן עבר מרגע שה-Process הגיע עד הפעם הראשונה שהוא התחיל לרוץ על ה-CPU.',
    examTip:
      'Response הוא “מתי קיבלתי תגובה ראשונה”, לא “מתי סיימתי”.',
    options: [
      {
        id: 'a',
        text: 'מהגעה עד הריצה הראשונה על ה-CPU.',
        explanation:
          'נכון. זה חשוב במיוחד במערכות אינטראקטיביות.',
      },
      {
        id: 'b',
        text: 'מהגעה עד סיום מלא של ה-Process.',
        explanation:
          'לא נכון. זה turnaround time.',
      },
      {
        id: 'c',
        text: 'רק הזמן שבו ה-Process רץ על ה-CPU.',
        explanation:
          'לא נכון. זה CPU burst time, לא response time.',
      },
      {
        id: 'd',
        text: 'מספר הפעמים שבהן ה-Process עבר context switch.',
        explanation:
          'לא נכון. זה אירוע במערכת, לא ההגדרה של response time.',
      },
    ],
  },
  {
    id: 'convoy-effect',
    categoryId: 'algorithm-concepts',
    topic: 'FCFS',
    prompt: 'מהו Convoy effect ב-FCFS?',
    correctOptionId: 'c',
    explanation:
      'ב-FCFS תהליך ארוך שמגיע ראשון יכול לגרום להרבה תהליכים קצרים להמתין מאחוריו. זה יוצר תור ארוך וזמני המתנה גבוהים.',
    examTip:
      'הסימן הקלאסי: Process ארוך בהתחלה, הרבה Processes קצרים מאחוריו.',
    options: [
      {
        id: 'a',
        text: 'מצב שבו כל התהליכים מקבלים priority זהה.',
        explanation:
          'לא נכון. זה לא ההסבר ל-convoy effect.',
      },
      {
        id: 'b',
        text: 'מצב שבו Round Robin משתמש ב-quantum קצר מדי.',
        explanation:
          'לא נכון. זו בעיה אחרת, שקשורה ל-overhead של context switches.',
      },
      {
        id: 'c',
        text: 'תהליך ארוך מחזיק את ה-CPU וגורם לתהליכים קצרים לחכות.',
        explanation:
          'נכון. זה החיסרון הקלאסי של FCFS.',
      },
      {
        id: 'd',
        text: 'מצב שבו ה-CPU תמיד idle למרות שיש Ready Queue.',
        explanation:
          'לא נכון. אם יש Ready Queue, ה-Scheduler אמור לבחור Process להרצה.',
      },
    ],
  },
  {
    id: 'sjf-practical-difficulty',
    categoryId: 'algorithm-concepts',
    topic: 'SJF',
    prompt: 'מה הקושי המעשי המרכזי ב-SJF?',
    correctOptionId: 'b',
    explanation:
      'SJF צריך לדעת מי ה-Process עם ה-CPU burst הבא הקצר ביותר. בפועל ה-OS לא יודע את העתיד, ולכן צריך הערכה.',
    examTip:
      'SJF נשמע מושלם, אבל נקודת החולשה היא ידיעת ה-burst הבא.',
    options: [
      {
        id: 'a',
        text: 'אי אפשר לממש אותו כי אין Ready Queue.',
        explanation:
          'לא נכון. Ready Queue קיים; הקושי הוא לדעת את אורך ה-burst הבא.',
      },
      {
        id: 'b',
        text: 'ה-OS לא יודע בוודאות את ה-CPU burst הבא.',
        explanation:
          'נכון. לכן מדברים על חיזוי burst.',
      },
      {
        id: 'c',
        text: 'הוא תמיד preemptive ולכן יקר מדי.',
        explanation:
          'לא נכון. SJF הבסיסי הוא nonpreemptive. הגרסה preemptive היא SRTF.',
      },
      {
        id: 'd',
        text: 'הוא לא יכול לעבוד עם תהליכים קצרים.',
        explanation:
          'לא נכון. להפך, הוא מעדיף burst קצר.',
      },
    ],
  },
  {
    id: 'srtf-preemption',
    categoryId: 'algorithm-concepts',
    topic: 'SRTF',
    prompt: 'מתי SRTF עשוי לבצע preemption?',
    correctOptionId: 'd',
    explanation:
      'SRTF משווה את הזמן שנותר ל-Process שרץ מול תהליך חדש שהגיע. אם לתהליך החדש יש זמן שנותר קצר יותר, הוא יכול להחליף את הרץ.',
    examTip:
      'ב-SRTF לא מסתכלים רק על burst מקורי, אלא על remaining time.',
    options: [
      {
        id: 'a',
        text: 'רק כאשר ה-Process שרץ מסתיים.',
        explanation:
          'לא נכון. זה לא preemption; זה סיום רגיל.',
      },
      {
        id: 'b',
        text: 'כאשר Process חדש מגיע עם priority מספרי גבוה יותר.',
        explanation:
          'לא נכון. זו חשיבה של Priority Scheduling, לא SRTF.',
      },
      {
        id: 'c',
        text: 'כאשר עבר quantum קבוע.',
        explanation:
          'לא נכון. quantum שייך ל-Round Robin.',
      },
      {
        id: 'd',
        text: 'כאשר מגיע Process עם remaining time קצר יותר מזה שרץ.',
        explanation:
          'נכון. זה בדיוק ההבדל החשוב בין SJF ל-SRTF.',
      },
    ],
  },
  {
    id: 'exponential-averaging-alpha',
    categoryId: 'algorithm-concepts',
    topic: 'Exponential averaging',
    prompt: 'מה אומר alpha בחיזוי CPU burst עם exponential averaging?',
    correctOptionId: 'a',
    explanation:
      'alpha קובע כמה משקל נותנים ל-burst האחרון שנמדד לעומת התחזית הישנה. alpha גבוה מגיב יותר מהר להיסטוריה האחרונה.',
    examTip:
      'alpha = 0 מתעלם מהמדידה האחרונה. alpha = 1 מתבסס רק על המדידה האחרונה.',
    options: [
      {
        id: 'a',
        text: 'כמה משקל נותנים ל-burst האחרון לעומת התחזית הקודמת.',
        explanation:
          'נכון. זה הרעיון האינטואיטיבי של alpha.',
      },
      {
        id: 'b',
        text: 'כמה תהליכים יש ב-Ready Queue.',
        explanation:
          'לא נכון. alpha הוא פרמטר חיזוי, לא גודל תור.',
      },
      {
        id: 'c',
        text: 'ה-priority המספרי של Process.',
        explanation:
          'לא נכון. priority הוא מושג אחר.',
      },
      {
        id: 'd',
        text: 'כמה זמן נמשך context switch.',
        explanation:
          'לא נכון. זה קשור ל-dispatch latency, לא לחיזוי burst.',
      },
    ],
  },
  {
    id: 'priority-starvation-aging',
    categoryId: 'algorithm-concepts',
    topic: 'Priority Scheduling',
    prompt: 'מה הקשר בין starvation לבין aging ב-Priority Scheduling?',
    correctOptionId: 'b',
    explanation:
      'Starvation קורה כאשר Process בעדיפות נמוכה מחכה הרבה זמן כי תמיד מגיעים תהליכים חשובים יותר. Aging מעלה בהדרגה את העדיפות של מי שמחכה זמן רב.',
    examTip:
      'Aging הוא פתרון קלאסי ל-starvation.',
    options: [
      {
        id: 'a',
        text: 'Aging גורם לכל Process לרדת בעדיפות ככל שהוא מחכה.',
        explanation:
          'לא נכון. Aging אמור לעזור לתהליך שמחכה, לא להעניש אותו.',
      },
      {
        id: 'b',
        text: 'Aging מעלה בהדרגה עדיפות של Process שממתין זמן רב.',
        explanation:
          'נכון. כך מקטינים סיכוי שיישאר תקוע לנצח.',
      },
      {
        id: 'c',
        text: 'Starvation הוא שם אחר ל-dispatch latency.',
        explanation:
          'לא נכון. Starvation הוא המתנה ממושכת בגלל בחירות תזמון.',
      },
      {
        id: 'd',
        text: 'Aging רלוונטי רק ל-FCFS.',
        explanation:
          'לא נכון. הוא מופיע בעיקר בהקשר של Priority Scheduling.',
      },
    ],
  },
  {
    id: 'ready-queue-meaning',
    categoryId: 'queues',
    topic: 'Ready Queue',
    prompt: 'מה נמצא ב-Ready Queue?',
    correctOptionId: 'c',
    explanation:
      'Ready Queue מכיל תהליכים שמוכנים לרוץ, נמצאים בזיכרון, ורק מחכים לקבל CPU.',
    examTip:
      'Ready זה לא Running ולא Waiting ל-I/O. זה “מוכן, אבל עדיין לא על ה-CPU”.',
    options: [
      {
        id: 'a',
        text: 'תהליכים שמחכים לפעולת I/O להסתיים.',
        explanation:
          'לא נכון. אלה נמצאים במצב waiting, לא ב-Ready Queue.',
      },
      {
        id: 'b',
        text: 'תהליכים שכבר הסתיימו.',
        explanation:
          'לא נכון. Process שהסתיים לא מחכה ל-CPU.',
      },
      {
        id: 'c',
        text: 'תהליכים מוכנים לריצה שמחכים ל-CPU.',
        explanation:
          'נכון. זה התור שממנו ה-Scheduler בוחר.',
      },
      {
        id: 'd',
        text: 'רק תהליכים עם priority הכי גבוה.',
        explanation:
          'לא נכון. Ready Queue יכול להכיל תהליכים בעדיפויות שונות.',
      },
    ],
  },
  {
    id: 'round-robin-quantum',
    categoryId: 'queues',
    topic: 'Round Robin',
    prompt: 'מה תפקיד ה-time quantum ב-Round Robin?',
    correctOptionId: 'a',
    explanation:
      'ה-quantum קובע כמה זמן Process יכול לרוץ לפני שהוא מפנה את ה-CPU אם הוא לא סיים. אחר כך הוא חוזר לסוף ה-Ready Queue.',
    examTip:
      'Quantum קטן מדי גורם להרבה context switches. Quantum גדול מדי מתקרב להתנהגות של FCFS.',
    options: [
      {
        id: 'a',
        text: 'להגביל את זמן הריצה הרציף של Process על ה-CPU.',
        explanation:
          'נכון. זה מה שנותן ל-RR תחושה הוגנת ואינטראקטיבית.',
      },
      {
        id: 'b',
        text: 'לקבוע את אורך ה-CPU burst המקורי.',
        explanation:
          'לא נכון. ה-burst הוא דרישת העבודה של ה-Process, לא נקבע על ידי RR.',
      },
      {
        id: 'c',
        text: 'להחליף את הצורך ב-Ready Queue.',
        explanation:
          'לא נכון. RR עדיין משתמש ב-Ready Queue מסודר.',
      },
      {
        id: 'd',
        text: 'לתת עדיפות רק לתהליכים ארוכים.',
        explanation:
          'לא נכון. RR נותן פרוסות זמן, לא עדיפות קבועה לארוכים.',
      },
    ],
  },
  {
    id: 'mlq-foreground-background',
    categoryId: 'queues',
    topic: 'MLQ',
    prompt: 'מה מאפיין Multilevel Queue Scheduling?',
    correctOptionId: 'd',
    explanation:
      'ב-MLQ יש כמה תורים נפרדים, למשל foreground ו-background. לכל תור יכולה להיות מדיניות אחרת, ולעיתים יש עדיפות בין התורים.',
    examTip:
      'MLQ מפריד תהליכים למחלקות. MLFQ מוסיף יכולת מעבר בין רמות.',
    options: [
      {
        id: 'a',
        text: 'כל התהליכים נמצאים תמיד בתור יחיד.',
        explanation:
          'לא נכון. זה ההפך מרעיון ה-Multilevel Queue.',
      },
      {
        id: 'b',
        text: 'אין הבדל בין foreground לבין background.',
        explanation:
          'לא נכון. ההפרדה ביניהם היא דוגמה קלאסית ל-MLQ.',
      },
      {
        id: 'c',
        text: 'כל תהליך חייב לעבור תור בכל quantum.',
        explanation:
          'לא נכון. מעבר דינמי בין תורים שייך יותר ל-MLFQ.',
      },
      {
        id: 'd',
        text: 'יש כמה תורים נפרדים, לעיתים עם מדיניות ועדיפות שונות.',
        explanation:
          'נכון. זה המבנה המרכזי של MLQ.',
      },
    ],
  },
  {
    id: 'mlfq-promotion-demotion',
    categoryId: 'queues',
    topic: 'MLFQ',
    prompt: 'מה ההבדל המרכזי בין MLQ לבין MLFQ?',
    correctOptionId: 'b',
    explanation:
      'ב-MLFQ תהליך יכול לזוז בין תורים. למשל, אם הוא משתמש הרבה ב-CPU הוא יכול לרדת רמה, ואם הוא מחכה הרבה אפשר להעלות אותו.',
    examTip:
      'האות F ב-MLFQ מזכירה feedback: ההתנהגות של התהליך משפיעה על המיקום שלו.',
    options: [
      {
        id: 'a',
        text: 'MLFQ לא משתמש בתורים בכלל.',
        explanation:
          'לא נכון. הוא משתמש בכמה תורים, כמו MLQ.',
      },
      {
        id: 'b',
        text: 'ב-MLFQ תהליכים יכולים לעבור בין רמות לפי ההתנהגות שלהם.',
        explanation:
          'נכון. זה ה-feedback.',
      },
      {
        id: 'c',
        text: 'MLFQ הוא תמיד nonpreemptive.',
        explanation:
          'לא נכון. בהרבה גרסאות MLFQ יש quantum ו-preemption.',
      },
      {
        id: 'd',
        text: 'MLFQ מתאים רק למערכת עם CPU אחד ללא I/O.',
        explanation:
          'לא נכון. הרעיון כללי יותר מזה.',
      },
    ],
  },
  {
    id: 'pcs-vs-scs',
    categoryId: 'advanced',
    topic: 'Thread scheduling',
    prompt: 'מה ההבדל בין PCS לבין SCS בתזמון Threads?',
    correctOptionId: 'a',
    explanation:
      'PCS הוא תחרות בין Threads של אותו Process ברמת ספריית המשתמש. SCS הוא תחרות בין Threads ברמת מערכת ההפעלה על CPU אמיתי.',
    examTip:
      'PCS = בתוך ה-Process. SCS = מול מערכת ההפעלה.',
    options: [
      {
        id: 'a',
        text: 'PCS מתרחש בתוך Process; SCS מתרחש ברמת מערכת ההפעלה.',
        explanation:
          'נכון. זו ההבחנה החשובה.',
      },
      {
        id: 'b',
        text: 'PCS הוא רק עבור דיסקים, ו-SCS הוא רק עבור זיכרון.',
        explanation:
          'לא נכון. שניהם מושגים של thread scheduling.',
      },
      {
        id: 'c',
        text: 'PCS ו-SCS הם שמות אחרים ל-FCFS ו-SJF.',
        explanation:
          'לא נכון. אלה לא אלגוריתמי CPU scheduling בסיסיים.',
      },
      {
        id: 'd',
        text: 'SCS קורה רק כאשר אין Kernel Threads.',
        explanation:
          'לא נכון. SCS קשור לתחרות ברמת kernel scheduling.',
      },
    ],
  },
  {
    id: 'smp-processor-affinity',
    categoryId: 'advanced',
    topic: 'SMP',
    prompt: 'למה Processor affinity יכולה לעזור במערכת SMP?',
    correctOptionId: 'c',
    explanation:
      'ב-SMP יש כמה מעבדים. אם Process חוזר לרוץ על אותו מעבד, ייתכן שחלק מהמידע שלו עדיין קרוב במטמון, וזה יכול לשפר ביצועים.',
    examTip:
      'Affinity היא העדפה לשמור Process על אותו CPU, לא חובה מוחלטת בכל מצב.',
    options: [
      {
        id: 'a',
        text: 'כי היא מבטלת לגמרי context switches.',
        explanation:
          'לא נכון. context switches עדיין יכולים לקרות.',
      },
      {
        id: 'b',
        text: 'כי היא הופכת SMP למערכת עם CPU אחד.',
        explanation:
          'לא נכון. SMP עדיין כולל כמה מעבדים.',
      },
      {
        id: 'c',
        text: 'כי היא יכולה לשמור קרבה למידע שכבר נמצא במטמון של אותו מעבד.',
        explanation:
          'נכון. זה היתרון האינטואיטיבי של affinity.',
      },
      {
        id: 'd',
        text: 'כי היא מחייבת שכל Process ירוץ תמיד על כל המעבדים יחד.',
        explanation:
          'לא נכון. Process לא חייב לרוץ על כל המעבדים בו זמנית.',
      },
    ],
  },
  {
    id: 'hard-soft-real-time',
    categoryId: 'advanced',
    topic: 'Real-time scheduling',
    prompt: 'מה ההבדל בין hard real-time לבין soft real-time?',
    correctOptionId: 'd',
    explanation:
      'ב-hard real-time החמצת deadline היא כשל ממשי. ב-soft real-time איחור פוגע באיכות, אבל לא בהכרח גורם לכשל מוחלט.',
    examTip:
      'Hard = deadline קשיח. Soft = עדיף בזמן, אבל יש גמישות מסוימת.',
    options: [
      {
        id: 'a',
        text: 'hard real-time תמיד משתמש ב-FCFS.',
        explanation:
          'לא נכון. real-time scheduling הוא נושא אחר ולא מוגבל ל-FCFS.',
      },
      {
        id: 'b',
        text: 'soft real-time אומר שאין deadlines בכלל.',
        explanation:
          'לא נכון. יש חשיבות לזמן, אבל האיחור פחות קטסטרופלי.',
      },
      {
        id: 'c',
        text: 'hard ו-soft real-time הם אותו דבר.',
        explanation:
          'לא נכון. ההבדל הוא חומרת ההחמצה של deadline.',
      },
      {
        id: 'd',
        text: 'ב-hard החמצת deadline היא כשל; ב-soft היא פגיעה באיכות.',
        explanation:
          'נכון. זו ההבחנה המרכזית.',
      },
    ],
  },
  {
    id: 'algorithm-evaluation-methods',
    categoryId: 'advanced',
    topic: 'Algorithm evaluation',
    prompt: 'איזו תשובה מתארת נכון דרכים להערכת אלגוריתמי תזמון?',
    correctOptionId: 'b',
    explanation:
      'Deterministic modeling בודק עומס נתון ומדויק. Queuing models משתמשים במודל הסתברותי. Simulation מריץ תרחישים כדי לראות התנהגות לאורך זמן.',
    examTip:
      'שלוש המילים שצריך לזהות: deterministic modeling, queuing models, simulation.',
    options: [
      {
        id: 'a',
        text: 'Simulation אומרת שמחשבים רק נוסחה אחת בלי להריץ תרחישים.',
        explanation:
          'לא נכון. Simulation מבוססת על הרצת תרחישים או עקבות.',
      },
      {
        id: 'b',
        text: 'Deterministic modeling, queuing models ו-simulation הן דרכי הערכה שונות.',
        explanation:
          'נכון. כל אחת מסתכלת על הבעיה בדרך אחרת.',
      },
      {
        id: 'c',
        text: 'Queuing models מתאימים רק ל-Priority Scheduling.',
        explanation:
          'לא נכון. זה כלי הערכה כללי יותר.',
      },
      {
        id: 'd',
        text: 'Deterministic modeling דורש תמיד workload אקראי.',
        explanation:
          'לא נכון. deterministic modeling עובד על workload נתון וקבוע.',
      },
    ],
  },
];
