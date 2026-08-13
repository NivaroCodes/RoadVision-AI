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
}

interface FilterSelectProps {
  id: string;
  label: string;
  value: string;
  options: readonly { value: string; label: string }[];
  onChange: (value: string) => void;
}

const TYPE_OPTIONS = [
  { value: 'all', label: 'All types' },
  { value: 'crack', label: 'Crack' },
  { value: 'pothole', label: 'Pothole' },
  { value: 'net', label: 'Net cracking' },
] as const;

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All severities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
] as const;

const STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'detected', label: 'Detected' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'fixed', label: 'Fixed' },
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
}: MapFiltersProps) {
  return (
    <div className="absolute left-3 right-3 top-3 z-[500] rounded-xl border border-border/80 bg-card/95 p-3 shadow-xl backdrop-blur sm:left-4 sm:right-auto sm:w-[min(680px,calc(100%-2rem))]">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <FilterSelect
          id="map-type-filter"
          label="Type"
          value={filters.type}
          options={TYPE_OPTIONS}
          onChange={(type) => onChange({ ...filters, type: type as DefectType | 'all' })}
        />
        <FilterSelect
          id="map-severity-filter"
          label="Severity"
          value={filters.severity}
          options={SEVERITY_OPTIONS}
          onChange={(severity) =>
            onChange({ ...filters, severity: severity as DefectSeverity | 'all' })
          }
        />
        <FilterSelect
          id="map-status-filter"
          label="Status"
          value={filters.status}
          options={STATUS_OPTIONS}
          onChange={(status) =>
            onChange({ ...filters, status: status as DefectStatus | 'all' })
          }
        />
        <p className="shrink-0 pb-2 text-xs font-medium text-muted-foreground" aria-live="polite">
          {resultCount} of {totalCount}
        </p>
      </div>
    </div>
  );
}
