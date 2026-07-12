import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from '@/data/departments/departments.api';
import { DepartmentPayload } from '@/types/department.interface';

export const departmentsQueryKeys = {
  list: ['departments', 'list'] as const,
  count: ['departments', 'count'] as const,
};

export const useDepartments = (enabled: boolean) => {
  return useQuery({
    queryKey: departmentsQueryKeys.list,
    queryFn: getDepartments,
    enabled,
    retry: false,
  });
};

export const useDepartmentCount = (enabled: boolean) => {
  return useQuery({
    queryKey: departmentsQueryKeys.count,
    queryFn: async () => (await getDepartments()).length,
    enabled,
    retry: false,
  });
};

const useInvalidateDepartments = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: departmentsQueryKeys.list });
};

export const useCreateDepartment = () => {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (payload: DepartmentPayload) => createDepartment(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateDepartment = () => {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DepartmentPayload }) =>
      updateDepartment(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteDepartment = () => {
  const invalidate = useInvalidateDepartments();
  return useMutation({
    mutationFn: (id: number) => deleteDepartment(id),
    onSuccess: invalidate,
  });
};
