import { apiClient } from '@/lib/axios/api-client';
import {
  Employee,
  EmployeeListResponse,
  EmployeePayload,
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

export const createEmployee = async (
  payload: EmployeePayload,
): Promise<Employee> => {
  const { data } = await apiClient.post<Employee>('/employees', payload);
  return data;
};

export const updateEmployee = async (
  id: number,
  payload: Partial<EmployeePayload>,
): Promise<Employee> => {
  const { data } = await apiClient.patch<Employee>(`/employees/${id}`, payload);
  return data;
};

export const deleteEmployee = async (id: number): Promise<void> => {
  await apiClient.delete(`/employees/${id}`);
};
