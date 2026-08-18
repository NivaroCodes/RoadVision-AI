import { createFileRoute } from "@tanstack/react-router";
import { Mail, ShieldCheck, User } from "lucide-react";
import { DashboardShell, PanelHeader } from "@/components/roadvision/DashboardShell";
import { initials, roleLabel, useSession } from "@/lib/session";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Профиль — Qala Vision" },
      {
        name: "description",
        content: "Данные учётной записи и роль пользователя в платформе Qala Vision.",
      },
      { property: "og:title", content: "Профиль — Qala Vision" },
      { property: "og:description", content: "Данные учётной записи Qala Vision." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

function ProfilePage() {
  const session = useSession();

  return (
    <DashboardShell title="Профиль" subtitle="Данные вашей учётной записи">
      <section className="panel max-w-2xl overflow-hidden">
        <PanelHeader title="Учётная запись" meta={roleLabel[session.role]} />
        <div className="space-y-5 px-4 py-5 md:px-5">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-xl bg-primary text-[16px] font-bold text-primary-foreground">
              {initials(session.email)}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-foreground">
                {session.email}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {roleLabel[session.role]}
              </div>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Field icon={<Mail className="size-3.5 text-primary" />} label="Email" value={session.email} />
            <Field
              icon={<ShieldCheck className="size-3.5 text-primary" />}
              label="Роль"
              value={roleLabel[session.role]}
            />
            <Field
              icon={<User className="size-3.5 text-primary" />}
              label="Статус"
              value="Активен"
            />
          </dl>
        </div>
      </section>
    </DashboardShell>
  );
}

function Field({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface/40 px-3.5 py-3">
      <dt className="flex items-center gap-1.5 text-eyebrow">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 truncate text-[13px] font-medium text-foreground">{value}</dd>
    </div>
  );
}
