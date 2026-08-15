import { useQuery } from '@tanstack/react-query';
import { getDefects } from '../api';

export function useDefects() {
  return useQuery({
    queryKey: ['defects'],
    queryFn: getDefects,
  });
}
