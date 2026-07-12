import { useQuery } from '@tanstack/react-query';
import { getDepartments } from '@/data/departments/departments.api';

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
