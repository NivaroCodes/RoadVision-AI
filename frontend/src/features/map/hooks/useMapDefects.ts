import { useQuery } from '@tanstack/react-query';
import { getMapDefects } from '../api';

export function useMapDefects() {
  return useQuery({
    queryKey: ['map-defects'],
    queryFn: getMapDefects,
  });
}
