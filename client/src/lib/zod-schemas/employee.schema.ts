import { z } from 'zod';
import { GENDERS } from '@/types/employee.interface';

const GENDER_OPTIONS = ['', ...GENDERS] as const;

const baseEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Enter a valid email address'),
  password: z.string(),
  role: z.enum(['admin', 'manager', 'employee']),
  departmentId: z.string(),
  gender: z.enum(GENDER_OPTIONS),
  dob: z.string(),
  homeWorkDistance: z.string(),
});

export const buildEmployeeSchema = (isEditing: boolean) =>
  baseEmployeeSchema.superRefine((values, ctx) => {
    if (!isEditing && values.password.length < 8) {
      ctx.addIssue({
        code: 'custom',
        path: ['password'],
        message: 'Password must be at least 8 characters',
      });
    }
  });

export type EmployeeSchema = z.infer<typeof baseEmployeeSchema>;
