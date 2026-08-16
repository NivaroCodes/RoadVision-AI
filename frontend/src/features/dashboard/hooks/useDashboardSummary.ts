import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api';
import type { DashboardSummary } from '../types';

export const useDashboardSummary = (params?: { from?: string; to?: string }) => {
  return useQuery<DashboardSummary, Error>({
    queryKey: ['dashboard-summary', params],
    queryFn: () => getDashboardSummary(params),
  });
};
