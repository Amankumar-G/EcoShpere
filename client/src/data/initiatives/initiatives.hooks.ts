import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInitiative,
  deleteInitiative,
  getInitiatives,
  updateInitiative,
} from './initiatives.api';
import { InitiativePayload } from '@/types/environmental.interface';

export const initiativesQueryKeys = {
  list: ['initiatives', 'list'] as const,
};

export const useInitiatives = () =>
  useQuery({
    queryKey: initiativesQueryKeys.list,
    queryFn: getInitiatives,
  });

const useInvalidateInitiatives = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['initiatives'] });
};

export const useCreateInitiative = () => {
  const invalidate = useInvalidateInitiatives();
  return useMutation({
    mutationFn: createInitiative,
    onSuccess: () => invalidate(),
  });
};

export const useUpdateInitiative = () => {
  const invalidate = useInvalidateInitiatives();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: InitiativePayload }) =>
      updateInitiative(id, payload),
    onSuccess: () => invalidate(),
  });
};

export const useDeleteInitiative = () => {
  const invalidate = useInvalidateInitiatives();
  return useMutation({
    mutationFn: deleteInitiative,
    onSuccess: () => invalidate(),
  });
};
