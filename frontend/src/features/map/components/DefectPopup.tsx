import { Popup } from 'react-leaflet';
import type { DefectMarker } from '../types';

const LABELS = {
  crack: 'Crack',
  pothole: 'Pothole',
  net: 'Net cracking',
  detected: 'Detected',
  in_progress: 'In progress',
  fixed: 'Fixed',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
} as const;

interface DefectPopupProps {
  defect: DefectMarker;
}

export function DefectPopup({ defect }: DefectPopupProps) {
  return (
    <Popup className="defect-popup" minWidth={220}>
      <div className="space-y-3">
        <div className="border-b border-border pb-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Defect #{defect.id}
          </p>
          <h3 className="text-base font-semibold text-foreground">{LABELS[defect.type]}</h3>
        </div>

        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="text-muted-foreground">Status</dt>
          <dd className="text-right font-medium text-foreground">{LABELS[defect.status]}</dd>
          <dt className="text-muted-foreground">Severity</dt>
          <dd className="text-right font-medium capitalize text-foreground">
            {LABELS[defect.severity]}
          </dd>
          <dt className="text-muted-foreground">Confidence</dt>
          <dd className="text-right font-medium text-foreground">
            {Math.round(defect.confidence * 100)}%
          </dd>
        </dl>

        <p className="border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground">
          {defect.address ?? 'Shymkent'}
        </p>
      </div>
    </Popup>
  );
}
