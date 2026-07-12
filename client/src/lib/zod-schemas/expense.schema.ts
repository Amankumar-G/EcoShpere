import { z } from 'zod';
import { UNITS_OF_MEASURE } from '@/types/records.interface';

const UOM_OPTIONS = ['', ...UNITS_OF_MEASURE] as const;

export const expenseSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  date: z.string().min(1, 'Date is required'),
  accountId: z.string().optional(),
  productId: z.string().optional(),
  description: z.string().optional(),
  quantity: z.string().optional(),
  uom: z.enum(UOM_OPTIONS),
  amount: z
    .string()
    .min(1, 'Amount is required')
    .refine((value) => Number(value) >= 0, 'Amount must be zero or more'),
});

export type ExpenseSchema = z.infer<typeof expenseSchema>;
