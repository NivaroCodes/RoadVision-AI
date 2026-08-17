import { NavLink } from 'react-router-dom';
import { ClipboardList, FileWarning, LayoutDashboard, Map, Upload, Users, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '@/features/auth/useAuth';
import type { UserRole } from '@/features/auth/types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation: Array<{ name: string; href: string; icon: typeof Map; roles: UserRole[] }> = [
  { name: 'Дашборд', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { name: 'Карта', href: '/map', icon: Map, roles: ['admin', 'road_service'] },
  { name: 'Журнал дефектов', href: '/defects', icon: FileWarning, roles: ['admin', 'road_service'] },
  { name: 'Загрузка данных', href: '/upload', icon: Upload, roles: ['admin', 'resident'] },
  { name: 'Мои обращения', href: '/my-requests', icon: ClipboardList, roles: ['resident'] },
  { name: 'Пользователи', href: '/users', icon: Users, roles: ['admin'] },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const availableNavigation = navigation.filter((item) => user && item.roles.includes(user.role));
  return <>
    {isOpen && <button type="button" className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Закрыть боковое меню" />}
    <aside className={cn('fixed inset-y-0 left-0 z-50 w-72 transform flex-col border-r bg-card transition-transform duration-300 lg:static lg:flex lg:translate-x-0', isOpen ? 'flex translate-x-0' : 'hidden -translate-x-full')}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b px-6"><div className="flex items-center gap-2"><div className="rounded-md bg-primary p-1 text-primary-foreground"><Map className="h-6 w-6" /></div><span className="text-xl font-bold">Jol Scan</span></div><button type="button" onClick={onClose} className="rounded-md p-1 lg:hidden" aria-label="Закрыть боковое меню"><X className="h-6 w-6" /></button></div>
      <nav className="flex flex-1 flex-col p-4"><ul className="flex flex-1 flex-col gap-2">{availableNavigation.map((item) => <li key={item.href}><NavLink to={item.href} end={item.href === '/'} onClick={() => { if (window.innerWidth < 1024) onClose(); }} className={({ isActive }) => cn(isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground', 'flex gap-3 rounded-md p-3 text-sm font-semibold transition-colors')}><item.icon className="h-6 w-6 shrink-0" />{item.name}</NavLink></li>)}</ul></nav>
    </aside>
  </>;
}
