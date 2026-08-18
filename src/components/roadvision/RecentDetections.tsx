import { ArrowUpRight } from "lucide-react";
import {
  recentDetections,
  severityClasses,
  severityLabel,
  type Severity,
} from "@/lib/roadvision-data";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./DashboardShell";

export function RecentDetections({
  activeFilters,
  onSelect,
}: {
  activeFilters: Severity[];
  onSelect: (id: string) => void;
}) {
  const rows = recentDetections.filter((r) => activeFilters.includes(r.severity));

  return (
    <section className="panel flex flex-col overflow-hidden">
      <PanelHeader
        title="Последние дефекты"
        meta={`Показано ${rows.length} из ${recentDetections.length}`}
        action={
          <button className="flex items-center gap-1 text-[11.5px] font-medium text-primary hover:underline">
            Все дефекты <ArrowUpRight className="size-3" />
          </button>
        }
      />
      <ul className="min-h-0 flex-1 divide-y divide-border overflow-y-auto">
        {rows.map((r) => (
          <li key={r.id}>
            <button
              onClick={() => onSelect(r.id)}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/60 md:px-5"
            >
              <span
                className={cn(
                  "mt-0.5 h-8 w-[3px] shrink-0 rounded-full",
                  severityClasses[r.severity].bg,
                )}
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="truncate text-[12.5px] font-medium text-foreground">
                    {r.type}
                  </span>
                  <span
                    className={cn(
                      "hidden rounded-md px-1.5 py-0.5 text-[10px] font-semibold sm:inline",
                      severityClasses[r.severity].chip,
                    )}
                  >
                    {severityLabel[r.severity]}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                  {r.road} · {r.id}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <span className="num block text-[12px] font-semibold text-foreground">
                  {r.confidence.toFixed(1)}%
                </span>
                <span className="block text-[10.5px] text-muted-foreground">{r.ago}</span>
              </span>
            </button>
          </li>
        ))}
        {rows.length === 0 && (
          <li className="px-5 py-8 text-center text-[12px] text-muted-foreground">
            Нет дефектов по выбранным фильтрам критичности.
          </li>
        )}
      </ul>
    </section>
  );
}
