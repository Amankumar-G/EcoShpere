import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmissionScope,
  deleteEmissionScope,
  getEmissionScopeTree,
  updateEmissionScope,
} from '@/data/emission-scopes/emission-scopes.api';
import { EmissionScopePayload } from '@/types/emission-scope.interface';

export const emissionScopesQueryKeys = {
  tree: ['emission-scopes', 'tree'] as const,
};

export const useEmissionScopeTree = () => {
  return useQuery({
    queryKey: emissionScopesQueryKeys.tree,
    queryFn: getEmissionScopeTree,
  });
};

const useInvalidateEmissionScopes = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: emissionScopesQueryKeys.tree });
};

export const useCreateEmissionScope = () => {
  const invalidate = useInvalidateEmissionScopes();
  return useMutation({
    mutationFn: (payload: EmissionScopePayload) => createEmissionScope(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateEmissionScope = () => {
  const invalidate = useInvalidateEmissionScopes();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EmissionScopePayload;
    }) => updateEmissionScope(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteEmissionScope = () => {
  const invalidate = useInvalidateEmissionScopes();
  return useMutation({
    mutationFn: (id: number) => deleteEmissionScope(id),
    onSuccess: invalidate,
  });
};
