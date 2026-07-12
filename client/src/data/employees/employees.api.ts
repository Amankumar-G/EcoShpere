import { apiClient } from '@/lib/axios/api-client';
import {
  EmployeeListResponse,
  EmployeeQuery,
} from '@/types/employee.interface';

export const getEmployees = async (
  query: EmployeeQuery,
): Promise<EmployeeListResponse> => {
  const { data } = await apiClient.get<EmployeeListResponse>('/employees', {
    params: query,
  });
  return data;
};
