import { Skeleton } from '@/components/ui/skeleton';
import { PanelHeader } from '@/components/layout/PanelHeader';

export function DefectsTableSkeleton() {
  return (
    <section className="panel overflow-hidden" aria-label="Загрузка реестра дефектов" role="status">
      <PanelHeader title="Дефекты" meta="Загрузка данных…" />
      <div className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, row) => (
          <div key={row} className="flex items-center gap-4 py-2 border-b border-border last:border-0">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-5 w-24 rounded-md" />
            <Skeleton className="h-4 w-16 ml-auto" />
            <Skeleton className="h-4 w-40" />
          </div>
        ))}
      </div>
      <span className="sr-only">Загрузка данных…</span>
    </section>
  );
}
