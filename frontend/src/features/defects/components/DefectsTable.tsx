import type { KeyboardEvent } from 'react';
import type { DefectMarker } from '@/features/map/types';
import { defectTypeLabels } from '../labels';
import { SeverityBadge, StatusBadge } from './DefectBadges';
import { cn } from '@/lib/utils';
import { PanelHeader } from '@/components/layout/PanelHeader';

interface DefectsTableProps {
  defects: readonly DefectMarker[];
  onSelect: (defect: DefectMarker) => void;
}

export function DefectsTable({ defects, onSelect }: DefectsTableProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLTableRowElement>, defect: DefectMarker) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(defect);
    }
  };

  return (
    <section className="panel overflow-hidden">
      <PanelHeader title="Дефекты" meta="Обновлено только что" />

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              {["ID", "Приоритет", "Тип", "Критичность", "Статус", "Уверенность ИИ", "Адрес"].map(
                (h, i) => (
                  <th
                    key={h}
                    className={cn(
                      "px-5 py-2.5 text-left text-eyebrow",
                      i === 5 && "text-right",
                    )}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {defects.map((defect) => (
              <tr
                key={defect.id}
                tabIndex={0}
                role="button"
                aria-label={`Редактировать дефект ${defect.id}`}
                onClick={() => onSelect(defect)}
                onKeyDown={(event) => handleKeyDown(event, defect)}
                className="cursor-pointer transition-colors hover:bg-accent/60 outline-none focus-visible:bg-accent"
              >
                <td className="num px-5 py-3 text-[12.5px] font-semibold text-foreground">
                  #{defect.id}
                </td>
                <td className="px-5 py-3 text-[12.5px] text-muted-foreground capitalize">
                  {defect.priority}
                </td>
                <td className="px-5 py-3 text-[12.5px] font-medium text-foreground">
                  {defect.type ? defectTypeLabels[defect.type] : 'Ожидает анализа'}
                </td>
                <td className="px-5 py-3">
                  <SeverityBadge severity={defect.severity} />
                </td>
                <td className="px-5 py-3">
                  <StatusBadge status={defect.status} />
                </td>
                <td className="num px-5 py-3 text-right text-[12.5px] font-semibold text-foreground">
                  {defect.confidence === null ? '—' : `${Math.round(defect.confidence * 100)}%`}
                </td>
                <td className="px-5 py-3 text-[12.5px] text-muted-foreground max-w-72 truncate">
                  <span className="block truncate" title={defect.address ?? 'Адрес не указан'}>
                    {defect.address ?? 'Адрес не указан'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
