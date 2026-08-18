import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardList, UploadCloud } from "lucide-react";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";

export const Route = createFileRoute("/my-reports")({
  head: () => ({
    meta: [
      { title: "Мои обращения — Qala Vision" },
      {
        name: "description",
        content:
          "Следите за состоянием отправленных вами дорожных дефектов в Qala Vision.",
      },
      { property: "og:title", content: "Мои обращения — Qala Vision" },
      {
        property: "og:description",
        content: "Статус отправленных обращений о дорожных дефектах.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyReportsPage,
});

function MyReportsPage() {
  return (
    <DashboardShell
      title="Мои обращения"
      subtitle="Следите за состоянием отправленных вами дорожных дефектов"
    >
      <section className="panel overflow-hidden">
        <PanelHeader title="Отправленные обращения" meta="0 обращений" />
        <div className="px-4 py-10 md:px-5">
          <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-dashed border-border-strong bg-surface/40 px-6 py-10 text-center">
            <span className="grid size-11 place-items-center rounded-xl border border-border bg-card">
              <ClipboardList className="size-[21px] text-primary" strokeWidth={1.9} />
            </span>
            <p className="mt-4 text-[13.5px] font-medium text-foreground">
              У вас пока нет отправленных обращений
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted-foreground">
              Загрузите фотографию дороги — ИИ определит тип дефекта, а статус обработки
              появится здесь.
            </p>
            <Link
              to="/upload"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-3.5 py-2 text-[12.5px] font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              <UploadCloud className="size-4" /> Загрузить дефект
            </Link>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
