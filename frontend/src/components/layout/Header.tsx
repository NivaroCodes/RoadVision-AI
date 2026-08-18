import { useState } from "react";
import {
  Bell,
  CalendarDays,
  Check,
  ChevronDown,
  Menu,
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
import { useAuth } from "@/features/auth/useAuth";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import { dateRanges, notifications, severityClasses } from "@/lib/roadvision-data";
import { format, subDays } from "date-fns";

const roleNames: Record<string, string> = {
  admin: "Администратор",
  road_service: "Дорожная служба",
  resident: "Житель",
};

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [read, setRead] = useState(false);

  const getPageInfo = () => {
    const path = location.pathname;
    if (path.startsWith("/dashboard")) {
      return {
        title: "Дашборд",
        subtitle: "Ключевые показатели системы обнаружения дорожных дефектов",
      };
    }
    if (path.startsWith("/map")) {
      return {
        title: "Карта",
        subtitle: "Геопривязка дефектов · Шымкент",
      };
    }
    if (path.startsWith("/defects")) {
      return {
        title: "Журнал дефектов",
        subtitle: "Просмотр и управление обнаруженными дорожными дефектами",
      };
    }
    if (path.startsWith("/my-requests")) {
      return {
        title: "Мои обращения",
        subtitle: "Следите за состоянием отправленных вами дорожных дефектов",
      };
    }
    if (path.startsWith("/users")) {
      return {
        title: "Пользователи",
        subtitle: "Управление ролями и доступом к системе",
      };
    }
    if (path.startsWith("/upload")) {
      return {
        title: "Загрузка дефекта",
        subtitle: "Загрузите фотографию дороги для AI-анализа",
      };
    }
    if (path.startsWith("/profile")) {
      return {
        title: "Профиль",
        subtitle: "Данные вашей учётной записи",
      };
    }
    if (path.startsWith("/settings")) {
      return {
        title: "Настройки",
        subtitle: "Параметры аккаунта и интерфейса",
      };
    }
    if (path.startsWith("/access")) {
      return {
        title: "Права доступа",
        subtitle: "Матрица доступа к разделам по ролям",
      };
    }
    return {
      title: "Qala Vision",
      subtitle: "Шымкент · Мониторинг в реальном времени",
    };
  };

  const rangeParam = searchParams.get("range");
  const selectedRange = rangeParam === "1_day"
    ? "1 день"
    : rangeParam === "30_days"
    ? "30 дней"
    : rangeParam === "12_months"
    ? "12 месяцев"
    : rangeParam === "all"
    ? "Весь период"
    : "7 дней";

  const handleRangeChange = (range: string) => {
    const newParams = new URLSearchParams(searchParams);
    const today = new Date();

    if (range === "1 день") {
      newParams.set("range", "1_day");
      newParams.set("from", format(today, "yyyy-MM-dd"));
      newParams.set("to", format(today, "yyyy-MM-dd"));
    } else if (range === "7 дней") {
      newParams.set("range", "7_days");
      newParams.set("from", format(subDays(today, 6), "yyyy-MM-dd"));
      newParams.set("to", format(today, "yyyy-MM-dd"));
    } else if (range === "30 дней") {
      newParams.set("range", "30_days");
      newParams.set("from", format(subDays(today, 29), "yyyy-MM-dd"));
      newParams.set("to", format(today, "yyyy-MM-dd"));
    } else if (range === "12 месяцев") {
      newParams.set("range", "12_months");
      newParams.set("from", format(subDays(today, 364), "yyyy-MM-dd"));
      newParams.set("to", format(today, "yyyy-MM-dd"));
    } else {
      newParams.set("range", "all");
      newParams.delete("from");
      newParams.delete("to");
    }

    setSearchParams(newParams);
  };

  const { title, subtitle } = getPageInfo();
  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : "??";
  const roleLabel = user ? (roleNames[user.role] ?? user.role) : "Гость";
  const unreadCount = read ? 0 : notifications.filter((n) => n.unread).length;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Открыть меню"
          className="rounded-lg border border-border p-2 text-muted-foreground transition-colors hover:text-foreground lg:hidden"
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

        {/* Date selector dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-[12.5px] font-medium text-foreground/90 transition-colors hover:border-border-strong hover:bg-surface outline-none">
            <CalendarDays className="size-[15px] text-muted-foreground" />
            <span className="hidden sm:inline">{selectedRange}</span>
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-eyebrow">Период</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {dateRanges.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => handleRangeChange(r)}
                className="text-[13px] cursor-pointer"
              >
                <span className="flex-1">{r}</span>
                {r === selectedRange && <Check className="size-3.5 text-primary" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications Popover */}
        <Popover>
          <PopoverTrigger
            aria-label="Уведомления"
            className="relative rounded-lg border border-border bg-card p-2 text-muted-foreground transition-colors hover:border-border-strong hover:text-foreground outline-none"
          >
            <Bell className="size-[16px]" />
            {unreadCount > 0 && (
              <span className="num absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[320px] p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-[13px] font-semibold text-foreground">Уведомления</span>
              <button
                type="button"
                onClick={() => setRead(true)}
                className="text-[11.5px] font-medium text-primary transition-opacity hover:opacity-80"
              >
                Прочитать все
              </button>
            </div>
            <ul className="max-h-[300px] divide-y divide-border overflow-y-auto">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "flex items-start gap-3 p-3.5 transition-colors hover:bg-accent/40",
                    n.unread && !read && "bg-surface/40",
                  )}
                >
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full",
                      severityClasses[n.severity].dot,
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium text-foreground">{n.title}</div>
                    <div className="mt-0.5 text-[11.5px] text-muted-foreground">{n.body}</div>
                    <div className="mt-1 text-[10.5px] text-muted-foreground/70">{n.ago}</div>
                  </div>
                </li>
              ))}
            </ul>
          </PopoverContent>
        </Popover>

        {/* Profile menu */}
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Меню пользователя"
            className="flex items-center gap-2.5 rounded-lg border border-border bg-card px-2.5 py-1.5 transition-colors hover:border-border-strong hover:bg-surface outline-none"
          >
            <span className="grid size-7 place-items-center rounded-md bg-primary text-[12px] font-bold text-primary-foreground">
              {initials}
            </span>
            <div className="hidden text-left sm:block">
              <div className="truncate text-[12px] font-semibold leading-none text-foreground">
                {roleLabel}
              </div>
              <div className="mt-0.5 truncate text-[11px] leading-none text-muted-foreground">
                {user?.email}
              </div>
            </div>
            <ChevronDown className="size-3 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="text-[13px] font-semibold text-foreground">{user?.email}</div>
              <div className="text-[11.5px] text-muted-foreground">{roleLabel}</div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => navigate("/profile")}
              className="text-[13px] cursor-pointer"
            >
              <User className="size-3.5 mr-2 text-primary" /> Профиль
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => navigate("/settings")}
              className="text-[13px] cursor-pointer"
            >
              <SettingsIcon className="size-3.5 mr-2 text-primary" /> Настройки
            </DropdownMenuItem>
            {user?.role === "admin" && (
              <DropdownMenuItem
                onClick={() => navigate("/access")}
                className="text-[13px] cursor-pointer"
              >
                <ShieldCheck className="size-3.5 mr-2 text-primary" /> Права доступа
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-[13px] text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="size-3.5 mr-2" /> Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
