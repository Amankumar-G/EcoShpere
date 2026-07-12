import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createFleetModel,
  createFleetVehicle,
  deleteFleetModel,
  deleteFleetVehicle,
  getFleetModels,
  getFleetVehicles,
  importFleetModelsCsv,
  updateFleetModel,
  updateFleetVehicle,
} from '@/data/fleet/fleet.api';
import {
  FleetVehicleModelPayload,
  FleetVehiclePayload,
} from '@/types/fleet.interface';

export const fleetQueryKeys = {
  models: ['fleet', 'models'] as const,
  vehicles: ['fleet', 'vehicles'] as const,
};

// ── Vehicle models ──────────────────────────────────────────────────────────

export const useFleetModels = () =>
  useQuery({ queryKey: fleetQueryKeys.models, queryFn: getFleetModels });

export const useCreateFleetModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FleetVehicleModelPayload) =>
      createFleetModel(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.models }),
  });
};

export const useUpdateFleetModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: FleetVehicleModelPayload;
    }) => updateFleetModel(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.models }),
  });
};

export const useDeleteFleetModel = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFleetModel(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.models }),
  });
};

export const useImportFleetModelsCsv = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) => importFleetModelsCsv(csv),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.models }),
  });
};

// ── Vehicle assignments ─────────────────────────────────────────────────────

export const useFleetVehicles = () =>
  useQuery({ queryKey: fleetQueryKeys.vehicles, queryFn: getFleetVehicles });

export const useCreateFleetVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FleetVehiclePayload) => createFleetVehicle(payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.vehicles }),
  });
};

export const useUpdateFleetVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<FleetVehiclePayload>;
    }) => updateFleetVehicle(id, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.vehicles }),
  });
};

export const useDeleteFleetVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteFleetVehicle(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: fleetQueryKeys.vehicles }),
  });
};
