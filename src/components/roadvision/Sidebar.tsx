import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Map,
  ClipboardList,
  UploadCloud,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QalaBrand } from "./QalaLogo";
import { useSession, type Role } from "@/lib/session";

export const navItems = [
  { label: "Дашборд", to: "/", icon: LayoutDashboard, roles: ["admin"] },
  { label: "Карта", to: "/map", icon: Map, roles: ["admin", "road"] },
  { label: "Журнал дефектов", to: "/defects", icon: ClipboardList, roles: ["admin", "road"] },
  {
    label: "Загрузка данных",
    to: "/upload",
    icon: UploadCloud,
    roles: ["admin", "resident"],
  },
  { label: "Мои обращения", to: "/my-reports", icon: ClipboardList, roles: ["resident"] },
  { label: "Пользователи", to: "/users", icon: Users, roles: ["admin"] },
] as const satisfies readonly { label: string; to: string; icon: unknown; roles: readonly Role[] }[];

export function navItemsForRole(role: Role) {
  return navItems.filter((i) => (i.roles as readonly Role[]).includes(role));
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { role } = useSession();
  const items = navItemsForRole(role);

  return (
    <div className="flex h-full flex-col border-r border-border bg-card">
      <QalaBrand />

      <div className="px-5 pb-2 text-eyebrow">Разделы</div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-primary" />
              )}
              <item.icon className="size-[17px]" strokeWidth={active ? 2.3 : 1.9} />
              <span className="flex-1 truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-3" />
    </div>
  );
}

export function Sidebar({
  mobileOpen,
  onClose,
}: {
  mobileOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[228px] lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Закрыть меню"
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />
          <div className="absolute inset-y-0 left-0 w-[228px] animate-in slide-in-from-left duration-200">
            <SidebarContent onNavigate={onClose} />
            <button
              onClick={onClose}
              aria-label="Закрыть меню"
              className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
