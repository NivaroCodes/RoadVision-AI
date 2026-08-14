import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { SummaryCards } from './SummaryCards';
import { SummaryCardsSkeleton } from './SummaryCardsSkeleton';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardView() {
  const { data, isLoading, isError, refetch } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Загрузка аналитики...</p>
        </div>
        <SummaryCardsSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        </div>
        <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/20 bg-destructive/5 p-8 text-center animate-in fade-in zoom-in-95 duration-300">
          <div className="rounded-full bg-destructive/10 p-3 mb-4">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-1">Не удалось загрузить аналитику</h3>
          <p className="text-sm text-muted-foreground max-w-[400px] mb-6">
            Произошла ошибка при подключении к серверу. Пожалуйста, проверьте подключение или попробуйте снова.
          </p>
          <Button variant="outline" onClick={() => refetch()} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Попробуйте обновить страницу
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Ключевые показатели системы обнаружения дорожных дефектов.</p>
      </div>
      <SummaryCards data={data} />
    </div>
  );
}
