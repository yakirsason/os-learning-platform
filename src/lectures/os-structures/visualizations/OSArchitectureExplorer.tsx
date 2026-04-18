import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import StepController from '@/components/common/StepController';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

// חמישה מבני OS עם דיאגרמה ואנימציה של מעבר בקשה דרך המערכת.

type ArchId = 'simple' | 'monolithic' | 'layered' | 'microkernel' | 'modular';

interface ArchInfo {
  name: string;
  subtitle: string;
  description: string;
  pros: string[];
  cons: string[];
  examples: string[];
}

const ARCHITECTURES: Record<ArchId, ArchInfo> = {
  simple: {
    name: 'Simple',
    subtitle: 'MS-DOS',
    description:
      'מערכת פשוטה שבה כל הרכיבים רצים באותה רמה ללא הפרדה ברורה. אפליקציה יכולה לגשת ישירות לחומרה ול-BIOS.',
    pros: ['פשוטה מאוד לממש', 'יעילה - אין overhead של שכבות'],
    cons: ['אין הפרדה → באג באפליקציה מקריס את הכול', 'לא אמינה, לא מאובטחת'],
    examples: ['MS-DOS', 'CP/M'],
  },
  monolithic: {
    name: 'Monolithic',
    subtitle: 'UNIX Traditional',
    description:
      'גרעין גדול אחד שמכיל את כל שירותי המערכת - scheduler, file system, drivers, networking. אפליקציות מתקשרות איתו דרך System Call Interface.',
    pros: ['יעיל מאוד - אין overhead פנימי', 'כל הגרעין חולק זיכרון'],
    cons: ['קשה לתחזוקה', 'באג בגרעין מקריס את כל המערכת'],
    examples: ['UNIX המסורתי', 'Linux (באופן חלקי)'],
  },
  layered: {
    name: 'Layered',
    subtitle: 'THE System',
    description:
      'הגרעין מחולק לשכבות. שכבה 0 = חומרה, שכבה N = ממשק משתמש. כל שכבה משתמשת רק בשירותים של השכבות הנמוכות יותר.',
    pros: ['מודולרי ונוח לדיבוג', 'הפרדה ברורה של אחריות'],
    cons: ['ביצועים פחותים - בקשה חוצה שכבות', 'קשה לקבוע גבולות'],
    examples: ['THE System (1968)', 'OS/2 (חלקים)'],
  },
  microkernel: {
    name: 'Microkernel',
    subtitle: 'Mach',
    description:
      'גרעין מצומצם שמספק רק IPC, ניהול זיכרון בסיסי ותזמון. שירותים אחרים (file system, drivers) רצים ב-user space ומתקשרים בהודעות.',
    pros: ['גרעין קטן ויציב', 'שירות שקורס לא מקריס את המערכת'],
    cons: ['message passing איטי יחסית לקריאת פונקציה', 'ביצועים פחותים'],
    examples: ['Mach', 'QNX', 'L4', 'חלקים של macOS'],
  },
  modular: {
    name: 'Modular',
    subtitle: 'Linux / Solaris',
    description:
      'גרעין בסיסי שטוען מודולים דינמית כשצריך. כל מודול (driver, file system) הוא קובץ נפרד שנטען לזיכרון הגרעין בזמן ריצה.',
    pros: ['גמישות - אין צורך להדר מחדש את הגרעין', 'ביצועים טובים'],
    cons: ['המודולים רצים ב-kernel mode - באג מקריס את המערכת'],
    examples: ['Linux LKM', 'Solaris', 'macOS (kexts)'],
  },
};

const TOTAL_STEPS = 4;

const STEP_CAPTIONS: Record<ArchId, string[]> = {
  simple: [
    'האפליקציה מתחילה את הבקשה - שולחת קריאה ישירה למערכת.',
    'הבקשה מגיעה ל-Resident System Program שמנתב אותה.',
    'ה-Device Drivers פועלים ישירות על החומרה - אין הפרדה אמיתית.',
    'המידע חוזר באותו נתיב במעלה הערימה.',
  ],
  monolithic: [
    'האפליקציה קוראת לפונקציה בספרייה ב-User Space.',
    'הבקשה חוצה את System Call Interface - נקודת הכניסה היחידה ל-Kernel.',
    'הגרעין הענקי מטפל בבקשה - File System, Scheduler או שירות אחר.',
    'התוצאה חוזרת דרך אותו System Call Interface.',
  ],
  layered: [
    'המשתמש מבצע פעולה בשכבה החיצונית (Layer N - User Interface).',
    'הבקשה יורדת שכבה אחר שכבה - כל שכבה משתמשת רק בנמוכות יותר.',
    'בסופו של דבר הגענו ל-Layer 0 - חומרה.',
    'התשובה עולה בחזרה דרך כל השכבות.',
  ],
  microkernel: [
    'האפליקציה שולחת הודעה (message) דרך ה-Microkernel.',
    'ה-Microkernel מקבל את ההודעה ומנתב אותה לשירות המתאים.',
    'השירות (File System Server) ב-user space מעבד ושולח הודעת תשובה.',
    'ה-Microkernel מעביר את התשובה בחזרה לאפליקציה.',
  ],
  modular: [
    'האפליקציה מבצעת System Call אל הגרעין המרכזי.',
    'הגרעין מזהה אילו מודולים נדרשים (למשל ext4 + NVMe driver).',
    'המודול הרלוונטי פועל - טעון דינמית, רץ בתוך הגרעין.',
    'התוצאה חוזרת דרך הגרעין חזרה לאפליקציה.',
  ],
};

export default function OSArchitectureExplorer() {
  const [activeArch, setActiveArch] = useState<ArchId>('simple');
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const info = ARCHITECTURES[activeArch];
  const currentCaption = STEP_CAPTIONS[activeArch][step] ?? '';

  const handleNext = useCallback(() => {
    setStep((s) => {
      if (s < TOTAL_STEPS - 1) return s + 1;
      setIsPlaying(false);
      return s;
    });
  }, []);

  const handlePrevious = useCallback(() => {
    setStep((s) => (s > 0 ? s - 1 : s));
  }, []);

  const handleReset = useCallback(() => {
    setStep(0);
    setIsPlaying(false);
  }, []);

  const handlePlayPause = useCallback(() => {
    setIsPlaying((p) => !p);
  }, []);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setTimeout(handleNext, 1600);
    return () => clearTimeout(timer);
  }, [isPlaying, step, handleNext]);

  const changeArch = (a: ArchId) => {
    setActiveArch(a);
    setStep(0);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeArch} onValueChange={(v) => changeArch(v as ArchId)}>
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-5">
          <TabsTrigger value="simple">Simple</TabsTrigger>
          <TabsTrigger value="monolithic">Monolithic</TabsTrigger>
          <TabsTrigger value="layered">Layered</TabsTrigger>
          <TabsTrigger value="microkernel">Microkernel</TabsTrigger>
          <TabsTrigger value="modular">Modular</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-[1fr_260px]">
        {/* Architecture diagram - LTR because the flow is conceptually hierarchical */}
        <div
          dir="ltr"
          className="rounded-lg border bg-white p-4 dark:bg-slate-900/60"
        >
          {activeArch === 'simple' ? <SimpleArch step={step} /> : null}
          {activeArch === 'monolithic' ? <MonolithicArch step={step} /> : null}
          {activeArch === 'layered' ? <LayeredArch step={step} /> : null}
          {activeArch === 'microkernel' ? <MicrokernelArch step={step} /> : null}
          {activeArch === 'modular' ? <ModularArch step={step} /> : null}
        </div>

        {/* Info panel */}
        <div className="rounded-lg border bg-card p-4" dir="rtl">
          <h3 className="text-base font-bold">{info.name}</h3>
          <p
            className="mb-3 font-mono text-xs text-muted-foreground"
            dir="ltr"
          >
            {info.subtitle}
          </p>
          <p className="mb-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            {info.description}
          </p>
          <InfoList
            title="יתרונות"
            titleClass="text-emerald-700 dark:text-emerald-400"
            items={info.pros}
          />
          <InfoList
            title="חסרונות"
            titleClass="text-red-700 dark:text-red-400"
            items={info.cons}
          />
          <InfoList
            title="דוגמאות"
            titleClass="text-slate-600 dark:text-slate-400"
            items={info.examples}
            ltr
          />
        </div>
      </div>

      <div className="rounded-md bg-muted p-4 text-sm leading-relaxed" dir="rtl">
        <div className="mb-1 text-xs font-semibold text-muted-foreground">
          שלב {step + 1} מתוך {TOTAL_STEPS} — {info.name}
        </div>
        {currentCaption}
      </div>

      <StepController
        onReset={handleReset}
        onPrevious={handlePrevious}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        isPlaying={isPlaying}
        canGoBack={step > 0}
        canGoForward={step < TOTAL_STEPS - 1}
      />
    </div>
  );
}

// ---------- Helper UI ----------

function InfoList({
  title,
  titleClass,
  items,
  ltr = false,
}: {
  title: string;
  titleClass: string;
  items: string[];
  ltr?: boolean;
}) {
  return (
    <div className="mb-2">
      <h4 className={`text-xs font-semibold ${titleClass}`}>{title}</h4>
      <ul className="list-disc space-y-0.5 pe-4 text-xs text-slate-700 dark:text-slate-300">
        {items.map((item) => (
          <li key={item} dir={ltr ? 'ltr' : undefined}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Box({
  label,
  highlighted,
  color,
  sublabel,
}: {
  label: string;
  highlighted: boolean;
  color: string;
  sublabel?: string;
}) {
  return (
    <motion.div
      animate={{
        scale: highlighted ? 1.03 : 1,
        boxShadow: highlighted
          ? '0 0 0 3px rgba(239, 68, 68, 0.55)'
          : '0 0 0 0 rgba(0,0,0,0)',
      }}
      transition={{ duration: 0.3 }}
      className="rounded-md border-2 p-2 text-center text-xs font-medium"
      style={{ borderColor: color, backgroundColor: `${color}15` }}
    >
      {label}
      {sublabel ? (
        <div className="text-[10px] font-normal text-muted-foreground">
          {sublabel}
        </div>
      ) : null}
    </motion.div>
  );
}

function Arrow() {
  return (
    <div className="flex justify-center">
      <svg width="16" height="20" viewBox="0 0 16 20" aria-hidden>
        <path
          d="M8 2 L8 16 M3 12 L8 17 L13 12"
          stroke="#94a3b8"
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

// ---------- Simple (MS-DOS) ----------
function SimpleArch({ step }: { step: number }) {
  const highlight = [
    step === 0 || step === 3,
    step === 1 || step === 3,
    step === 2 || step === 3,
    step === 2 || step === 3,
  ];
  return (
    <div className="mx-auto flex max-w-md flex-col gap-2 py-4">
      <Box label="Application Program" highlighted={highlight[0]} color="#3b82f6" />
      <Arrow />
      <Box label="Resident System Program" highlighted={highlight[1]} color="#8b5cf6" />
      <Arrow />
      <Box label="MS-DOS Device Drivers" highlighted={highlight[2]} color="#ec4899" />
      <Arrow />
      <Box label="ROM BIOS Device Drivers" highlighted={highlight[3]} color="#64748b" />
    </div>
  );
}

// ---------- Monolithic ----------
function MonolithicArch({ step }: { step: number }) {
  const userActive = step === 0 || step === 3;
  const syscallActive = step === 1 || step === 3;
  const kernelActive = step === 2;
  return (
    <div className="mx-auto flex max-w-md flex-col gap-2 py-4">
      <Box label="Users / Applications" highlighted={userActive} color="#3b82f6" />
      <Arrow />
      <Box
        label="Shells / Compilers / Libraries"
        highlighted={false}
        color="#6366f1"
      />
      <Arrow />
      <Box
        label="System-Call Interface"
        highlighted={syscallActive}
        color="#8b5cf6"
      />
      <Arrow />
      <motion.div
        animate={{
          scale: kernelActive ? 1.03 : 1,
          boxShadow: kernelActive
            ? '0 0 0 3px rgba(239, 68, 68, 0.55)'
            : '0 0 0 0',
        }}
        transition={{ duration: 0.3 }}
        className="rounded-md border-2 border-amber-500 bg-amber-50 p-3 text-center dark:bg-amber-950/30"
      >
        <div className="mb-1 text-xs font-bold">Kernel (Monolithic)</div>
        <div className="grid grid-cols-3 gap-1 text-[10px]">
          <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
            Signals
          </span>
          <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
            File System
          </span>
          <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
            Scheduler
          </span>
          <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
            I/O
          </span>
          <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
            Memory
          </span>
          <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
            Network
          </span>
        </div>
      </motion.div>
      <Arrow />
      <Box label="Hardware" highlighted={false} color="#64748b" />
    </div>
  );
}

// ---------- Layered (concentric rings) ----------
function LayeredArch({ step }: { step: number }) {
  const LAYERS = [
    { r: 110, label: 'User Interface (Layer N)' },
    { r: 85, label: 'System Programs' },
    { r: 60, label: 'Memory & I/O' },
    { r: 40, label: 'CPU Scheduling' },
    { r: 22, label: 'Hardware (0)' },
  ];
  const COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'];
  // step 0 → outer, step 1 → middle, step 2 → inner, step 3 → outer again
  const highlightLayer = step === 0 ? 0 : step === 1 ? 2 : step === 2 ? 4 : 0;
  return (
    <div className="flex flex-col items-center py-2">
      <svg viewBox="0 0 240 240" className="h-64 w-64">
        {LAYERS.map((layer, i) => {
          const isActive = i === highlightLayer;
          return (
            <motion.circle
              key={layer.label}
              cx={120}
              cy={120}
              r={layer.r}
              fill={COLORS[i]}
              fillOpacity={isActive ? 0.3 : 0.12}
              stroke={COLORS[i]}
              initial={false}
              animate={{
                strokeWidth: isActive ? 4 : 1.5,
              }}
              transition={{ duration: 0.3 }}
            />
          );
        })}
        {LAYERS.map((layer, i) => (
          <text
            key={`t-${layer.label}`}
            x={120}
            y={120 - layer.r + 13}
            textAnchor="middle"
            fontSize={9}
            className="fill-slate-700 dark:fill-slate-100"
            fontWeight={i === highlightLayer ? 700 : 400}
          >
            {layer.label}
          </text>
        ))}
      </svg>
      <div className="mt-2 text-xs text-muted-foreground">
        Layer 0 (Hardware) במרכז, Layer N (User) בחוץ
      </div>
    </div>
  );
}

// ---------- Microkernel ----------
function MicrokernelArch({ step }: { step: number }) {
  const appActive = step === 0 || step === 3;
  const fsActive = step === 2;
  const kernelActive = step === 1 || step === 3 || step === 2;
  return (
    <div className="flex flex-col gap-3 py-4">
      <div className="rounded-md border-2 border-dashed border-blue-300 bg-blue-50/50 p-3 dark:border-blue-900 dark:bg-blue-950/20">
        <div className="mb-2 text-center text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
          User Space
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Box label="Application" highlighted={appActive} color="#3b82f6" />
          <Box
            label="File System"
            highlighted={fsActive}
            color="#0ea5e9"
            sublabel="user-space server"
          />
          <Box
            label="Device Driver"
            highlighted={false}
            color="#14b8a6"
            sublabel="user-space server"
          />
        </div>
      </div>

      <motion.div
        animate={{ opacity: kernelActive ? 1 : 0.45 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-center text-xs text-slate-500 dark:text-slate-400"
      >
        ↕ messages (IPC)
      </motion.div>

      <div className="rounded-md border-2 border-dashed border-amber-300 bg-amber-50/50 p-3 dark:border-amber-900 dark:bg-amber-950/20">
        <div className="mb-2 text-center text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
          Kernel Space
        </div>
        <motion.div
          animate={{
            scale: kernelActive ? 1.03 : 1,
            boxShadow: kernelActive
              ? '0 0 0 3px rgba(239, 68, 68, 0.55)'
              : '0 0 0 0',
          }}
          transition={{ duration: 0.3 }}
          className="mx-auto max-w-xs rounded-md border-2 border-amber-500 bg-amber-100/70 p-3 text-center dark:bg-amber-950/40"
        >
          <div className="mb-1 text-xs font-bold">Microkernel</div>
          <div className="grid grid-cols-3 gap-1 text-[10px]">
            <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
              IPC
            </span>
            <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
              Memory
            </span>
            <span className="rounded bg-white px-1 py-0.5 dark:bg-slate-800">
              Scheduling
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ---------- Modular ----------
function ModularArch({ step }: { step: number }) {
  const MODULES = [
    'File Systems',
    'Device Drivers',
    'Scheduling Classes',
    'STREAMS',
    'Executable Formats',
    'Loadable Syscalls',
  ];
  const appActive = step === 0 || step === 3;
  const coreActive = step === 1 || step === 3;
  const activeModuleIdx = step === 2 ? 0 : -1;
  return (
    <div className="py-3">
      <div className="mx-auto mb-2 max-w-[220px]">
        <Box label="Application" highlighted={appActive} color="#3b82f6" />
      </div>
      <div className="mb-2 text-center text-xs text-slate-500">↓ System Call</div>

      <div className="mx-auto mb-3 max-w-xs">
        <motion.div
          animate={{
            scale: coreActive ? 1.03 : 1,
            boxShadow: coreActive
              ? '0 0 0 3px rgba(239, 68, 68, 0.55)'
              : '0 0 0 0',
          }}
          transition={{ duration: 0.3 }}
          className="rounded-lg border-2 border-amber-500 bg-amber-100/70 p-3 text-center dark:bg-amber-950/40"
        >
          <div className="text-sm font-bold">Core Kernel</div>
          <div className="text-[10px] text-muted-foreground">
            + module loader
          </div>
        </motion.div>
      </div>

      <div className="mb-2 text-center text-xs text-slate-500">
        ↓ dispatches to loaded module
      </div>

      <div className="grid grid-cols-3 gap-2">
        {MODULES.map((m, i) => (
          <Box
            key={m}
            label={m}
            highlighted={i === activeModuleIdx}
            color="#0ea5e9"
          />
        ))}
      </div>
    </div>
  );
}
