import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { RotateCcw, Search } from "lucide-react";
import { DashboardShell } from "@/components/roadvision/DashboardShell";
import { NetworkMap } from "@/components/roadvision/NetworkMap";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  confidenceOptions,
  defectTypes,
  severityOptions,
  statusOptions,
} from "@/lib/app-data";
import type { Severity } from "@/lib/roadvision-data";

const ALL: Severity[] = ["critical", "high", "medium", "low"];

export const Route = createFileRoute("/map")({
  head: () => ({
    meta: [
      { title: "Карта дефектов — Qala Vision" },
      {
        name: "description",
        content:
          "Карта обнаруженных дорожных дефектов Шымкента с фильтрами по типу, критичности, статусу и уверенности ИИ.",
      },
      { property: "og:title", content: "Карта дефектов — Qala Vision" },
      {
        property: "og:description",
        content: "Интерактивная карта дорожных дефектов с фильтрами и легендой критичности.",
      },
    ],
  }),
  component: MapPage,
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0 space-y-1.5">
      <div className="text-eyebrow">{label}</div>
      {children}
    </div>
  );
}

function MapPage() {
  const [query, setQuery] = useState("");
  const [type, setType] = useState(defectTypes[0]!);
  const [confidence, setConfidence] = useState(confidenceOptions[0]!);
  const [severity, setSeverity] = useState(severityOptions[0]!);
  const [status, setStatus] = useState(statusOptions[0]!);
  const [filters, setFilters] = useState<Severity[]>(ALL);

  const toggle = (s: Severity | "all") => {
    if (s === "all") {
      setFilters(filters.length === 4 ? [] : ALL);
      return;
    }
    setFilters((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s]));
  };

  const reset = () => {
    setQuery("");
    setType(defectTypes[0]!);
    setConfidence(confidenceOptions[0]!);
    setSeverity(severityOptions[0]!);
    setStatus(statusOptions[0]!);
    setFilters(ALL);
  };

  const selects: [string, string, string[], (v: string) => void][] = [
    ["Тип", type, defectTypes, setType],
    ["Уверенность", confidence, confidenceOptions, setConfidence],
    ["Критичность", severity, severityOptions, setSeverity],
    ["Статус", status, statusOptions, setStatus],
  ];

  return (
    <DashboardShell title="Карта" subtitle="Геопривязка дефектов · Шымкент">
      <div className="space-y-4 md:space-y-5">
        <section className="panel p-4 md:p-5">
          <div className="grid grid-cols-1 items-end gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1.4fr)_repeat(4,minmax(0,1fr))_auto]">
            <Field label="Поиск">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ID или адрес"
                  className="h-9 rounded-lg bg-surface/60 pl-8.5 text-[12.5px]"
                />
              </div>
            </Field>

            {selects.map(([label, value, options, onChange]) => (
              <Field key={label} label={label}>
                <Select value={value} onValueChange={onChange}>
                  <SelectTrigger className="h-9 rounded-lg border-border bg-surface/60 text-[12.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {options.map((o) => (
                      <SelectItem key={o} value={o} className="text-[13px]">
                        {o}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            ))}

            <button
              onClick={reset}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface"
            >
              <RotateCcw className="size-3.5 text-muted-foreground" /> Сброс
            </button>
          </div>
        </section>

        <NetworkMap activeFilters={filters} onToggleFilter={toggle} />
      </div>
    </DashboardShell>
  );
}
