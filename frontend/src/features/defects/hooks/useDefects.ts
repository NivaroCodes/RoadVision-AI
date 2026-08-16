import { useQuery } from '@tanstack/react-query';
import { getDefects } from '../api';

export function useDefects(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['defects', params],
    queryFn: () => getDefects(params),
  });
}
