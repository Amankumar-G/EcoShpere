import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEnvironmentalGoal,
  deleteEnvironmentalGoal,
  getEnvironmentalGoals,
  updateEnvironmentalGoal,
} from './environmental-goals.api';
import { EnvironmentalGoalPayload } from '@/types/environmental.interface';

export const environmentalGoalsQueryKeys = {
  list: ['environmental-goals', 'list'] as const,
};

export const useEnvironmentalGoals = () =>
  useQuery({
    queryKey: environmentalGoalsQueryKeys.list,
    queryFn: getEnvironmentalGoals,
  });

const useInvalidateEnvironmentalGoals = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ['environmental-goals'] });
};

export const useCreateEnvironmentalGoal = () => {
  const invalidate = useInvalidateEnvironmentalGoals();
  return useMutation({
    mutationFn: createEnvironmentalGoal,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateEnvironmentalGoal = () => {
  const invalidate = useInvalidateEnvironmentalGoals();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EnvironmentalGoalPayload;
    }) => updateEnvironmentalGoal(id, payload),
    onSuccess: () => invalidate(),
  });
};

export const useDeleteEnvironmentalGoal = () => {
  const invalidate = useInvalidateEnvironmentalGoals();
  return useMutation({
    mutationFn: deleteEnvironmentalGoal,
    onSuccess: () => invalidate(),
  });
};
