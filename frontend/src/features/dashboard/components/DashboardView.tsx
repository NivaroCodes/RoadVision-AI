import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { SummaryCards } from './SummaryCards';
import { SummaryCardsSkeleton } from './SummaryCardsSkeleton';
import { TrendChart } from './TrendChart';
import { useSearchParams } from 'react-router-dom';
import { useDefects } from '@/features/defects/hooks/useDefects';
import { ReportExportDialog } from '@/features/reporting';
import { CalendarRange } from 'lucide-react';

export function DashboardView() {
  const [searchParams] = useSearchParams();
  const fromParam = searchParams.get('from') || undefined;
  const toParam = searchParams.get('to') || undefined;
  
  const { data, isLoading } = useDashboardSummary({ from: fromParam, to: toParam });
  const { data: defects = [] } = useDefects({ from: fromParam, to: toParam });

  const rangeParam = searchParams.get('range');
  const currentPeriodLabel = rangeParam === '1_day'
    ? `1 день (${fromParam})`
    : rangeParam === '30_days'
    ? `30 дней`
    : rangeParam === '12_months'
    ? `12 месяцев`
    : rangeParam === 'all'
    ? `Весь период`
    : fromParam && toParam
    ? `${fromParam} — ${toParam}`
    : "7 дней";

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-5">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="h-9 w-32 rounded-lg bg-surface/60 animate-pulse" />
          <div className="h-9 w-36 rounded-lg bg-surface/60 animate-pulse" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="panel min-h-[340px] animate-pulse bg-card" />
          <SummaryCardsSkeleton className="grid grid-cols-1 gap-3.5 sm:grid-cols-2" />
        </div>
      </div>
    );
  }

  const summaryData = data ?? {
    total_defects: 324,
    critical_defects: 37,
    fixed_defects: 201,
    in_progress_defects: 86,
  };

  return (
    <div className="space-y-4 md:space-y-5">
      <div className="flex flex-wrap items-center gap-2.5">
        <ReportExportDialog defects={defects} summary={summaryData} period={{ from: fromParam ?? undefined, to: toParam ?? undefined }} />
        <span className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/50 px-3 text-[12.5px] text-muted-foreground">
          <CalendarRange className="size-3.5 text-muted-foreground" /> Период: {currentPeriodLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 md:gap-5 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <TrendChart />
        <SummaryCards data={summaryData} className="grid grid-cols-1 gap-3.5 sm:grid-cols-2" />
      </div>
    </div>
  );
}
