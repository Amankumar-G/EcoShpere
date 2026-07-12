import { apiClient } from '@/lib/axios/api-client';
import {
  EmittedEmission,
  EmittedEmissionPayload,
  EmissionSourceType,
} from '@/types/emitted-emission.interface';

export type EmittedEmissionListFilters = {
  scopeId?: number;
  departmentId?: number;
  sourceType?: EmissionSourceType;
  from?: string;
  to?: string;
};

export const getEmittedEmissions = async (
  filters: EmittedEmissionListFilters = {},
): Promise<EmittedEmission[]> => {
  const { data } = await apiClient.get<EmittedEmission[]>(
    '/emitted-emissions',
    { params: filters },
  );
  return data;
};

export const createEmittedEmission = async (
  payload: EmittedEmissionPayload,
): Promise<EmittedEmission> => {
  const { data } = await apiClient.post<EmittedEmission>(
    '/emitted-emissions',
    payload,
  );
  return data;
};

export type FootprintGroupBy = 'scope' | 'department' | 'period';

export type FootprintFilters = {
  groupBy: FootprintGroupBy;
  scopeId?: number;
  departmentId?: number;
  from?: string;
  to?: string;
};

export type FootprintGroup = {
  key: number | string;
  label: string;
  co2eValue: number;
};

export const getEmissionsFootprint = async (
  filters: FootprintFilters,
): Promise<FootprintGroup[]> => {
  const { data } = await apiClient.get<FootprintGroup[]>(
    '/emitted-emissions/footprint',
    { params: filters },
  );
  return data;
};
