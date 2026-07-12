import { useMutation, useQueryClient } from '@tanstack/react-query';
import { runFleetCommuting } from '@/data/fleet-commuting/fleet-commuting.api';

export const useRunFleetCommuting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (period: string) => runFleetCommuting(period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emitted-emissions'] });
    },
  });
};
