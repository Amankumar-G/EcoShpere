import { z } from 'zod';

export const gasSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  symbol: z.string().min(1, 'Symbol is required'),
  gwp: z.coerce.number().positive('GWP must be positive'),
});

export type GasSchema = z.infer<typeof gasSchema>;
