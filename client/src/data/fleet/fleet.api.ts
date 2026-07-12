import { apiClient } from '@/lib/axios/api-client';
import {
  FleetVehicle,
  FleetVehicleModel,
  FleetVehicleModelPayload,
  FleetVehiclePayload,
} from '@/types/fleet.interface';
import { CsvImportResult } from '@/types/records.interface';

// ── Vehicle models ──────────────────────────────────────────────────────────

export const getFleetModels = async (): Promise<FleetVehicleModel[]> => {
  const { data } = await apiClient.get<FleetVehicleModel[]>('/fleet/models');
  return data;
};

export const createFleetModel = async (
  payload: FleetVehicleModelPayload,
): Promise<FleetVehicleModel> => {
  const { data } = await apiClient.post<FleetVehicleModel>(
    '/fleet/models',
    payload,
  );
  return data;
};

export const updateFleetModel = async (
  id: number,
  payload: FleetVehicleModelPayload,
): Promise<FleetVehicleModel> => {
  const { data } = await apiClient.patch<FleetVehicleModel>(
    `/fleet/models/${id}`,
    payload,
  );
  return data;
};

export const deleteFleetModel = async (id: number): Promise<void> => {
  await apiClient.delete(`/fleet/models/${id}`);
};

export const importFleetModelsCsv = async (
  csv: string,
): Promise<CsvImportResult> => {
  const { data } = await apiClient.post<CsvImportResult>(
    '/fleet/models/import',
    {
      csv,
    },
  );
  return data;
};

// ── Vehicle assignments ─────────────────────────────────────────────────────

export const getFleetVehicles = async (): Promise<FleetVehicle[]> => {
  const { data } = await apiClient.get<FleetVehicle[]>('/fleet/vehicles');
  return data;
};

export const createFleetVehicle = async (
  payload: FleetVehiclePayload,
): Promise<FleetVehicle> => {
  const { data } = await apiClient.post<FleetVehicle>(
    '/fleet/vehicles',
    payload,
  );
  return data;
};

export const updateFleetVehicle = async (
  id: number,
  payload: Partial<FleetVehiclePayload>,
): Promise<FleetVehicle> => {
  const { data } = await apiClient.patch<FleetVehicle>(
    `/fleet/vehicles/${id}`,
    payload,
  );
  return data;
};

export const deleteFleetVehicle = async (id: number): Promise<void> => {
  await apiClient.delete(`/fleet/vehicles/${id}`);
};
