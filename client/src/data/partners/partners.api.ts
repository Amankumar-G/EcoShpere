import { apiClient } from '@/lib/axios/api-client';
import { Partner, PartnerPayload } from '@/types/partner.interface';
import { CsvImportResult } from '@/types/records.interface';

export const getPartners = async (): Promise<Partner[]> => {
  const { data } = await apiClient.get<Partner[]>('/partners');
  return data;
};

export const createPartner = async (
  payload: PartnerPayload,
): Promise<Partner> => {
  const { data } = await apiClient.post<Partner>('/partners', payload);
  return data;
};

export const updatePartner = async (
  id: number,
  payload: PartnerPayload,
): Promise<Partner> => {
  const { data } = await apiClient.patch<Partner>(`/partners/${id}`, payload);
  return data;
};

export const deletePartner = async (id: number): Promise<void> => {
  await apiClient.delete(`/partners/${id}`);
};

export const importPartnersCsv = async (
  csv: string,
): Promise<CsvImportResult> => {
  const { data } = await apiClient.post<CsvImportResult>('/partners/import', {
    csv,
  });
  return data;
};
