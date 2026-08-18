import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { appUsers, roleOptions, type AppRole } from "@/lib/app-data";

export const Route = createFileRoute("/users")({
  head: () => ({
    meta: [
      { title: "Пользователи — Qala Vision" },
      {
        name: "description",
        content: "Управление ролями и доступом пользователей платформы Qala Vision.",
      },
      { property: "og:title", content: "Пользователи — Qala Vision" },
      {
        property: "og:description",
        content: "Роли и доступ: администратор, дорожная служба, житель.",
      },
    ],
  }),
  component: UsersPage,
});

function UsersPage() {
  const [roles, setRoles] = useState<Record<number, AppRole>>(
    () => Object.fromEntries(appUsers.map((u) => [u.id, u.role])) as Record<number, AppRole>,
  );

  return (
    <DashboardShell
      title="Пользователи"
      subtitle="Управление ролями и доступом к системе"
    >
      <section className="panel overflow-hidden">
        <PanelHeader title="Список пользователей" meta={`${appUsers.length} активных аккаунта`} />

        <div className="hidden grid-cols-[minmax(0,2fr)_200px_120px] gap-4 border-b border-border px-5 py-2.5 text-eyebrow md:grid">
          <span>Пользователь</span>
          <span>Роль</span>
          <span className="text-right">Статус</span>
        </div>

        <ul className="divide-y divide-border">
          {appUsers.map((u) => (
            <li
              key={u.id}
              className="grid grid-cols-1 items-center gap-3 px-5 py-4 md:grid-cols-[minmax(0,2fr)_200px_120px] md:gap-4"
            >
              <div className="min-w-0">
                <div className="truncate text-[13px] font-medium text-foreground">{u.email}</div>
                <div className="num mt-0.5 text-[11px] text-muted-foreground">ID {u.id}</div>
              </div>

              <Select
                value={roles[u.id] ?? u.role}
                onValueChange={(v) => {
                  setRoles((r) => ({ ...r, [u.id]: v as AppRole }));
                  toast.success(`Роль обновлена: ${v}`);
                }}
              >
                <SelectTrigger className="h-9 rounded-lg border-border bg-surface/60 text-[12.5px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((r) => (
                    <SelectItem key={r} value={r} className="text-[13px]">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="md:text-right">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/12 px-2 py-1 text-[11px] font-semibold text-primary">
                  <span className="size-1.5 rounded-full bg-primary" />
                  Активен
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </DashboardShell>
  );
}
