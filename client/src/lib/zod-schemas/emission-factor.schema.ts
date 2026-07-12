import { z } from 'zod';

export const emissionFactorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  scopeId: z.string().min(1, 'Scope is required'),
  sourceDatabaseId: z.string().min(1, 'Source database is required'),
  computeMethod: z.enum(['physical', 'monetary']),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  uncertainty: z.string(),
  status: z.string().min(1, 'Status is required'),
});

export type EmissionFactorSchema = z.infer<typeof emissionFactorSchema>;

export const gasLineSchema = z.object({
  gasId: z.coerce.number().int().positive('Gas is required'),
  value: z.coerce.number().positive('Value must be positive'),
  unit: z.string().min(1, 'Unit is required'),
  activityType: z.string(),
});

export type GasLineSchema = z.infer<typeof gasLineSchema>;
