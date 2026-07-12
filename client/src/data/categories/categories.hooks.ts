import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '@/data/categories/categories.api';
import { CategoryPayload, CategoryType } from '@/types/category.interface';

export const categoriesQueryKeys = {
  list: (type?: CategoryType) => ['categories', 'list', type ?? 'all'] as const,
};

export const useCategories = (type?: CategoryType) => {
  return useQuery({
    queryKey: categoriesQueryKeys.list(type),
    queryFn: () => getCategories(type),
  });
};

const useInvalidateCategories = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: ['categories', 'list'] });
};

export const useCreateCategory = () => {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => createCategory(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateCategory = () => {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) =>
      updateCategory(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteCategory = () => {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: invalidate,
  });
};
