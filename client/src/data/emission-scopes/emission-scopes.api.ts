import { apiClient } from '@/lib/axios/api-client';
import {
  EmissionScope,
  EmissionScopePayload,
} from '@/types/emission-scope.interface';

export const getEmissionScopeTree = async (): Promise<EmissionScope[]> => {
  const { data } = await apiClient.get<EmissionScope[]>('/emission-scopes');
  return data;
};

export const createEmissionScope = async (
  payload: EmissionScopePayload,
): Promise<EmissionScope> => {
  const { data } = await apiClient.post<EmissionScope>(
    '/emission-scopes',
    payload,
  );
  return data;
};

export const updateEmissionScope = async (
  id: number,
  payload: EmissionScopePayload,
): Promise<EmissionScope> => {
  const { data } = await apiClient.patch<EmissionScope>(
    `/emission-scopes/${id}`,
    payload,
  );
  return data;
};

export const deleteEmissionScope = async (id: number): Promise<void> => {
  await apiClient.delete(`/emission-scopes/${id}`);
};
