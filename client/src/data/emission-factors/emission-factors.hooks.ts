import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  addGasLine,
  createEmissionFactor,
  deleteEmissionFactor,
  EmissionFactorListFilters,
  getEmissionFactor,
  getEmissionFactors,
  removeGasLine,
  updateEmissionFactor,
  updateGasLine,
} from '@/data/emission-factors/emission-factors.api';
import {
  EmissionFactorPayload,
  GasLinePayload,
} from '@/types/emission-factor.interface';

export const emissionFactorsQueryKeys = {
  list: (filters: EmissionFactorListFilters) =>
    ['emission-factors', 'list', filters] as const,
  detail: (id: number) => ['emission-factors', 'detail', id] as const,
};

export const useEmissionFactors = (filters: EmissionFactorListFilters = {}) => {
  return useQuery({
    queryKey: emissionFactorsQueryKeys.list(filters),
    queryFn: () => getEmissionFactors(filters),
  });
};

export const useEmissionFactor = (id: number) => {
  return useQuery({
    queryKey: emissionFactorsQueryKeys.detail(id),
    queryFn: () => getEmissionFactor(id),
    enabled: Number.isFinite(id),
  });
};

const useInvalidateEmissionFactors = () => {
  const queryClient = useQueryClient();
  return (id?: number) => {
    queryClient.invalidateQueries({ queryKey: ['emission-factors', 'list'] });
    if (id !== undefined) {
      queryClient.invalidateQueries({
        queryKey: emissionFactorsQueryKeys.detail(id),
      });
    }
  };
};

export const useCreateEmissionFactor = () => {
  const invalidate = useInvalidateEmissionFactors();
  return useMutation({
    mutationFn: (payload: EmissionFactorPayload) =>
      createEmissionFactor(payload),
    onSuccess: () => invalidate(),
  });
};

export const useUpdateEmissionFactor = () => {
  const invalidate = useInvalidateEmissionFactors();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<EmissionFactorPayload>;
    }) => updateEmissionFactor(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
};

export const useDeleteEmissionFactor = () => {
  const invalidate = useInvalidateEmissionFactors();
  return useMutation({
    mutationFn: (id: number) => deleteEmissionFactor(id),
    onSuccess: () => invalidate(),
  });
};

export const useAddGasLine = (factorId: number) => {
  const invalidate = useInvalidateEmissionFactors();
  return useMutation({
    mutationFn: (payload: GasLinePayload) => addGasLine(factorId, payload),
    onSuccess: () => invalidate(factorId),
  });
};

export const useUpdateGasLine = (factorId: number) => {
  const invalidate = useInvalidateEmissionFactors();
  return useMutation({
    mutationFn: ({
      lineId,
      payload,
    }: {
      lineId: number;
      payload: Partial<GasLinePayload>;
    }) => updateGasLine(factorId, lineId, payload),
    onSuccess: () => invalidate(factorId),
  });
};

export const useRemoveGasLine = (factorId: number) => {
  const invalidate = useInvalidateEmissionFactors();
  return useMutation({
    mutationFn: (lineId: number) => removeGasLine(factorId, lineId),
    onSuccess: () => invalidate(factorId),
  });
};
