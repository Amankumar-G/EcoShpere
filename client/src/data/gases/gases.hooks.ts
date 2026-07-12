import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createGas,
  deleteGas,
  getGases,
  updateGas,
} from '@/data/gases/gases.api';
import { GasPayload } from '@/types/gas.interface';

export const gasesQueryKeys = {
  list: ['gases', 'list'] as const,
};

export const useGases = () => {
  return useQuery({
    queryKey: gasesQueryKeys.list,
    queryFn: getGases,
  });
};

const useInvalidateGases = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: gasesQueryKeys.list });
};

export const useCreateGas = () => {
  const invalidate = useInvalidateGases();
  return useMutation({
    mutationFn: (payload: GasPayload) => createGas(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateGas = () => {
  const invalidate = useInvalidateGases();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: GasPayload }) =>
      updateGas(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteGas = () => {
  const invalidate = useInvalidateGases();
  return useMutation({
    mutationFn: (id: number) => deleteGas(id),
    onSuccess: invalidate,
  });
};
