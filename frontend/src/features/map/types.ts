export type DefectType = 'crack' | 'pothole' | 'net';
export type DefectStatus = 'detected' | 'in_progress' | 'fixed';
export type DefectSeverity = 'low' | 'medium' | 'high';

export interface DefectMarker {
  id: number;
  type: DefectType;
  status: DefectStatus;
  severity: DefectSeverity;
  latitude: number;
  longitude: number;
  confidence: number;
  address?: string;
}

export interface MapFilterValues {
  type: DefectType | 'all';
  severity: DefectSeverity | 'all';
  status: DefectStatus | 'all';
  query: string;
  minConfidence: number;
}
