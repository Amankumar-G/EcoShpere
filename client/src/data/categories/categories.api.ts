import { apiClient } from '@/lib/axios/api-client';
import {
  Category,
  CategoryPayload,
  CategoryType,
} from '@/types/category.interface';

export const getCategories = async (
  type?: CategoryType,
): Promise<Category[]> => {
  const { data } = await apiClient.get<Category[]>('/categories', {
    params: type ? { type } : undefined,
  });
  return data;
};

export const createCategory = async (
  payload: CategoryPayload,
): Promise<Category> => {
  const { data } = await apiClient.post<Category>('/categories', payload);
  return data;
};

export const updateCategory = async (
  id: number,
  payload: CategoryPayload,
): Promise<Category> => {
  const { data } = await apiClient.patch<Category>(
    `/categories/${id}`,
    payload,
  );
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  await apiClient.delete(`/categories/${id}`);
};
