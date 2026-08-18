import { Skeleton } from '@/components/ui/skeleton';

export function SummaryCardsSkeleton({ className = "grid grid-cols-1 gap-3.5 sm:grid-cols-2" }: { className?: string }) {
  return (
    <div className={className}>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="panel p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Skeleton className="size-8 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-7 w-[72px]" />
          </div>
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}
