import { z } from 'zod';
import { INITIATIVE_STATUSES } from '@/types/environmental.interface';

const optionalNonNegative = z
  .string()
  .optional()
  .refine((value) => !value || Number(value) >= 0, 'Must be zero or more');

export const initiativeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  departmentId: z.string().optional(),
  assigneeEmployeeId: z.string().optional(),
  estimatedCo2Reduction: optionalNonNegative,
  actualCo2Reduction: optionalNonNegative,
  progress: z
    .string()
    .optional()
    .refine(
      (value) => !value || (Number(value) >= 0 && Number(value) <= 100),
      'Progress must be between 0 and 100',
    ),
  deadline: z.string().optional(),
  status: z.enum(INITIATIVE_STATUSES),
});

export type InitiativeSchema = z.infer<typeof initiativeSchema>;
