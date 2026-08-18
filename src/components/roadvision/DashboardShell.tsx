import { useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Sidebar, navItemsForRole } from "./Sidebar";
import { TopHeader } from "./TopHeader";
import { useSession } from "@/lib/session";

export function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode | ((ctx: { dateRange: string }) => ReactNode);
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dateRange, setDateRange] = useState("7 дней");
  const { role, authed, ready } = useSession();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!ready) return;
    if (!authed) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    const nav = navItemsForRole(role).map((i) => i.to as string);
    const allowed = [...nav, "/profile", "/settings", ...(role === "admin" ? ["/access"] : [])];
    if (!allowed.includes(pathname)) {
      void navigate({ to: nav[0] ?? "/", replace: true });
    }
  }, [role, authed, ready, pathname, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="lg:pl-[228px]">
        <TopHeader
          title={title}
          subtitle={subtitle}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onMenuClick={() => setMobileOpen(true)}
        />
        <main className="px-4 py-5 md:px-6 md:py-6">
          {typeof children === "function" ? children({ dateRange }) : children}
        </main>
      </div>
    </div>
  );
}

export function PanelHeader({
  title,
  meta,
  action,
}: {
  title: string;
  meta?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3.5 md:px-5">
      <div>
        <h2 className="text-[13.5px] font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {meta && <p className="mt-0.5 text-[11.5px] text-muted-foreground">{meta}</p>}
      </div>
      {action}
    </div>
  );
}
