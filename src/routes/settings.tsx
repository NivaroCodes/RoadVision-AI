import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";
import { Switch } from "@/components/ui/switch";
import { roleLabel, useSession } from "@/lib/session";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Настройки — Qala Vision" },
      {
        name: "description",
        content: "Настройки уведомлений и интерфейса платформы Qala Vision.",
      },
      { property: "og:title", content: "Настройки — Qala Vision" },
      { property: "og:description", content: "Уведомления и параметры интерфейса." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const items = [
  { key: "critical", label: "Уведомления о критических дефектах", hint: "Push при уровне «Критическая»" },
  { key: "digest", label: "Ежедневная сводка", hint: "Отчёт по обнаружениям за сутки" },
  { key: "map", label: "Автоцентрирование карты", hint: "Карта следует за новыми дефектами" },
] as const;

function SettingsPage() {
  const session = useSession();
  const [state, setState] = useState<Record<string, boolean>>({
    critical: true,
    digest: false,
    map: true,
  });

  return (
    <DashboardShell title="Настройки" subtitle={`Параметры аккаунта · ${roleLabel[session.role]}`}>
      <section className="panel max-w-2xl overflow-hidden">
        <PanelHeader title="Предпочтения" meta="Сохраняются локально" />
        <ul className="divide-y divide-border">
          {items.map((i) => (
            <li key={i.key} className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
              <div className="min-w-0">
                <div className="text-[13px] font-medium text-foreground">{i.label}</div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground">{i.hint}</div>
              </div>
              <Switch
                checked={state[i.key] ?? false}
                onCheckedChange={(v) => {
                  setState((s) => ({ ...s, [i.key]: v }));
                  toast.success(`${i.label}: ${v ? "включено" : "выключено"}`);
                }}
              />
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
