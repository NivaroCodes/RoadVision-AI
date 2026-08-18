import { useState } from "react";
import { toast } from "sonner";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/features/auth/useAuth";

const roleNames: Record<string, string> = {
  admin: "Администратор",
  road_service: "Дорожная служба",
  resident: "Житель",
};

const items = [
  { key: "critical", label: "Уведомления о критических дефектах", hint: "Push при уровне «Критическая»" },
  { key: "digest", label: "Ежедневная сводка", hint: "Отчёт по обнаружениям за сутки" },
  { key: "map", label: "Автоцентрирование карты", hint: "Карта следует за новыми дефектами" },
] as const;

export default function SettingsPage() {
  const { user } = useAuth();
  const roleLabel = user ? (roleNames[user.role] ?? user.role) : "Гость";
  const [state, setState] = useState<Record<string, boolean>>({
    critical: true,
    digest: false,
    map: true,
  });

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="panel max-w-2xl overflow-hidden">
        <PanelHeader title="Предпочтения" meta={`Параметры аккаунта · ${roleLabel}`} />
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
    </div>
  );
}
