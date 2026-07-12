import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createAssignationRule,
  deleteAssignationRule,
  getAssignationRule,
  getAssignationRules,
  updateAssignationRule,
} from '@/data/assignation-rules/assignation-rules.api';
import { AssignationRulePayload } from '@/types/assignation-rule.interface';

export const assignationRulesQueryKeys = {
  list: ['assignation-rules', 'list'] as const,
  detail: (id: number) => ['assignation-rules', 'detail', id] as const,
};

export const useAssignationRules = () => {
  return useQuery({
    queryKey: assignationRulesQueryKeys.list,
    queryFn: getAssignationRules,
  });
};

export const useAssignationRule = (id: number) => {
  return useQuery({
    queryKey: assignationRulesQueryKeys.detail(id),
    queryFn: () => getAssignationRule(id),
    enabled: Number.isFinite(id),
  });
};

const useInvalidateAssignationRules = () => {
  const queryClient = useQueryClient();
  return (id?: number) => {
    queryClient.invalidateQueries({ queryKey: assignationRulesQueryKeys.list });
    if (id !== undefined) {
      queryClient.invalidateQueries({
        queryKey: assignationRulesQueryKeys.detail(id),
      });
    }
  };
};

export const useCreateAssignationRule = () => {
  const invalidate = useInvalidateAssignationRules();
  return useMutation({
    mutationFn: (payload: AssignationRulePayload) =>
      createAssignationRule(payload),
    onSuccess: () => invalidate(),
  });
};

export const useUpdateAssignationRule = () => {
  const invalidate = useInvalidateAssignationRules();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<AssignationRulePayload>;
    }) => updateAssignationRule(id, payload),
    onSuccess: (_data, variables) => invalidate(variables.id),
  });
};

export const useDeleteAssignationRule = () => {
  const invalidate = useInvalidateAssignationRules();
  return useMutation({
    mutationFn: (id: number) => deleteAssignationRule(id),
    onSuccess: () => invalidate(),
  });
};
