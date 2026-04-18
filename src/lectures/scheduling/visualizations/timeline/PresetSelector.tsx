import type { SchedulingPreset } from '../../lib/schedulingPresets';

interface PresetSelectorProps {
  presets: SchedulingPreset[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  defaultLabel?: string;
  heading?: string;
  note?: string | null;
}

export default function PresetSelector({
  presets,
  selectedId,
  onSelect,
  defaultLabel = 'ברירת מחדל (דמו)',
  heading = 'בחר שאלת מבחן',
  note = null,
}: PresetSelectorProps) {
  const selected = selectedId
    ? presets.find((p) => p.id === selectedId) ?? null
    : null;

  if (presets.length === 0) return null;

  return (
    <section
      className="rounded-xl border bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      dir="rtl"
    >
      <div className="flex flex-wrap items-center gap-3">
        <label
          htmlFor="scheduling-preset-select"
          className="text-xs font-bold text-slate-700 dark:text-slate-200"
        >
          {heading}
        </label>
        <select
          id="scheduling-preset-select"
          value={selectedId ?? ''}
          onChange={(e) => onSelect(e.target.value ? e.target.value : null)}
          className="min-w-[14rem] rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <option value="">{defaultLabel}</option>
          {presets.map((preset) => (
            <option key={preset.id} value={preset.id}>
              {preset.title}
            </option>
          ))}
        </select>
        {selected?.source ? (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {selected.source}
          </span>
        ) : null}
      </div>

      {selected ? (
        <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
          {selected.description}
        </p>
      ) : null}

      {note ? (
        <p className="m-0 mt-2 rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-relaxed text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
          {note}
        </p>
      ) : null}
    </section>
  );
}
