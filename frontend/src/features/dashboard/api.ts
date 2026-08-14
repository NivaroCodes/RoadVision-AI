import { apiClient } from '@/api/client';
import type { DashboardSummary } from './types';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>('/analytics/summary');
  return response.data;
};
