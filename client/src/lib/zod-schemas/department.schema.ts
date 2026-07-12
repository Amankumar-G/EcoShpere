import { z } from 'zod';

export const departmentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string(),
  headEmployeeId: z.string(),
});

export type DepartmentSchema = z.infer<typeof departmentSchema>;
