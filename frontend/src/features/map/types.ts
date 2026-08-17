export type DefectType = 'crack' | 'pothole' | 'net' | 'road_collapse' | 'damaged_manhole' | 'other';
export type DefectStatus = 'submitted' | 'detected' | 'in_progress' | 'fixed' | 'verified' | 'rejected';
export type DefectSeverity = 'low' | 'medium' | 'high' | 'critical';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';
export type AnalysisStatus = 'pending' | 'completed' | 'failed';
export type VerificationStatus = 'pending' | 'verified' | 'not_verified' | 'failed' | 'manual_review';

export interface DefectMarker {
  id: number;
  type: DefectType | null;
  status: DefectStatus;
  severity: DefectSeverity | null;
  latitude: number;
  longitude: number;
  confidence: number | null;
  address: string | null;
  created_at: string;
  owner_id?: number | null;
  confirmation_count: number;
  priority: PriorityLevel;
  priority_reasons?: string[];
  analysis_status?: AnalysisStatus;
  assigned_to_id?: number | null;
  assigned_at?: string | null;
  after_image_url?: string | null;
  verification_status?: VerificationStatus;
  verification_confidence?: number | null;
  image_url?: string;
}

export interface DefectEvent {
  id: number;
  defect_id: number;
  actor_id: number | null;
  event_type: string;
  details: Record<string, string | number | boolean | null>;
  created_at: string;
}

export interface MapFilterValues {
  type: DefectType | 'all';
  severity: DefectSeverity | 'all';
  status: DefectStatus | 'all';
  query: string;
  minConfidence: number;
}
