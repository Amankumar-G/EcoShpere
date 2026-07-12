/**
 * Odoo-derived vocabulary for an emission factor gas line's `activityType`.
 */
export const ACTIVITY_TYPES = [
  'production',
  'transport',
  'use',
  'other',
] as const;

export type ActivityType = (typeof ACTIVITY_TYPES)[number];

/**
 * Mass-unit vocabulary for a gas line's `unit` — the amount of that gas emitted
 * per unit of activity. Distinct from the factor's UoM (kWh/L/km/…): since the
 * CO2e identity `value * gwp` is a mass, gas lines are expressed in mass units.
 */
export const GAS_QUANTITY_UNITS = ['kg', 'g', 't'] as const;

export type GasQuantityUnit = (typeof GAS_QUANTITY_UNITS)[number];
