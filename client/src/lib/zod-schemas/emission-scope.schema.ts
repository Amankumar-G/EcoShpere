import { z } from 'zod';

export const emissionScopeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  parentId: z.string(),
});

export type EmissionScopeSchema = z.infer<typeof emissionScopeSchema>;
