import { LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/features/auth/useAuth';

const roleNames = { admin: 'Администратор', road_service: 'Дорожная служба', resident: 'Житель' };

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { user, logout } = useAuth();
  return <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 shadow-sm sm:px-6 lg:px-8">
    <button type="button" className="-m-2.5 p-2.5 lg:hidden" onClick={toggleSidebar} aria-label="Открыть боковое меню"><Menu className="h-6 w-6" /></button>
    <div className="flex flex-1 items-center justify-between gap-4"><h2 className="text-lg font-semibold">Jol Scan</h2><div className="flex min-w-0 items-center gap-3"><div className="hidden min-w-0 text-right sm:block"><p className="truncate text-sm font-medium">{user?.email}</p><p className="text-xs text-muted-foreground">{user ? roleNames[user.role] : ''}</p></div><span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{user?.email[0].toUpperCase()}</span><button type="button" onClick={logout} className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground" aria-label="Выйти"><LogOut className="h-5 w-5" /></button></div></div>
  </header>;
}
