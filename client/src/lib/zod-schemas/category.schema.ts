import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['csr_activity', 'challenge']),
});

export type CategorySchema = z.infer<typeof categorySchema>;
