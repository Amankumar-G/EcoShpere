import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createEmployee,
  deleteEmployee,
  getEmployees,
  updateEmployee,
} from '@/data/employees/employees.api';
import { EmployeePayload, EmployeeQuery } from '@/types/employee.interface';

export const employeesQueryKeys = {
  count: ['employees', 'count'] as const,
  list: (query: EmployeeQuery) => ['employees', 'list', query] as const,
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

export const useEmployees = (query: EmployeeQuery) => {
  return useQuery({
    queryKey: employeesQueryKeys.list(query),
    queryFn: () => getEmployees(query),
  });
};

export const useEmployeeOptions = () => {
  return useQuery({
    queryKey: employeesQueryKeys.list({ page: 1, pageSize: 200 }),
    queryFn: () => getEmployees({ page: 1, pageSize: 200 }),
  });
};

const useInvalidateEmployees = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['employees'] });
};

export const useCreateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (payload: EmployeePayload) => createEmployee(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<EmployeePayload>;
    }) => updateEmployee(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteEmployee = () => {
  const invalidate = useInvalidateEmployees();
  return useMutation({
    mutationFn: (id: number) => deleteEmployee(id),
    onSuccess: invalidate,
  });
};
