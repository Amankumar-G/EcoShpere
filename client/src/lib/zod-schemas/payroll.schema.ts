import { z } from 'zod';
import { CONTRACT_TYPES, LEADERSHIP_LEVELS } from '@/types/payroll.interface';

const LEADERSHIP_OPTIONS = ['', ...LEADERSHIP_LEVELS] as const;

export const payrollSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  jobPosition: z.string().min(1, 'Job position is required'),
  contractType: z.enum(CONTRACT_TYPES),
  leadershipLevel: z.enum(LEADERSHIP_OPTIONS),
  country: z.string().optional(),
  wage: z
    .string()
    .min(1, 'Wage is required')
    .refine((value) => Number(value) > 0, 'Wage must be greater than 0'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
});

export type PayrollSchema = z.infer<typeof payrollSchema>;
