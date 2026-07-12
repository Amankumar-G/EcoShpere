import { apiClient } from '@/lib/axios/api-client';
import { Department, DepartmentPayload } from '@/types/department.interface';

export const getDepartments = async (): Promise<Department[]> => {
  const { data } = await apiClient.get<Department[]>('/departments');
  return data;
};

export const createDepartment = async (
  payload: DepartmentPayload,
): Promise<Department> => {
  const { data } = await apiClient.post<Department>('/departments', payload);
  return data;
};

export const updateDepartment = async (
  id: number,
  payload: DepartmentPayload,
): Promise<Department> => {
  const { data } = await apiClient.patch<Department>(
    `/departments/${id}`,
    payload,
  );
  return data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await apiClient.delete(`/departments/${id}`);
};
