import { useQuery } from '@tanstack/react-query';
import { getEmployees } from '@/data/employees/employees.api';

export const employeesQueryKeys = {
  count: ['employees', 'count'] as const,
};

export const useEmployeeCount = (enabled: boolean) => {
  return useQuery({
    queryKey: employeesQueryKeys.count,
    queryFn: async () => {
      const { total } = await getEmployees({ page: 1, pageSize: 1 });
      return total;
    },
    enabled,
    retry: false,
  });
};
