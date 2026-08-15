import { Menu } from 'lucide-react';

export function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
      <button
        type="button"
        className="-m-2.5 p-2.5 text-foreground lg:hidden"
        onClick={toggleSidebar}
        aria-label="Открыть боковое меню"
      >
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>

      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1 items-center">
          <h2 className="text-lg font-semibold leading-6 text-foreground">
            RoadVision AI
          </h2>
        </div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-border" aria-hidden="true" />
          <div className="flex items-center gap-x-4">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-sm font-medium leading-none text-primary">А</span>
            </span>
            <span className="text-sm font-medium leading-6 text-foreground">Админ</span>
          </div>
        </div>
      </div>
    </header>
  );
}
