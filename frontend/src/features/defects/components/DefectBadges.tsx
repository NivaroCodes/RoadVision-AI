import { cn } from '@/lib/utils';
import type { DefectSeverity, DefectStatus } from '@/features/map/types';
import { defectSeverityLabels, defectStatusLabels } from '../labels';
import { severityClasses, statusChip } from '@/lib/roadvision-data';

export function SeverityBadge({ severity }: { severity: DefectSeverity | null }) {
  if (!severity) {
    return (
      <span className="inline-block rounded-md bg-surface px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
        Ожидает анализа
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold",
        severityClasses[severity]?.chip ?? "bg-surface text-foreground"
      )}
    >
      {defectSeverityLabels[severity] ?? severity}
    </span>
  );
}

export function StatusBadge({ status }: { status: DefectStatus }) {
  return (
    <span
      className={cn(
        "inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold",
        statusChip[status] ?? "bg-surface text-foreground"
      )}
    >
      {defectStatusLabels[status] ?? status}
    </span>
  );
}
