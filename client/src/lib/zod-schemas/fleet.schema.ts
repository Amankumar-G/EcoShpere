import { z } from 'zod';
import { RECORD_STATUSES } from '@/types/records.interface';

export const fleetModelSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  co2Emissions: z
    .string()
    .min(1, 'CO₂ emissions are required')
    .refine((value) => Number(value) >= 0, 'Must be a non-negative number'),
  status: z.enum(RECORD_STATUSES),
});

export type FleetModelSchema = z.infer<typeof fleetModelSchema>;

export const fleetVehicleSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  modelId: z.string().min(1, 'Model is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
});

export type FleetVehicleSchema = z.infer<typeof fleetVehicleSchema>;
