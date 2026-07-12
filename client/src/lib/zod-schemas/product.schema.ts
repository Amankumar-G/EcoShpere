import { z } from 'zod';
import { RECORD_STATUSES, UNITS_OF_MEASURE } from '@/types/records.interface';

export const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  code: z.string().min(1, 'Code is required'),
  uom: z.enum(UNITS_OF_MEASURE),
  defaultAccountId: z.string(),
  status: z.enum(RECORD_STATUSES),
});

export type ProductSchema = z.infer<typeof productSchema>;
