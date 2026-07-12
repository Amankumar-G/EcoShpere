import { apiClient } from '@/lib/axios/api-client';
import {
  EmissionFactor,
  EmissionFactorPayload,
  EmissionFactorGasLine,
  GasLinePayload,
} from '@/types/emission-factor.interface';

export type EmissionFactorListFilters = {
  scopeId?: number;
  sourceDatabaseId?: number;
};

export const getEmissionFactors = async (
  filters: EmissionFactorListFilters = {},
): Promise<EmissionFactor[]> => {
  const { data } = await apiClient.get<EmissionFactor[]>('/emission-factors', {
    params: filters,
  });
  return data;
};

export const getEmissionFactor = async (
  id: number,
): Promise<EmissionFactor> => {
  const { data } = await apiClient.get<EmissionFactor>(
    `/emission-factors/${id}`,
  );
  return data;
};

export const createEmissionFactor = async (
  payload: EmissionFactorPayload,
): Promise<EmissionFactor> => {
  const { data } = await apiClient.post<EmissionFactor>(
    '/emission-factors',
    payload,
  );
  return data;
};

export const updateEmissionFactor = async (
  id: number,
  payload: Partial<EmissionFactorPayload>,
): Promise<EmissionFactor> => {
  const { data } = await apiClient.patch<EmissionFactor>(
    `/emission-factors/${id}`,
    payload,
  );
  return data;
};

export const deleteEmissionFactor = async (id: number): Promise<void> => {
  await apiClient.delete(`/emission-factors/${id}`);
};

export const addGasLine = async (
  factorId: number,
  payload: GasLinePayload,
): Promise<EmissionFactorGasLine> => {
  const { data } = await apiClient.post<EmissionFactorGasLine>(
    `/emission-factors/${factorId}/gas-lines`,
    payload,
  );
  return data;
};

export const updateGasLine = async (
  factorId: number,
  lineId: number,
  payload: Partial<GasLinePayload>,
): Promise<EmissionFactorGasLine> => {
  const { data } = await apiClient.patch<EmissionFactorGasLine>(
    `/emission-factors/${factorId}/gas-lines/${lineId}`,
    payload,
  );
  return data;
};

export const removeGasLine = async (
  factorId: number,
  lineId: number,
): Promise<void> => {
  await apiClient.delete(`/emission-factors/${factorId}/gas-lines/${lineId}`);
};
