import { apiClient } from '@/lib/axios/api-client';
import { Initiative, InitiativePayload } from '@/types/environmental.interface';

export const getInitiatives = async (): Promise<Initiative[]> => {
  const { data } = await apiClient.get<Initiative[]>('/initiatives');
  return data;
};

export const createInitiative = async (
  payload: InitiativePayload,
): Promise<Initiative> => {
  const { data } = await apiClient.post<Initiative>('/initiatives', payload);
  return data;
};

export const updateInitiative = async (
  id: number,
  payload: InitiativePayload,
): Promise<Initiative> => {
  const { data } = await apiClient.patch<Initiative>(
    `/initiatives/${id}`,
    payload,
  );
  return data;
};

export const deleteInitiative = async (id: number): Promise<void> => {
  await apiClient.delete(`/initiatives/${id}`);
};
