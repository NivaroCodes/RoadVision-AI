import { apiClient } from '@/api/client';
import type { DashboardSummary, TrendPoint } from './types';

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>('/analytics/summary');
  return response.data;
};

export const getAnalyticsTrends = async (): Promise<TrendPoint[]> => {
  const response = await apiClient.get<TrendPoint[]>('/analytics/trends');
  return response.data;
};
