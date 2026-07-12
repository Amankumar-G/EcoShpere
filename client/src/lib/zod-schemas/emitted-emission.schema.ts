import { z } from 'zod';

export const dateFieldSchema = z.coerce.date({
  message: 'Enter a valid date',
});

export const emittedEmissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  emissionFactorId: z.string().min(1, 'Factor is required'),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  date: dateFieldSchema,
  departmentId: z.string().min(1, 'Department is required'),
  evidenceUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  businessTravelRefId: z.string().optional(),
});

export type EmittedEmissionSchema = z.infer<typeof emittedEmissionSchema>;
