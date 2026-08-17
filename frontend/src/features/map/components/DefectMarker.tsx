import L from 'leaflet';
import { Marker } from 'react-leaflet';
import { defectTypeLabels } from '@/features/defects/labels';
import { DefectPopup } from './DefectPopup';
import { getMarkerColor } from '../utils/getMarkerColor';
import type { DefectMarker as DefectMarkerData, DefectSeverity } from '../types';

interface DefectMarkerProps { defect: DefectMarkerData; }
const MARKER_ICONS = { low: createMarkerIcon('low'), medium: createMarkerIcon('medium'), high: createMarkerIcon('high'), critical: createMarkerIcon('critical') } as const;
const PENDING_ICON = L.divIcon({ className: 'defect-marker-shell', html: '<span class="defect-marker" style="--marker-color:#8b5cf6" aria-hidden="true"><span></span></span>', iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -34] });
function createMarkerIcon(severity: DefectSeverity): L.DivIcon { const color = getMarkerColor(severity); return L.divIcon({ className: 'defect-marker-shell', html: `<span class="defect-marker" style="--marker-color:${color}" aria-hidden="true"><span></span></span>`, iconSize: [32, 38], iconAnchor: [16, 38], popupAnchor: [0, -34] }); }
export function DefectMarker({ defect }: DefectMarkerProps) { return <Marker position={[defect.latitude, defect.longitude]} icon={defect.severity ? MARKER_ICONS[defect.severity] : PENDING_ICON} title={`Дефект #${defect.id}: ${defect.type ? defectTypeLabels[defect.type] : 'Ожидает анализа'}`}><DefectPopup defect={defect} /></Marker>; }
