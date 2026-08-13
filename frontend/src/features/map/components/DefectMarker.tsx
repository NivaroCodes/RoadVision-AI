import { useMemo } from 'react';
import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { DefectPopup } from './DefectPopup';
import { getMarkerColor } from '../utils/getMarkerColor';
import type { DefectMarker as DefectMarkerData } from '../types';

interface DefectMarkerProps {
  defect: DefectMarkerData;
}

export function DefectMarker({ defect }: DefectMarkerProps) {
  const icon = useMemo(() => {
    const color = getMarkerColor(defect.severity);

    return L.divIcon({
      className: 'defect-marker-shell',
      html: `<span class="defect-marker" style="--marker-color: ${color}" aria-hidden="true"><span></span></span>`,
      iconSize: [32, 38],
      iconAnchor: [16, 38],
      popupAnchor: [0, -34],
    });
  }, [defect.severity]);

  return (
    <Marker
      position={[defect.latitude, defect.longitude]}
      icon={icon}
      title={`Defect #${defect.id}: ${defect.type}`}
    >
      <DefectPopup defect={defect} />
    </Marker>
  );
}
