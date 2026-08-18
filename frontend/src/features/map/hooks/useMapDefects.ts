import { useQuery } from '@tanstack/react-query';
import { getMapDefects } from '../api';

export function useMapDefects(params?: { from?: string; to?: string }) {
  return useQuery({
    queryKey: ['map-defects', params],
    queryFn: () => getMapDefects(params),
  });
}
