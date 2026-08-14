import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../api';
import type { DashboardSummary } from '../types';

export const useDashboardSummary = () => {
  return useQuery<DashboardSummary, Error>({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });
};
