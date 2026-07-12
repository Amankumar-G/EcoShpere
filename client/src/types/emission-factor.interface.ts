export type ComputeMethod = 'physical' | 'monetary';

/** Activity type a gas line describes (Odoo-derived vocabulary). */
export const ACTIVITY_TYPES = [
  'production',
  'transport',
  'use',
  'other',
] as const;

/**
 * Mass-unit vocabulary for a gas line's `unit` — the amount of that gas emitted
 * per unit of activity. Distinct from the factor's UoM (kWh/L/km/…), since the
 * CO2e identity `value * gwp` is a mass. kg is the default.
 */
export const GAS_QUANTITY_UNITS = ['kg', 'g', 't'] as const;

export interface EmissionFactorGasLine {
  id: number;
  emissionFactorId: number;
  gasId: number;
  gas: { id: number; name: string; symbol: string; gwp: number };
  activityType: string | null;
  value: number;
  unit: string;
}

export interface EmissionFactor {
  id: number;
  name: string;
  scopeId: number;
  scope: { id: number; name: string; code: string };
  sourceDatabaseId: number;
  sourceDatabase: { id: number; name: string };
  uncertainty: number | null;
  computeMethod: ComputeMethod;
  unitOfMeasure: string;
  status: string;
  value: number;
  gasLines: EmissionFactorGasLine[];
}

export interface EmissionFactorPayload {
  name: string;
  scopeId: number;
  sourceDatabaseId: number;
  computeMethod: ComputeMethod;
  unitOfMeasure: string;
  uncertainty?: number;
  status?: string;
}

export interface GasLinePayload {
  gasId: number;
  activityType?: string;
  value: number;
  unit: string;
}
