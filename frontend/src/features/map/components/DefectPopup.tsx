import { Popup } from 'react-leaflet';
import type { DefectMarker } from '../types';
import { defectTypeLabels, defectStatusLabels, defectSeverityLabels } from '@/features/defects/labels';
import { severityClasses, statusChip } from '@/lib/roadvision-data';
import { cn } from '@/lib/utils';

interface DefectPopupProps {
  defect: DefectMarker;
}

export function DefectPopup({ defect }: DefectPopupProps) {
  const confidence = defect.confidence === null ? null : Math.min(100, Math.max(0, Math.round(defect.confidence * 100)));
  const typeText = defect.type ? defectTypeLabels[defect.type] : 'Дефект дороги';
  const severity = defect.severity ?? 'low';

  return (
    <Popup className="defect-popup" minWidth={240}>
      <div className="space-y-3 p-1">
        <div className="border-b border-border pb-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-[14px] font-semibold text-foreground">
              {typeText}
            </h3>
            <span className="num text-[12px] font-bold text-muted-foreground">
              #{defect.id}
            </span>
          </div>
          <p className="mt-0.5 text-[11.5px] text-muted-foreground">
            {defect.address ?? `${defect.latitude.toFixed(4)}, ${defect.longitude.toFixed(4)}`}
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-2 text-[12px]">
          <div className="rounded-lg border border-border bg-surface/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Критичность</dt>
            <dd className="mt-0.5">
              <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10.5px] font-semibold", severityClasses[severity]?.chip)}>
                {defect.severity ? defectSeverityLabels[defect.severity] : 'Не указана'}
              </span>
            </dd>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Статус</dt>
            <dd className="mt-0.5">
              <span className={cn("inline-block rounded px-1.5 py-0.5 text-[10.5px] font-semibold", statusChip[defect.status])}>
                {defectStatusLabels[defect.status] ?? defect.status}
              </span>
            </dd>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">Приоритет</dt>
            <dd className="mt-0.5 font-semibold text-foreground capitalize">
              {defect.priority ?? '—'}
            </dd>
          </div>

          <div className="rounded-lg border border-border bg-surface/50 p-2">
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">ИИ Уверенность</dt>
            <dd className="num mt-0.5 font-semibold text-foreground">
              {confidence === null ? '—' : `${confidence}%`}
            </dd>
          </div>
        </dl>
      </div>
    </Popup>
  );
}
