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

const CONFIDENCE_OPTIONS = [0, 70, 80, 90] as const;

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'Все типы' },
  { value: 'crack', label: 'Трещины' },
  { value: 'pothole', label: 'Ямы' },
  { value: 'net', label: 'Сетка трещин' },
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
  { value: 'detected', label: 'Обнаружено' },
  { value: 'in_progress', label: 'В работе' },
  { value: 'fixed', label: 'Исправлено' },
  { value: 'rejected', label: 'Отклонено' },
] as const;

function FilterSelect({ id, label, value, options, onChange }: FilterSelectProps) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1.5" htmlFor={id}>
      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function MapFilters({
  filters,
  resultCount,
  totalCount,
  onChange,
  onReset,
}: MapFiltersProps) {
  const activeFilterCount = [
    filters.type !== 'all',
    filters.severity !== 'all',
    filters.status !== 'all',
    filters.query.trim() !== '',
    filters.minConfidence > 0,
  ].filter(Boolean).length;

  return (
    <div className="map-filter-panel absolute left-3 right-3 top-3 z-[500] rounded-xl border p-3 shadow-xl backdrop-blur sm:left-4 sm:right-auto sm:w-[min(760px,calc(100%-2rem))]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)_auto] lg:items-end">
        <label className="flex min-w-0 flex-col gap-1.5" htmlFor="map-search-filter">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Поиск</span>
          <input
            id="map-search-filter"
            type="search"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="ID или адрес"
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
          />
        </label>
        <FilterSelect
          id="map-type-filter"
          label="Тип"
          value={filters.type}
          options={TYPE_OPTIONS}
          onChange={(type) => onChange({ ...filters, type: type as DefectType | 'all' })}
        />
        <label className="flex min-w-0 flex-col gap-1.5" htmlFor="map-confidence-filter">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Уверенность</span>
          <select
            id="map-confidence-filter"
            value={filters.minConfidence}
            onChange={(event) => onChange({ ...filters, minConfidence: Number(event.target.value) })}
            className="h-9 min-w-0 rounded-md border border-input bg-background px-2.5 text-sm text-foreground outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/20"
          >
            {CONFIDENCE_OPTIONS.map((value) => (
              <option key={value} value={value}>{value === 0 ? 'Любая' : `от ${value}%`}</option>
            ))}
          </select>
        </label>
        <FilterSelect
          id="map-severity-filter"
          label="Критичность"
          value={filters.severity}
          options={SEVERITY_OPTIONS}
          onChange={(severity) =>
            onChange({ ...filters, severity: severity as DefectSeverity | 'all' })
          }
        />
        <FilterSelect
          id="map-status-filter"
          label="Статус"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(status) =>
            onChange({ ...filters, status: status as DefectStatus | 'all' })
          }
        />
        <div className="flex shrink-0 items-center justify-between gap-2 sm:pb-1">
          <p className="text-xs font-medium text-muted-foreground" aria-live="polite">
            {resultCount} из {totalCount}
          </p>
          <button
            type="button"
            onClick={onReset}
            disabled={activeFilterCount === 0}
            className="map-reset-button h-8 rounded-md px-2.5 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={`Reset ${activeFilterCount} active filters`}
          >
            Сброс{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
