import { z } from 'zod';
import { UNITS_OF_MEASURE, RECORD_STATUSES } from '@/types/records.interface';
import {
  ACTIVITY_TYPES,
  GAS_QUANTITY_UNITS,
} from '@/types/emission-factor.interface';

export const emissionFactorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  scopeId: z.string().min(1, 'Scope is required'),
  sourceDatabaseId: z.string().min(1, 'Source database is required'),
  computeMethod: z.enum(['physical', 'monetary']),
  unitOfMeasure: z.enum(UNITS_OF_MEASURE, {
    message: 'Unit of measure is required',
  }),
  uncertainty: z.string(),
  status: z.enum(RECORD_STATUSES, { message: 'Status is required' }),
});

export type EmissionFactorSchema = z.infer<typeof emissionFactorSchema>;

export const gasLineSchema = z.object({
  gasId: z.coerce.number().int().positive('Gas is required'),
  value: z.coerce.number().positive('Value must be positive'),
  unit: z.enum(GAS_QUANTITY_UNITS, { message: 'Unit is required' }),
  activityType: z.enum(['', ...ACTIVITY_TYPES]),
});

export type GasLineSchema = z.infer<typeof gasLineSchema>;
