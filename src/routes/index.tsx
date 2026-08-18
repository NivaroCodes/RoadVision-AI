import { createFileRoute } from "@tanstack/react-router";
import { CalendarRange, FileText } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/roadvision/DashboardShell";
import { KpiCards } from "@/components/roadvision/KpiCards";
import { DetectionTrends } from "@/components/roadvision/DetectionTrends";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Дашборд — Qala Vision AI-инспекция дорог" },
      {
        name: "description",
        content:
          "Ключевые показатели системы обнаружения дорожных дефектов: критические дефекты, динамика, карта и последние обнаружения.",
      },
      { property: "og:title", content: "Дашборд — Qala Vision" },
      {
        property: "og:description",
        content:
          "Ключевые показатели системы AI-обнаружения дорожных дефектов Шымкента в реальном времени.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  return (
    <DashboardShell
      title="Дашборд"
      subtitle="Ключевые показатели системы обнаружения дорожных дефектов"
    >
      {({ dateRange }) => (
        <div className="space-y-4 md:space-y-5">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => toast.success("Отчёт сформирован")}
              className="flex h-9 items-center gap-2 rounded-lg border border-border bg-card px-3 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface"
            >
              <FileText className="size-3.5 text-muted-foreground" /> Экспорт отчёта
            </button>
            <span className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 text-[12.5px] text-muted-foreground">
              <CalendarRange className="size-3.5" /> Период: {dateRange}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <DetectionTrends dateRange={dateRange} />
            <KpiCards className="grid grid-cols-1 gap-3.5 sm:grid-cols-2" />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
