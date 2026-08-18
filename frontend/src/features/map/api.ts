import { apiClient } from '@/api/client';
import type { DefectMarker } from './types';

export async function getMapDefects(params?: { from?: string; to?: string }): Promise<DefectMarker[]> {
  const response = await apiClient.get('/defects/map', {
    params: { start_date: params?.from, end_date: params?.to }
  });
  return response.data;
}
