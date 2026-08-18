import { useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronDown,
  Menu,
  Check,
  LogOut,
  User,
  Settings as SettingsIcon,
  ShieldCheck,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { dateRanges, notifications, severityClasses } from "@/lib/roadvision-data";
import { clearSession, initials, roleLabel, useSession } from "@/lib/session";
import { useNavigate } from "@tanstack/react-router";

export function TopHeader({
  title,
  subtitle,
  dateRange,
  onDateRangeChange,
  onMenuClick,
}: {
  title: string;
  subtitle: string;
  dateRange: string;
  onDateRangeChange: (v: string) => void;
  onMenuClick: () => void;
}) {
  const [read, setRead] = useState(false);
  const unread = read ? 0 : notifications.filter((n) => n.unread).length;
  const session = useSession();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          onClick={onMenuClick}
          aria-label="Открыть меню"
          className="rounded-lg border border-border p-2 text-muted-foreground hover:text-foreground lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="hidden items-center gap-1.5 text-[12px] text-muted-foreground sm:flex">
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full rounded-full bg-primary opacity-75 [animation:pulse-ring_2s_ease-out_infinite]" />
              <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
            </span>
            {subtitle}
          </p>
        </div>

        {/* Date selector */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface">
            <CalendarDays className="size-[15px] text-muted-foreground" />
            <span className="hidden sm:inline">{dateRange}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-eyebrow">Период</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dateRanges.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => onDateRangeChange(r)}
                className="text-[13px]"
              >
                <span className="flex-1">{r}</span>
                {r === dateRange && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger
            aria-label="Уведомления"
            className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground"
          >
            <Bell className="size-[16px]" />
            {unread > 0 && (
              <span className="num absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {unread}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[320px] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-[13px] font-semibold">Уведомления</span>
              <button
                onClick={() => setRead(true)}
                className="text-[11.5px] font-medium text-primary hover:underline"
              >
                Прочитать все
              </button>
            </div>
            <div className="max-h-[300px] divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={cn(
                    "flex gap-3 px-4 py-3 transition-colors hover:bg-accent/60",
                    !read && n.unread && "bg-primary/[0.04]",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1.5 size-1.5 shrink-0 rounded-full",
                      severityClasses[n.severity].dot,
                    )}
                  />
                  <div className="min-w-0">
                    <p className="text-[12.5px] font-medium leading-snug text-foreground">
                      {n.title}
                    </p>
                    <p className="mt-0.5 text-[11.5px] text-muted-foreground">{n.body}</p>
                    <p className="mt-1 text-[10.5px] text-muted-foreground/70">{n.ago}</p>
                  </div>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-border-strong hover:bg-surface">
            <span className="grid size-7 place-items-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground">
              {initials(session.email)}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[12.5px] font-medium text-foreground">
                {roleLabel[session.role]}
              </span>
              <span className="block text-[10.5px] text-muted-foreground">
                {session.email}
              </span>
            </span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-[13px] font-medium">{roleLabel[session.role]}</div>
              <div className="text-[11px] font-normal text-muted-foreground">
                {session.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => void navigate({ to: "/profile" })}
              className="text-[13px]"
            >
              <User className="size-3.5" /> Профиль
            </DropdownMenuItem>
            {session.role === "admin" && (
              <DropdownMenuItem
                onClick={() => void navigate({ to: "/access" })}
                className="text-[13px]"
              >
                <ShieldCheck className="size-3.5" /> Права доступа
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => void navigate({ to: "/settings" })}
              className="text-[13px]"
            >
              <SettingsIcon className="size-3.5" /> Настройки
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                clearSession();
                void navigate({ to: "/auth", replace: true });
              }}
              className="text-[13px] text-destructive"
            >
              <LogOut className="size-3.5" /> Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
