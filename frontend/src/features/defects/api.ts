import { apiClient } from '@/api/client';
import type { DefectMarker, DefectStatus, DefectSeverity } from '@/features/map/types';

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

export async function updateDefect({ id, data }: UpdateDefectPayload): Promise<DefectMarker> {
  const response = await apiClient.patch(`/defects/${id}`, data);
  return response.data;
}
