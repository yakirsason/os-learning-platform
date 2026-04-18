import type { MlfqLevel } from './mlfqScheduling';
import type { MlqLevel } from './mlqScheduling';
import type { SchedulingProcess } from './schedulingTypes';

/**
 * Algorithm identifiers usable in preset `relevantAlgorithms` metadata.
 * Wider than CoreSchedulingAlgorithm because presets may target queue-based
 * or I/O-aware algorithms that are not in the core set.
 */
export type SchedulingPresetAlgorithm =
  | 'fcfs'
  | 'sjf'
  | 'srtf'
  | 'priority'
  | 'round-robin'
  | 'io-round-robin'
  | 'mlq'
  | 'mlfq';

/**
 * A single curated workload used across the scheduling lecture.
 *
 * Presets are the foundation for:
 * - algorithm-specific demos
 * - comparison views
 * - exam-style walkthroughs
 * - (future) editable workload mode
 *
 * Keep preset data immutable and exam-fidelity accurate. Do not simplify values.
 */
export interface SchedulingPreset {
  /** Stable internal id — safe to reference from simulators, URLs, persisted state. */
  id: string;
  /** Hebrew display title shown to the student. */
  title: string;
  /** One-sentence Hebrew description of what this preset is meant to teach. */
  description: string;
  /** The actual workload. Processes may include multi-phase `phases` (CPU/I/O). */
  processes: SchedulingProcess[];
  /** Which algorithms this preset is pedagogically useful for. */
  relevantAlgorithms: SchedulingPresetAlgorithm[];
  /** Optional: the Round Robin quantum this preset expects. */
  roundRobinQuantum?: number;
  /** Optional: MLFQ queue definitions (ordered top → bottom). */
  mlfqLevels?: MlfqLevel[];
  /** Optional: MLQ queue definitions (ordered by priority, highest first). */
  mlqLevels?: MlqLevel[];
  /**
   * For MLFQ: whether a higher-priority queue arrival preempts a running process.
   * Some exam presets explicitly call for non-preemptive MLFQ.
   */
  mlfqPreemptive?: boolean;
  /** Short origin note — e.g., "שאלת מבחן". Not displayed prominently. */
  source?: string;
  /** Free-form pedagogical notes for future UI surfaces. */
  notes?: string[];
}

/**
 * Preset 1 — השוואת זמני המתנה (5 תהליכים).
 *
 * Used to compare multiple algorithms on a single dataset.
 * Designed to make different policies produce visibly different
 * waiting-time / turnaround / response numbers.
 */
export const COMPARISON_WAITING_TIME_5P: SchedulingPreset = {
  id: 'comparison_waiting_time_5p',
  title: 'השוואת זמני המתנה — 5 תהליכים',
  description:
    'מערך חמישה תהליכים עם פאזות CPU ו-I/O. נועד להשוות Waiting, Turnaround ו-Response בין מספר אלגוריתמים על אותם נתונים.',
  processes: [
    {
      id: 'A',
      arrivalTime: 1,
      burstTime: 5,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 4 },
        { type: 'io', duration: 2 },
        { type: 'cpu', duration: 1 },
      ],
    },
    {
      id: 'B',
      arrivalTime: 0,
      burstTime: 13,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 12 },
        { type: 'io', duration: 1 },
        { type: 'cpu', duration: 1 },
      ],
    },
    { id: 'C', arrivalTime: 2, burstTime: 3, priority: 1 },
    { id: 'D', arrivalTime: 3, burstTime: 1, priority: 1 },
    { id: 'E', arrivalTime: 8, burstTime: 2, priority: 1 },
  ],
  relevantAlgorithms: ['sjf', 'srtf', 'round-robin', 'mlfq'],
  source: 'שאלת מבחן — השוואת אלגוריתמים',
  notes: [
    'כל אלגוריתם יפיק ציר זמן שונה על אותו עומס בדיוק.',
    'Process B הוא CPU-heavy, מה שמחדד את ההבדל בין SJF/SRTF ל-Round Robin.',
    'רק A ו-B כוללים I/O — שאר התהליכים הם CPU בלבד.',
  ],
};

/**
 * Preset 2 — Round Robin + I/O (3 תהליכים), quantum = 5.
 *
 * Focused on quantum expiration, I/O blocking, I/O return, and re-entry
 * into the Ready Queue. Useful for teaching waiting-time reasoning when
 * I/O is interleaved with CPU bursts.
 */
export const RR_IO_WAITING_TIME_3P: SchedulingPreset = {
  id: 'rr_io_waiting_time_3p',
  title: 'Round Robin עם I/O — 3 תהליכים',
  description:
    'עומס עם שלוש ריצות CPU + I/O ארוכים. ממחיש quantum expiration, חסימה ל-I/O, חזרה מ-I/O והכנסה מחדש ל-Ready Queue.',
  processes: [
    {
      id: 'A',
      arrivalTime: 0,
      burstTime: 7,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 6 },
        { type: 'io', duration: 10 },
        { type: 'cpu', duration: 1 },
      ],
    },
    {
      id: 'B',
      arrivalTime: 1,
      burstTime: 9,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 7 },
        { type: 'io', duration: 4 },
        { type: 'cpu', duration: 2 },
      ],
    },
    {
      id: 'C',
      arrivalTime: 2,
      burstTime: 8,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 2 },
        { type: 'io', duration: 8 },
        { type: 'cpu', duration: 6 },
      ],
    },
  ],
  relevantAlgorithms: ['round-robin', 'io-round-robin'],
  roundRobinQuantum: 5,
  source: 'שאלת מבחן — RR + I/O',
  notes: [
    'I/O של A הוא הארוך ביותר (10) — מחדד איך תהליך יכול לחזור ל-Ready מאוחר מאוד.',
    'Process C עושה CPU קצר לפני I/O ארוך — מראה איך quantum של 5 מספיק לו לסיים את ה-CPU הראשון.',
    'Waiting Time לא כולל את זמן ה-I/O — נקודה חשובה להסברה.',
  ],
};

/**
 * Preset 3 — MLFQ + I/O (4 תהליכים), Q1=1, Q2=2, Q3=4, non-preemptive.
 *
 * Exam question about completion-order reasoning in MLFQ.
 * The quanta are deliberately small so demotions happen quickly and are
 * visible. The non-preemptive flag matches the exam's wording.
 */
export const MLFQ_IO_COMPLETION_ORDER_4P: SchedulingPreset = {
  id: 'mlfq_io_completion_order_4p',
  title: 'MLFQ עם I/O — סדר סיום (4 תהליכים)',
  description:
    'ארבעה תהליכים עם phases CPU/I/O על MLFQ תלת-שכבתי. שאלת המבחן: מי מסיים ראשון ומי מסיים אחרון — וכיצד ההורדות בין התורים קובעות זאת.',
  processes: [
    {
      id: 'A',
      arrivalTime: 0,
      burstTime: 6,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 4 },
        { type: 'io', duration: 1 },
        { type: 'cpu', duration: 2 },
      ],
    },
    {
      id: 'B',
      arrivalTime: 1,
      burstTime: 5,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 2 },
        { type: 'io', duration: 2 },
        { type: 'cpu', duration: 3 },
      ],
    },
    {
      id: 'C',
      arrivalTime: 1,
      burstTime: 4,
      priority: 1,
      phases: [
        { type: 'cpu', duration: 3 },
        { type: 'io', duration: 2 },
        { type: 'cpu', duration: 1 },
      ],
    },
    { id: 'D', arrivalTime: 3, burstTime: 3, priority: 1 },
  ],
  relevantAlgorithms: ['mlfq'],
  mlfqLevels: [
    { id: 'q1', title: 'Q1 (עליון)', quantum: 1 },
    { id: 'q2', title: 'Q2 (אמצעי)', quantum: 2 },
    { id: 'q3', title: 'Q3 (תחתון)', quantum: 4 },
  ],
  mlfqPreemptive: false,
  source: 'שאלת מבחן — MLFQ + I/O',
  notes: [
    'ה-quanta קטנים במיוחד כדי שהורדות יקרו מהר וייראו היטב בציר הזמן.',
    'מוגדר non-preemptive: תור גבוה לא עוצר תהליך שכבר רץ בתור נמוך.',
    'השאלה הקלאסית כאן: מי מסיים אחרון? תשובה דורשת מעקב אחרי תנועת התורים וחזרות מ-I/O.',
  ],
};

/** Ordered list of all curated presets. Future presets append here. */
export const ALL_SCHEDULING_PRESETS: SchedulingPreset[] = [
  COMPARISON_WAITING_TIME_5P,
  RR_IO_WAITING_TIME_3P,
  MLFQ_IO_COMPLETION_ORDER_4P,
];

/**
 * Map from preset id → preset. Use this for stable id-based lookup from
 * simulators, routes, or persisted user selections.
 */
export const SCHEDULING_PRESETS_BY_ID: Record<string, SchedulingPreset> =
  Object.fromEntries(ALL_SCHEDULING_PRESETS.map((p) => [p.id, p]));

/**
 * Filter presets that are pedagogically relevant for a given algorithm.
 * Lets a future simulator surface only the presets that make sense for it.
 */
export function getPresetsForAlgorithm(
  algorithm: SchedulingPresetAlgorithm
): SchedulingPreset[] {
  return ALL_SCHEDULING_PRESETS.filter((preset) =>
    preset.relevantAlgorithms.includes(algorithm)
  );
}
