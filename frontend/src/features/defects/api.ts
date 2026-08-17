import { apiClient } from '@/api/client';
import type { DefectEvent, DefectMarker, DefectSeverity, DefectStatus, DefectType, VerificationStatus } from '@/features/map/types';

export async function getDefects(params?: { from?: string; to?: string }): Promise<DefectMarker[]> {
  const response = await apiClient.get('/defects/', {
    params: { start_date: params?.from, end_date: params?.to }
  });
  return response.data;
}

export interface UpdateDefectPayload {
  id: number;
  data: {
    status?: DefectStatus;
    severity?: DefectSeverity;
  };
}

export interface AnalysisPayload {
  detected: boolean;
  defect_type: DefectType | null;
  confidence: number;
  severity: DefectSeverity | null;
}

export interface VerificationResult {
  defect_id: number;
  status: VerificationStatus;
  confidence: number | null;
  after_image_url: string;
}

export async function updateDefect({ id, data }: UpdateDefectPayload): Promise<DefectMarker> {
  const response = await apiClient.patch(`/defects/${id}`, data);
  return response.data;
}

export async function getDefect(id: number): Promise<DefectMarker> {
  const response = await apiClient.get(`/defects/${id}`);
  return response.data;
}

export async function getDefectEvents(id: number): Promise<DefectEvent[]> {
  const response = await apiClient.get(`/defects/${id}/events`);
  return response.data;
}

export async function analyzeDefect(id: number, data: AnalysisPayload): Promise<DefectMarker> {
  const response = await apiClient.post(`/defects/${id}/analysis`, data);
  return response.data;
}

export async function assignDefect(id: number, roadServiceUserId: number): Promise<DefectMarker> {
  const response = await apiClient.post(`/defects/${id}/assign`, { road_service_user_id: roadServiceUserId });
  return response.data;
}

export async function uploadAfterImage(id: number, image: File): Promise<VerificationResult> {
  const formData = new FormData();
  formData.append('image', image);
  const response = await apiClient.post(`/defects/${id}/after-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
