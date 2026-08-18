import { severityBreakdown, severityClasses, severityLabel, type Severity } from "@/lib/roadvision-data";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./DashboardShell";

const strokeVar: Record<Severity, string> = {
  critical: "var(--critical)",
  high: "var(--high)",
  medium: "var(--medium)",
  low: "var(--low)",
};

export function SeverityDonut({
  activeFilters,
  onToggleFilter,
}: {
  activeFilters: Severity[];
  onToggleFilter: (s: Severity) => void;
}) {
  const total = severityBreakdown.reduce((a, b) => a + b.value, 0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <section className="panel flex flex-col overflow-hidden">
      <PanelHeader title="Дефекты по критичности" meta="324 дефекта за период" />
      <div className="flex flex-1 flex-col items-center gap-5 p-5 sm:flex-row sm:gap-6">
        <div className="relative size-[152px] shrink-0">
          <svg viewBox="0 0 120 120" className="size-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke="var(--surface-2)"
              strokeWidth={13}
            />
            {severityBreakdown.map((s) => {
              const dim = !activeFilters.includes(s.severity);
              const len = (s.value / total) * circumference;
              const dash = `${len - 2.5} ${circumference - len + 2.5}`;
              const el = (
                <circle
                  key={s.severity}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={strokeVar[s.severity]}
                  strokeWidth={dim ? 10 : 13}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  strokeLinecap="round"
                  opacity={dim ? 0.22 : 1}
                  className="transition-all duration-300"
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <div className="num text-[26px] font-semibold leading-none text-foreground">
                {total}
              </div>
              <div className="text-[10.5px] tracking-wide text-muted-foreground">
                всего дефектов
              </div>
            </div>
          </div>
        </div>

        <ul className="w-full space-y-1.5">
          {severityBreakdown.map((s) => {
            const active = activeFilters.includes(s.severity);
            return (
              <li key={s.severity}>
                <button
                  onClick={() => onToggleFilter(s.severity)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-accent",
                    !active && "opacity-45",
                  )}
                >
                  <span className={cn("size-2 rounded-full", severityClasses[s.severity].dot)} />
                  <span className="flex-1 text-[12.5px] font-medium text-foreground">
                    {severityLabel[s.severity]}
                  </span>
                  <span className="num text-[12.5px] font-semibold text-foreground">
                    {s.value}
                  </span>
                  <span className="num w-10 text-right text-[11px] text-muted-foreground">
                    {((s.value / total) * 100).toFixed(1)}%
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
