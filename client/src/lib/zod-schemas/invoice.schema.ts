import { z } from 'zod';
import { UNITS_OF_MEASURE } from '@/types/records.interface';

export const invoiceLineSchema = z.object({
  productId: z.string().optional(),
  accountId: z.string().min(1, 'Account is required'),
  description: z.string().optional(),
  quantity: z
    .string()
    .min(1, 'Required')
    .refine((value) => Number(value) >= 0, 'Must be ≥ 0'),
  uom: z.enum(UNITS_OF_MEASURE),
  unitPrice: z
    .string()
    .min(1, 'Required')
    .refine((value) => Number(value) >= 0, 'Must be ≥ 0'),
});

export const invoiceSchema = z.object({
  partnerId: z.string().min(1, 'Partner is required'),
  date: z.string().min(1, 'Date is required'),
  currency: z.string().min(1, 'Currency is required'),
  lines: z.array(invoiceLineSchema).min(1, 'Add at least one line'),
});

export type InvoiceSchema = z.infer<typeof invoiceSchema>;
