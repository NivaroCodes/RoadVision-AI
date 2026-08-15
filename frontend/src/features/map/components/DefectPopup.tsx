import { Popup } from 'react-leaflet';
import type { DefectMarker } from '../types';
import { defectTypeLabels, defectStatusLabels, defectSeverityLabels } from '@/features/defects/labels';

interface DefectPopupProps {
  defect: DefectMarker;
}

export function DefectPopup({ defect }: DefectPopupProps) {
  const confidence = Math.min(100, Math.max(0, Math.round(defect.confidence * 100)));

  return (
    <Popup className="defect-popup" minWidth={220}>
      <div className="space-y-3">
        <div className="border-b border-border pb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Дефект #{defect.id}
          </p>
          <h3 className="text-base font-semibold text-foreground">{defectTypeLabels[defect.type]}</h3>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Статус</dt>
          <dd className="text-right font-medium text-foreground">{defectStatusLabels[defect.status]}</dd>
          <dt className="text-muted-foreground">Критичность</dt>
          <dd className="text-right font-medium capitalize text-foreground">
            {defectSeverityLabels[defect.severity]}
          </dd>
          <dt className="text-muted-foreground">Уверенность</dt>
          <dd className="text-right font-medium text-foreground">
            {confidence}%
          </dd>
        </dl>

        <p className="border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
          {defect.address ?? 'Шымкент'}
        </p>
      </div>
    </Popup>
  );
}
