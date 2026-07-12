import { z } from 'zod';

const weightSchema = z.coerce
  .number({ message: 'Enter a number' })
  .min(0, 'Must be at least 0')
  .max(1, 'Must be at most 1');

export const esgWeightsSchema = z.object({
  e: weightSchema,
  s: weightSchema,
  g: weightSchema,
});

export type EsgWeightsSchema = z.infer<typeof esgWeightsSchema>;

export const sumsToOne = (weights: EsgWeightsSchema): boolean =>
  Math.abs(weights.e + weights.s + weights.g - 1) < 0.001;
