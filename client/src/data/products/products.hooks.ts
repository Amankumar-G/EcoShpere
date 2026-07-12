import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProduct,
  deleteProduct,
  getProducts,
  importProductsCsv,
  updateProduct,
} from '@/data/products/products.api';
import { ProductPayload } from '@/types/product.interface';

export const productsQueryKeys = {
  list: ['products', 'list'] as const,
};

export const useProducts = () =>
  useQuery({ queryKey: productsQueryKeys.list, queryFn: getProducts });

const useInvalidateProducts = () => {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: productsQueryKeys.list });
};

export const useCreateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (payload: ProductPayload) => createProduct(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductPayload }) =>
      updateProduct(id, payload),
    onSuccess: invalidate,
  });
};

export const useDeleteProduct = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: invalidate,
  });
};

export const useImportProductsCsv = () => {
  const invalidate = useInvalidateProducts();
  return useMutation({
    mutationFn: (csv: string) => importProductsCsv(csv),
    onSuccess: invalidate,
  });
};
