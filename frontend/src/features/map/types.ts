export type DefectType = 'crack' | 'pothole' | 'net' | 'road_collapse' | 'damaged_manhole' | 'other';
export type DefectStatus = 'submitted' | 'detected' | 'in_progress' | 'fixed' | 'verified' | 'rejected';
export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface DefectMarker {
  id: number;
  type: DefectType | null;
  status: DefectStatus;
  severity: DefectSeverity | null;
  latitude: number;
  longitude: number;
  confidence: number | null;
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
