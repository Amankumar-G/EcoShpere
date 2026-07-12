import { z } from 'zod';

const optionalIntString = z
  .string()
  .optional()
  .transform((value) => (value ? value : undefined));

export const assignationRuleSchema = z.object({
  emissionFactorId: z.string().min(1, 'Emission factor is required'),
  productId: optionalIntString,
  partnerId: optionalIntString,
  accountId: optionalIntString,
  applicationPeriodStart: z.string().optional(),
  applicationPeriodEnd: z.string().optional(),
  replaceExisting: z.boolean(),
});

export type AssignationRuleSchema = z.infer<typeof assignationRuleSchema>;
