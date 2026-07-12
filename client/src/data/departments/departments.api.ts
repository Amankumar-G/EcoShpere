import { apiClient } from '@/lib/axios/api-client';
import { Department } from '@/types/department.interface';

export const getDepartments = async (): Promise<Department[]> => {
  const { data } = await apiClient.get<Department[]>('/departments');
  return data;
};
