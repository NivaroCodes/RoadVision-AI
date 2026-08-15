import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { DefectPopup } from './DefectPopup';
import { getMarkerColor } from '../utils/getMarkerColor';
import type { DefectMarker as DefectMarkerData } from '../types';

interface DefectMarkerProps {
  defect: DefectMarkerData;
}

const MARKER_ICONS = {
  low: createMarkerIcon('low'),
  medium: createMarkerIcon('medium'),
  high: createMarkerIcon('high'),
  critical: createMarkerIcon('critical'),
} as const;

function createMarkerIcon(severity: DefectMarkerData['severity']): L.DivIcon {
  const color = getMarkerColor(severity);

  return L.divIcon({
      className: 'defect-marker-shell',
      html: `<span class="defect-marker" style="--marker-color:${color}" aria-hidden="true"><span></span></span>`,
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -34],
  });
}

export function DefectMarker({ defect }: DefectMarkerProps) {
  return (
    <Marker
      position={[defect.latitude, defect.longitude]}
      icon={MARKER_ICONS[defect.severity]}
      title={`Defect #${defect.id}: ${defect.type}`}
    >
      <DefectPopup defect={defect} />
    </Marker>
  );
}
