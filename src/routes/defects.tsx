import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  defectRows,
  statusChip,
  statusLabel,
  type DefectRow,
  type DefectStatus,
} from "@/lib/app-data";
import { severityClasses, severityLabel } from "@/lib/roadvision-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/defects")({
  head: () => ({
    meta: [
      { title: "Журнал дефектов — Qala Vision" },
      {
        name: "description",
        content:
          "Реестр обнаруженных дорожных дефектов: приоритет, тип, критичность, статус и уверенность ИИ.",
      },
      { property: "og:title", content: "Журнал дефектов — Qala Vision" },
      {
        property: "og:description",
        content: "Просмотр и управление обнаруженными дорожными дефектами.",
      },
    ],
  }),
  component: DefectsPage,
});

function DefectsPage() {
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [items, setItems] = useState<DefectRow[]>(defectRows);
  const active = items.find((r) => r.id === activeId) ?? null;
  const setActive = (r: DefectRow | null) => setActiveId(r?.id ?? null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (r) =>
        r.id.toLowerCase().includes(q) ||
        r.address.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q),
    );
  }, [query, items]);

  return (
    <DashboardShell
      title="Журнал дефектов"
      subtitle="Просмотр и управление обнаруженными дорожными дефектами"
    >
      <div className="space-y-4 md:space-y-5">
        <section className="panel p-4 md:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-[14px] font-semibold tracking-tight text-foreground">
                Реестр дефектов
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Показано {rows.length} из {items.length}. Нажмите на строку для редактирования.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <div className="relative sm:w-[260px]">
                <Search className="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Поиск по ID или адресу"
                  className="h-9 rounded-lg bg-surface/60 pl-8.5 text-[12.5px]"
                />
              </div>
              <button
                onClick={() => toast.success("Отчёт сформирован")}
                className="flex h-9 items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface"
              >
                <FileText className="size-3.5 text-muted-foreground" /> Экспорт отчёта
              </button>
              <button
                onClick={() => toast.success("CSV скачивается")}
                className="flex h-9 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Download className="size-3.5" /> Скачать CSV
              </button>
            </div>
          </div>
        </section>

        <section className="panel overflow-hidden">
          <PanelHeader title="Дефекты" meta="Обновлено только что" />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[860px] border-collapse">
              <thead>
                <tr className="border-b border-border">
                  {["ID", "Приоритет", "Тип", "Критичность", "Статус", "Уверенность ИИ", "Адрес"].map(
                    (h, i) => (
                      <th
                        key={h}
                        className={cn(
                          "px-5 py-2.5 text-left text-eyebrow",
                          i === 5 && "text-right",
                        )}
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setActive(r)}
                    className="cursor-pointer transition-colors hover:bg-accent/60"
                  >
                    <td className="num px-5 py-3 text-[12.5px] font-semibold text-foreground">
                      {r.id}
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{r.priority}</td>
                    <td className="px-5 py-3 text-[12.5px] font-medium text-foreground">
                      {r.type}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          severityClasses[r.severity].chip,
                        )}
                      >
                        {severityLabel[r.severity]}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-semibold",
                          statusChip[r.status],
                        )}
                      >
                        {statusLabel[r.status]}
                      </span>
                    </td>
                    <td className="num px-5 py-3 text-right text-[12.5px] font-semibold text-foreground">
                      {r.confidence}%
                    </td>
                    <td className="px-5 py-3 text-[12.5px] text-muted-foreground">{r.address}</td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-10 text-center text-[12.5px] text-muted-foreground"
                    >
                      Ничего не найдено по запросу «{query}».
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
        <DialogContent className="max-w-[460px]">
          <DialogHeader>
            <DialogTitle className="text-[16px]">
              {active?.type} · {active?.id}
            </DialogTitle>
            <DialogDescription className="text-[12.5px]">
              {active?.address} · зафиксировано {active?.detectedAt}
            </DialogDescription>
          </DialogHeader>
          <dl className="grid grid-cols-2 gap-3 pt-1">
            {[
              ["Критичность", active ? severityLabel[active.severity] : ""],
              ["Статус", active ? statusLabel[active.status] : ""],
              ["Приоритет", active?.priority ?? ""],
              ["Уверенность ИИ", active ? `${active.confidence}%` : ""],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-surface/50 px-3 py-2.5">
                <dt className="text-[10.5px] uppercase tracking-wide text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 text-[13px] font-semibold text-foreground">{v}</dd>
              </div>
            ))}
          </dl>

          <div className="pt-1">
            <div className="text-eyebrow">Изменить статус</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["detected", "in_progress", "resolved"] as DefectStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    if (!active) return;
                    setItems((prev) =>
                      prev.map((r) => (r.id === active.id ? { ...r, status: s } : r)),
                    );
                    toast.success(`${active.id} · ${statusLabel[s]}`);
                  }}
                  className={cn(
                    "rounded-lg border px-3 py-2 text-[12.5px] font-medium transition-colors",
                    active?.status === s
                      ? "border-primary/45 bg-primary/10 text-primary"
                      : "border-border bg-surface/40 text-muted-foreground hover:border-border-strong hover:text-foreground",
                  )}
                >
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
