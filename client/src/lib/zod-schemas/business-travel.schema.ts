import { z } from 'zod';
import { TRAVEL_MODES } from '@/types/business-travel.interface';

export const businessTravelSchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  mode: z.enum(TRAVEL_MODES),
  origin: z.string().optional(),
  destination: z.string().optional(),
  distanceKm: z.string().optional(),
  date: z.string().min(1, 'Date is required'),
  purpose: z.string().optional(),
});

export type BusinessTravelSchema = z.infer<typeof businessTravelSchema>;
