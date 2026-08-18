import {
  ChevronDown,
  Menu,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/features/auth/useAuth";
import { useLocation } from "react-router-dom";

const roleNames: Record<string, string> = { 
  admin: 'Администратор', 
  road_service: 'Дорожная служба', 
  resident: 'Житель' 
};

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return 'Дашборд';
    if (path.startsWith('/map')) return 'Карта дефектов';
    if (path.startsWith('/defects')) return 'Журнал дефектов';
    if (path.startsWith('/my-requests')) return 'Мои обращения';
    if (path.startsWith('/users')) return 'Пользователи';
    if (path.startsWith('/upload')) return 'Загрузка данных';
    return 'RoadVision AI';
  };

  const initials = user?.email ? user.email.substring(0, 2).toUpperCase() : '??';
  const roleLabel = user ? roleNames[user.role] : 'Гость';

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 md:px-6">
        <button
          onClick={toggleSidebar}
          aria-label="Открыть меню"
          className="rounded-lg border border-border p-2 text-muted-foreground hover:text-white lg:hidden"
        >
          <Menu className="size-4" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[17px] font-semibold tracking-tight text-white">
            {getTitle()}
          </h1>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2.5 rounded-lg border border-border bg-card py-1.5 pl-1.5 pr-2.5 transition-colors hover:border-border-strong hover:bg-surface outline-none">
            <span className="grid size-7 place-items-center rounded-md bg-[#9BEF18] text-[11px] font-bold text-black">
              {initials}
            </span>
            <span className="hidden text-left leading-tight sm:block">
              <span className="block text-[12.5px] font-medium text-white">
                {roleLabel}
              </span>
              <span className="block text-[10.5px] text-zinc-400">
                {user?.email}
              </span>
            </span>
            <ChevronDown className="size-3.5 text-zinc-400" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-[13px] font-medium">{roleLabel}</div>
              <div className="text-[11px] font-normal text-muted-foreground">
                {user?.email}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="text-[13px] text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 size-3.5" /> Выйти
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
