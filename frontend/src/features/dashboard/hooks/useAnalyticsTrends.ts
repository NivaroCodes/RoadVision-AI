import { useQuery } from '@tanstack/react-query';
import { getAnalyticsTrends } from '../api';
import type { TrendPoint } from '../types';

export function useAnalyticsTrends(params?: { from?: string; to?: string }) {
  return useQuery<TrendPoint[], Error>({
    queryKey: ['analytics-trends', params],
    queryFn: () => getAnalyticsTrends(params),
  });
}
