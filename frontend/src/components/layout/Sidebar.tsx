import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, FileWarning, Upload, X } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const navigation = [
  { name: 'Дашборд', href: '/', icon: LayoutDashboard },
  { name: 'Карта', href: '/map', icon: Map },
  { name: 'Журнал дефектов', href: '/defects', icon: FileWarning },
  { name: 'Загрузка данных', href: '/upload', icon: Upload },
];

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar component */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform flex-col border-r bg-card transition-transform duration-300 ease-in-out lg:static lg:flex lg:translate-x-0",
        isOpen ? "translate-x-0 flex" : "-translate-x-full hidden"
      )}>
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded-md">
              <Map className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">RoadVision AI</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-muted-foreground hover:text-foreground">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col p-4">
          <ul role="list" className="flex flex-1 flex-col gap-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  onClick={() => {
                    if (window.innerWidth < 1024) onClose();
                  }}
                  className={({ isActive }) => cn(
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
                    'group flex gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold transition-colors'
                  )}
                >
                  <item.icon
                    className="h-6 w-6 shrink-0"
                    aria-hidden="true"
                  />
                  {item.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
