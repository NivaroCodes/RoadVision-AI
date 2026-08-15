import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDefect } from '../api';
import type { UpdateDefectPayload } from '../api';

export function useUpdateDefect() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateDefectPayload) => updateDefect(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['defects'] });
      queryClient.invalidateQueries({ queryKey: ['map-defects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      queryClient.invalidateQueries({ queryKey: ['analytics-trends'] });
    },
  });
}
