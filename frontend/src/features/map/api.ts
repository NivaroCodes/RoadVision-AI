import { apiClient } from '@/api/client';
import type { DefectMarker } from './types';

export async function getMapDefects(): Promise<DefectMarker[]> {
  const response = await apiClient.get('/defects/map');
  return response.data;
}
