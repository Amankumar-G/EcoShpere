import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmittedEmission,
  EmittedEmissionListFilters,
  FootprintFilters,
  getEmissionsFootprint,
  getEmittedEmissions,
} from '@/data/emitted-emissions/emitted-emissions.api';
import { EmittedEmissionPayload } from '@/types/emitted-emission.interface';

export const emittedEmissionsQueryKeys = {
  list: (filters: EmittedEmissionListFilters) =>
    ['emitted-emissions', 'list', filters] as const,
  footprint: (filters: FootprintFilters) =>
    ['emitted-emissions', 'footprint', filters] as const,
};

export const useEmittedEmissions = (
  filters: EmittedEmissionListFilters = {},
) => {
  return useQuery({
    queryKey: emittedEmissionsQueryKeys.list(filters),
    queryFn: () => getEmittedEmissions(filters),
  });
};

export const useEmissionsFootprint = (filters: FootprintFilters) => {
  return useQuery({
    queryKey: emittedEmissionsQueryKeys.footprint(filters),
    queryFn: () => getEmissionsFootprint(filters),
  });
};

const useInvalidateEmittedEmissions = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ['emitted-emissions'] });
};

export const useCreateEmittedEmission = () => {
  const invalidate = useInvalidateEmittedEmissions();
  return useMutation({
    mutationFn: (payload: EmittedEmissionPayload) =>
      createEmittedEmission(payload),
    onSuccess: invalidate,
  });
};
