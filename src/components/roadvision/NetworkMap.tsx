import { useState } from "react";
import { Layers, Maximize2, Minus, Plus, Navigation } from "lucide-react";
import mapDark from "@/assets/map-dark.jpg";
import { mapMarkers, severityClasses, severityLabel, type Severity } from "@/lib/roadvision-data";
import { cn } from "@/lib/utils";
import { PanelHeader } from "./DashboardShell";

const routes = [
  "M4,66 C18,58 26,44 40,42 C56,40 66,52 82,46 C90,43 95,36 99,34",
  "M2,26 C16,30 24,22 38,24 C54,26 62,16 78,18 C88,19 94,24 99,22",
  "M12,96 C20,82 30,78 38,66 C46,54 58,52 66,40 C74,28 86,24 98,10",
  "M0,48 C14,50 22,60 34,64 C48,69 56,80 70,84 C82,88 90,86 99,88",
];

const filters: (Severity | "all")[] = ["all", "critical", "high", "medium", "low"];

export function NetworkMap({
  activeFilters,
  onToggleFilter,
}: {
  activeFilters: Severity[];
  onToggleFilter: (s: Severity | "all") => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const visible = mapMarkers.filter((m) => activeFilters.includes(m.severity));
  const allActive = activeFilters.length === 4;

  return (
    <section className="panel flex flex-col overflow-hidden">
      <PanelHeader
        title="Карта дорожной сети"
        meta="Под наблюдением 1 248 км · 86 участков"
        action={
          <div className="hidden items-center gap-1 sm:flex">
            {filters.map((f) => {
              const active = f === "all" ? allActive : activeFilters.includes(f as Severity);
              return (
                <button
                  key={f}
                  onClick={() => onToggleFilter(f)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                    active
                      ? "border-border-strong bg-surface-2 text-foreground"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {f !== "all" && (
                    <span
                      className={cn("size-1.5 rounded-full", severityClasses[f as Severity].dot)}
                    />
                  )}
                  {f === "all" ? "Все" : severityLabel[f as Severity]}
                </button>
              );
            })}
          </div>
        }
      />

      <div className="relative min-h-[280px] w-full flex-1 overflow-hidden bg-background sm:min-h-[360px] xl:min-h-[452px]">
        <img
          src={mapDark}
          alt="Тёмная карта дорожной сети города"
          width={1536}
          height={1024}
          loading="lazy"
          className="absolute inset-0 size-full object-cover opacity-60 transition-transform duration-500"
          style={{ transform: `scale(${zoom})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/45 via-background/10 to-background/25" />

        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 size-full"
          style={{ transform: `scale(${zoom})` }}
        >
          {routes.map((d, i) => (
            <g key={i}>
              <path
                d={d}
                fill="none"
                className="stroke-route"
                strokeWidth={2.6}
                strokeOpacity={0.18}
                vectorEffect="non-scaling-stroke"
              />
              <path
                d={d}
                fill="none"
                className="stroke-route"
                strokeWidth={1.4}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          ))}
        </svg>

        {visible.map((m) => (
          <button
            key={m.id}
            onMouseEnter={() => setHovered(m.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(m.id)}
            onBlur={() => setHovered(null)}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            aria-label={`${severityLabel[m.severity]} — ${m.label}`}
          >
            <span className="relative grid place-items-center">
              <span
                className={cn(
                  "absolute size-3 rounded-full opacity-60 [animation:pulse-ring_2.4s_ease-out_infinite]",
                  severityClasses[m.severity].bg,
                )}
              />
              <span
                className={cn(
                  "relative size-2.5 rounded-full ring-2 ring-background",
                  severityClasses[m.severity].bg,
                )}
              />
            </span>
            {hovered === m.id && (
              <span className="absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-lg border border-border-strong bg-popover px-2.5 py-1.5 text-left shadow-panel">
                <span className="block text-[11.5px] font-semibold text-foreground">
                  {m.label}
                </span>
                <span className="block text-[10.5px] text-muted-foreground">{m.road}</span>
              </span>
            )}
          </button>
        ))}

        {/* Map controls */}
        <div className="absolute right-3 top-3 flex flex-col overflow-hidden rounded-lg border border-border bg-card/90 backdrop-blur">
          <button
            aria-label="Приблизить"
            onClick={() => setZoom((z) => Math.min(1.6, +(z + 0.15).toFixed(2)))}
            className="p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Plus className="size-3.5" />
          </button>
          <button
            aria-label="Отдалить"
            onClick={() => setZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}
            className="border-t border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Minus className="size-3.5" />
          </button>
          <button
            aria-label="Сбросить вид"
            onClick={() => setZoom(1)}
            className="border-t border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>

        <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground backdrop-blur">
          <Layers className="size-3.5" /> Тепловая карта
        </div>

        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-border bg-card/90 px-3 py-2 backdrop-blur">
          {(["critical", "high", "medium", "low"] as Severity[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5 text-[10.5px] text-muted-foreground">
              <span className={cn("size-1.5 rounded-full", severityClasses[s].dot)} />
              {severityLabel[s]}
            </span>
          ))}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-lg border border-border bg-card/90 px-2.5 py-1.5 text-[10.5px] text-muted-foreground backdrop-blur">
          <Navigation className="size-3 text-primary" /> {visible.length} отметок
        </div>
      </div>
    </section>
  );
}
