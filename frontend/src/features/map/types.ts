export type DefectType = 'crack' | 'pothole' | 'net';
export type DefectStatus = 'detected' | 'in_progress' | 'fixed' | 'rejected';
export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DefectMarker {
  id: number;
  type: DefectType;
  status: DefectStatus;
  severity: DefectSeverity;
  latitude: number;
  longitude: number;
  confidence: number;
  address?: string;
  created_at?: string;
}

export interface MapFilterValues {
  type: DefectType | 'all';
  severity: DefectSeverity | 'all';
  status: DefectStatus | 'all';
  query: string;
  minConfidence: number;
}
