/**
 * Controlled unit-of-measure vocabulary. A physical emission factor's UoM must
 * match the linked product's UoM (Phase 2), so all quantity-bearing records are
 * restricted to this list at the DTO layer.
 */
export const UNITS_OF_MEASURE = [
  'kWh',
  'L',
  'km',
  'kg',
  'unit',
  'ream',
  'm3',
] as const;

export type UnitOfMeasure = (typeof UNITS_OF_MEASURE)[number];
