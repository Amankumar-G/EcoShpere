import { apiClient } from '@/lib/axios/api-client';
import {
  BusinessTravel,
  BusinessTravelPayload,
} from '@/types/business-travel.interface';

export const getBusinessTravels = async (): Promise<BusinessTravel[]> => {
  const { data } = await apiClient.get<BusinessTravel[]>('/business-travels');
  return data;
};

export const createBusinessTravel = async (
  payload: BusinessTravelPayload,
): Promise<BusinessTravel> => {
  const { data } = await apiClient.post<BusinessTravel>(
    '/business-travels',
    payload,
  );
  return data;
};

export const updateBusinessTravel = async (
  id: number,
  payload: BusinessTravelPayload,
): Promise<BusinessTravel> => {
  const { data } = await apiClient.patch<BusinessTravel>(
    `/business-travels/${id}`,
    payload,
  );
  return data;
};

export const deleteBusinessTravel = async (id: number): Promise<void> => {
  await apiClient.delete(`/business-travels/${id}`);
};
