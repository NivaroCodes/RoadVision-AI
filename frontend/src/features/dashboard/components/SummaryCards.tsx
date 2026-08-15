import { SummaryCard } from './SummaryCard';
import type { DashboardSummary } from '../types';
import { AlertTriangle, CheckCircle, MapPinned, Wrench } from 'lucide-react';

interface SummaryCardsProps {
  data: DashboardSummary;
}

export function SummaryCards({ data }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 grid-cols-2">
      <SummaryCard
        title="Всего дефектов"
        value={data.total_defects}
        icon={MapPinned}
        iconColorClass="text-blue-500"
      />
      <SummaryCard
        title="Критические"
        value={data.critical_defects}
        icon={AlertTriangle}
        iconColorClass="text-red-500"
      />
      <SummaryCard
        title="В работе"
        value={data.in_progress_defects}
        icon={Wrench}
        iconColorClass="text-orange-500"
      />
      <SummaryCard
        title="Устранено"
        value={data.fixed_defects}
        icon={CheckCircle}
        iconColorClass="text-green-500"
      />
    </div>
  );
}
