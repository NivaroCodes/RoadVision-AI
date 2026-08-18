import { Mail, ShieldCheck, User } from "lucide-react";
import { PanelHeader } from "@/components/layout/PanelHeader";
import { useAuth } from "@/features/auth/useAuth";

const roleNames: Record<string, string> = {
  admin: "Администратор",
  road_service: "Дорожная служба",
  resident: "Житель",
};

export default function ProfilePage() {
  const { user } = useAuth();
  const roleLabel = user ? (roleNames[user.role] ?? user.role) : "Гость";
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "??";

  return (
    <div className="space-y-4 md:space-y-5">
      <section className="panel max-w-2xl overflow-hidden">
        <PanelHeader title="Учётная запись" meta={roleLabel} />
        <div className="space-y-5 px-4 py-5 md:px-5">
          <div className="flex items-center gap-3.5">
            <span className="grid size-12 place-items-center rounded-xl bg-primary text-[16px] font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-semibold text-foreground">
                {user?.email}
              </div>
              <div className="text-[12px] text-muted-foreground">
                {roleLabel}
              </div>
            </div>
          </div>

          <dl className="grid gap-3 sm:grid-cols-2">
            <Field
              icon={<Mail className="size-3.5 text-primary" />}
              label="Email"
              value={user?.email ?? "—"}
            />
            <Field
              icon={<ShieldCheck className="size-3.5 text-primary" />}
              label="Роль"
              value={roleLabel}
            />
            <Field
              icon={<User className="size-3.5 text-primary" />}
              label="Статус"
              value="Активен"
            />
          </dl>
        </div>
      </section>
    </div>
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
