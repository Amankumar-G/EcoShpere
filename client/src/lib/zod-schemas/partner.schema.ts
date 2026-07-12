import { z } from 'zod';
import { PARTNER_TYPES } from '@/types/partner.interface';
import { RECORD_STATUSES } from '@/types/records.interface';

export const partnerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(PARTNER_TYPES),
  email: z
    .string()
    .email('Enter a valid email address')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  status: z.enum(RECORD_STATUSES),
});

export type PartnerSchema = z.infer<typeof partnerSchema>;
