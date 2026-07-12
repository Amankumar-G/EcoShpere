import { apiClient } from '@/lib/axios/api-client';
import { Gas, GasPayload } from '@/types/gas.interface';

export const getGases = async (): Promise<Gas[]> => {
  const { data } = await apiClient.get<Gas[]>('/gases');
  return data;
};

export const createGas = async (payload: GasPayload): Promise<Gas> => {
  const { data } = await apiClient.post<Gas>('/gases', payload);
  return data;
};

export const updateGas = async (
  id: number,
  payload: GasPayload,
): Promise<Gas> => {
  const { data } = await apiClient.patch<Gas>(`/gases/${id}`, payload);
  return data;
};

export const deleteGas = async (id: number): Promise<void> => {
  await apiClient.delete(`/gases/${id}`);
};
