import { apiClient } from '@/api/client';
import type { DashboardSummary, TrendPoint } from './types';

export const getDashboardSummary = async (params?: { from?: string; to?: string }): Promise<DashboardSummary> => {
  const response = await apiClient.get<DashboardSummary>('/analytics/summary', {
    params: { start_date: params?.from, end_date: params?.to }
  });
  return response.data;
};

export const getAnalyticsTrends = async (params?: { from?: string; to?: string }): Promise<TrendPoint[]> => {
  const response = await apiClient.get<TrendPoint[]>('/analytics/trends', {
    params: { start_date: params?.from, end_date: params?.to }
  });
  return response.data;
};
