import { z } from 'zod';
import { ACCOUNT_TYPES } from '@/types/account.interface';
import { RECORD_STATUSES } from '@/types/records.interface';

export const accountSchema = z.object({
  code: z.string().min(1, 'Code is required'),
  name: z.string().min(1, 'Name is required'),
  type: z.enum(ACCOUNT_TYPES),
  status: z.enum(RECORD_STATUSES),
});

export type AccountSchema = z.infer<typeof accountSchema>;
