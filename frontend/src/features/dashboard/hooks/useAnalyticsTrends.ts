import { useQuery } from '@tanstack/react-query';
import { getAnalyticsTrends } from '../api';
import type { TrendPoint } from '../types';

export function useAnalyticsTrends() {
  return useQuery<TrendPoint[], Error>({
    queryKey: ['analytics-trends'],
    queryFn: getAnalyticsTrends,
  });
}
