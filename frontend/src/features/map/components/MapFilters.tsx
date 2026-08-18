import { RotateCcw, Search } from 'lucide-react';
import type {
  DefectSeverity,
  DefectStatus,
  DefectType,
  MapFilterValues,
} from '../types';

interface MapFiltersProps {
  filters: MapFilterValues;
  resultCount: number;
  totalCount: number;
  onChange: (filters: MapFilterValues) => void;
  onReset: () => void;
}

const CONFIDENCE_OPTIONS = [
  { value: 0, label: 'Любая' },
  { value: 70, label: '≥ 70%' },
  { value: 85, label: '≥ 85%' },
  { value: 95, label: '≥ 95%' },
] as const;

const TYPE_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  { value: 'pothole', label: 'Яма' },
  { value: 'crack', label: 'Трещина' },
  { value: 'net', label: 'Сетка трещин' },
  { value: 'road_collapse', label: 'Провал покрытия' },
  { value: 'damaged_manhole', label: 'Просадка люка' },
  { value: 'other', label: 'Другой дефект' },
] as const;

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'Любая критичность' },
  { value: 'low', label: 'Низкая' },
  { value: 'medium', label: 'Средняя' },
  { value: 'high', label: 'Высокая' },
  { value: 'critical', label: 'Критическая' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'Все статусы' },
  { value: 'submitted', label: 'Ожидает анализа' },
  { value: 'detected', label: 'Обнаружено' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'fixed', label: 'Устранено' },
  { value: 'verified', label: 'Проверено' },
  { value: 'rejected', label: 'Отклонено' },
] as const;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-eyebrow">{label}</div>
      {children}
    </div>
  );
}

export function MapFilters({
  filters,
  onChange,
  onReset,
}: MapFiltersProps) {
  return (
    <section className="panel p-4 md:p-5">
      <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_auto]">
        <Field label="Поиск">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              id="map-search-filter"
              type="search"
              value={filters.query}
              onChange={(event) => onChange({ ...filters, query: event.target.value })}
              placeholder="ID или адрес"
              className="h-9 w-full rounded-lg border border-border bg-surface/60 pl-9 pr-3 text-[12.5px] text-foreground outline-none transition focus-visible:border-ring"
            />
          </div>
        </Field>

        <Field label="Тип">
          <select
            id="map-type-filter"
            value={filters.type}
            onChange={(event) => onChange({ ...filters, type: event.target.value as DefectType | 'all' })}
            className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground outline-none transition focus-visible:border-ring"
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Уверенность">
          <select
            id="map-confidence-filter"
            value={filters.minConfidence}
            onChange={(event) => onChange({ ...filters, minConfidence: Number(event.target.value) })}
            className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground outline-none transition focus-visible:border-ring"
          >
            {CONFIDENCE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Критичность">
          <select
            id="map-severity-filter"
            value={filters.severity}
            onChange={(event) => onChange({ ...filters, severity: event.target.value as DefectSeverity | 'all' })}
            className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground outline-none transition focus-visible:border-ring"
          >
            {SEVERITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Статус">
          <select
            id="map-status-filter"
            value={filters.status}
            onChange={(event) => onChange({ ...filters, status: event.target.value as DefectStatus | 'all' })}
            className="h-9 w-full rounded-lg border border-border bg-surface/60 px-3 text-[12.5px] text-foreground outline-none transition focus-visible:border-ring"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </Field>

        <button
          type="button"
          onClick={onReset}
          className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface"
        >
          <RotateCcw className="size-3.5 text-muted-foreground" /> Сброс
        </button>
      </div>
    </section>
  );
}
