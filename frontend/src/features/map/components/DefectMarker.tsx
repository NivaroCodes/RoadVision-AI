import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { defectTypeLabels } from '@/features/defects/labels';
import { DefectPopup } from './DefectPopup';
import type { DefectMarker as DefectMarkerData, DefectSeverity } from '../types';

interface DefectMarkerProps {
  defect: DefectMarkerData;
}

const severityPinColors: Record<DefectSeverity, { bg: string; border: string; glow: string }> = {
  critical: { bg: '#dc2626', border: '#f87171', glow: 'rgba(239, 68, 68, 0.5)' },
  high: { bg: '#ea580c', border: '#fb923c', glow: 'rgba(249, 115, 22, 0.5)' },
  medium: { bg: '#ca8a04', border: '#fde047', glow: 'rgba(234, 179, 8, 0.5)' },
  low: { bg: '#2563eb', border: '#60a5fa', glow: 'rgba(37, 99, 235, 0.5)' },
};

function createPinIcon(severity: DefectSeverity): L.DivIcon {
  const conf = severityPinColors[severity] || severityPinColors.low;
  return L.divIcon({
    className: 'defect-pin-wrapper',
    html: `
      <div class="defect-locator-pin" style="--pin-bg: ${conf.bg}; --pin-border: ${conf.border}; --pin-glow: ${conf.glow};">
        <div class="pin-head">
          <svg class="pin-svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
          </svg>
        </div>
        <div class="pin-point"></div>
        <div class="pin-pulse-shadow"></div>
      </div>
    `,
    iconSize: [28, 36],
    iconAnchor: [14, 34],
    popupAnchor: [0, -32],
  });
}

const PIN_ICONS = {
  low: createPinIcon('low'),
  medium: createPinIcon('medium'),
  high: createPinIcon('high'),
  critical: createPinIcon('critical'),
} as const;

const PENDING_PIN_ICON = L.divIcon({
  className: 'defect-pin-wrapper',
  html: `
    <div class="defect-locator-pin" style="--pin-bg: #7c3aed; --pin-border: #a78bfa; --pin-glow: rgba(124, 58, 237, 0.5);">
      <div class="pin-head">
        <svg class="pin-svg-icon" viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="pin-point"></div>
      <div class="pin-pulse-shadow"></div>
    </div>
  `,
  iconSize: [28, 36],
  iconAnchor: [14, 34],
  popupAnchor: [0, -32],
});

export function DefectMarker({ defect }: DefectMarkerProps) {
  return (
    <Marker
      position={[defect.latitude, defect.longitude]}
      icon={defect.severity ? PIN_ICONS[defect.severity] : PENDING_PIN_ICON}
      title={`Дефект #${defect.id}: ${defect.address ?? (defect.type ? defectTypeLabels[defect.type] : 'Дефект')}`}
    >
      <DefectPopup defect={defect} />
    </Marker>
  );
}
