import { z } from 'zod';
import { GOAL_STATUSES } from '@/types/environmental.interface';

export const environmentalGoalSchema = z.object({
  departmentId: z.string().optional(),
  metric: z.string().min(1, 'Metric is required'),
  targetValue: z
    .string()
    .min(1, 'Target value is required')
    .refine((value) => Number(value) >= 0, 'Target must be zero or more'),
  unit: z.string().min(1, 'Unit is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  status: z.enum(GOAL_STATUSES),
});

export type EnvironmentalGoalSchema = z.infer<typeof environmentalGoalSchema>;
