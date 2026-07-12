import { apiClient } from '@/lib/axios/api-client';
import { Product, ProductPayload } from '@/types/product.interface';
import { CsvImportResult } from '@/types/records.interface';

export const getProducts = async (): Promise<Product[]> => {
  const { data } = await apiClient.get<Product[]>('/products');
  return data;
};

export const createProduct = async (
  payload: ProductPayload,
): Promise<Product> => {
  const { data } = await apiClient.post<Product>('/products', payload);
  return data;
};

export const updateProduct = async (
  id: number,
  payload: ProductPayload,
): Promise<Product> => {
  const { data } = await apiClient.patch<Product>(`/products/${id}`, payload);
  return data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await apiClient.delete(`/products/${id}`);
};

export const importProductsCsv = async (
  csv: string,
): Promise<CsvImportResult> => {
  const { data } = await apiClient.post<CsvImportResult>('/products/import', {
    csv,
  });
  return data;
};
